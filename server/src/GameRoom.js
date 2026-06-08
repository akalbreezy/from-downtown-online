// ============================================================
//  GameRoom — AUTHORITATIVE room. All rules + state live here.
//  Clients send INTENTS only; the server validates every move
//  against the real data and broadcasts official state.
// ============================================================
const { Room } = require("colyseus");
const { Schema, MapSchema, ArraySchema, type } = require("@colyseus/schema");
const { LEAGUES, pairKey, median } = require("./data.js");

const CHAIN_BASE = 24, CHAIN_BLOCK = 12;
const LIMITS = { skip: 2, hint: 1, block: 1 };
const ROUNDS = 5;

// ---------- schema (synced state) ----------
class ChainLink extends Schema {}
type("string")(ChainLink.prototype, "name");
type("string")(ChainLink.prototype, "team");
type("int8")(ChainLink.prototype, "seat");

class Player extends Schema {}
type("string")(Player.prototype, "id");
type("string")(Player.prototype, "name");
type("int8")(Player.prototype, "seat");
type("boolean")(Player.prototype, "connected");
type("int16")(Player.prototype, "score");
type("int8")(Player.prototype, "skip");
type("int8")(Player.prototype, "hint");
type("int8")(Player.prototype, "block");

class State extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.chain = new ArraySchema();
    this.answers = new ArraySchema();
  }
}
type("string")(State.prototype, "phase");      // lobby|mode|active|reveal|handoff|over
type("string")(State.prototype, "mode");       // trivia|quirky|darts|chain
type("string")(State.prototype, "league");
type({ map: Player })(State.prototype, "players");
type("int8")(State.prototype, "turn");         // seat whose turn it is
type("int8")(State.prototype, "round");
type("int8")(State.prototype, "rounds");
type("string")(State.prototype, "prompt");     // current player/question text
type("string")(State.prototype, "promptSub");  // stat label / question
type({ array: "string" })(State.prototype, "answers"); // trivia options
type("int8")(State.prototype, "correct");      // revealed correct idx (-1 hidden)
type("int32")(State.prototype, "startScore");  // 501 start
type("int8")(State.prototype, "clock");        // chain shot clock
type("boolean")(State.prototype, "blockNext");
type("string")(State.prototype, "hintText");
type("string")(State.prototype, "message");
type("string")(State.prototype, "messageKind");
type({ array: ChainLink })(State.prototype, "chain");
type("int8")(State.prototype, "winner");       // seat or -1

class GameRoom extends Room {
  onCreate(options) {
    this.maxClients = 2;
    this.setState(new State());
    this.state.phase = "lobby";
    this.state.league = "nba";
    this.state.turn = 0;
    this.state.winner = -1;
    this.state.correct = -1;
    this.state.rounds = ROUNDS;
    this._seats = [null, null];
    this._clockTimer = null;

    this.onMessage("setName", (client, { name }) => {
      const p = this.state.players.get(client.sessionId);
      if (p && typeof name === "string") p.name = name.slice(0, 16) || `Player ${p.seat + 1}`;
    });
    this.onMessage("pickLeague", (client, { league }) => {
      if (this.state.phase !== "lobby" && this.state.phase !== "mode") return;
      if (!LEAGUES[league]) return;
      this.state.league = league;
      this.state.phase = "mode";
    });
    this.onMessage("pickMode", (client, { mode }) => {
      if (this.state.phase !== "mode") return;
      if (!["trivia","quirky","darts","chain"].includes(mode)) return;
      if (this._bothConnected() === false) return;
      this.startMode(mode);
    });
    this.onMessage("answer", (client, msg) => this.handleAnswer(client, msg));
    this.onMessage("guess", (client, msg) => this.handleGuess(client, msg));
    this.onMessage("dart", (client, msg) => this.handleDart(client, msg));
    this.onMessage("chainName", (client, msg) => this.handleChainName(client, msg));
    this.onMessage("lifeline", (client, msg) => this.handleLifeline(client, msg));
    this.onMessage("advance", (client) => this.advanceAfterReveal(client));
    this.onMessage("rematch", (client) => { if (this.state.phase === "over") this.state.phase = "mode"; this.resetCommon(); });
  }

  // ---------- seat / connection ----------
  onJoin(client) {
    let seat = this._seats[0] === null ? 0 : this._seats[1] === null ? 1 : -1;
    if (seat === -1) { throw new Error("Room full"); }
    this._seats[seat] = client.sessionId;
    const p = new Player();
    p.id = client.sessionId; p.seat = seat; p.name = `Player ${seat + 1}`;
    p.connected = true; p.score = 0; p.skip = LIMITS.skip; p.hint = LIMITS.hint; p.block = LIMITS.block;
    this.state.players.set(client.sessionId, p);
  }
  async onLeave(client, consented) {
    const p = this.state.players.get(client.sessionId);
    if (p) p.connected = false;
    try {
      if (consented) throw new Error("left");
      await this.allowReconnection(client, 30);
      const rp = this.state.players.get(client.sessionId);
      if (rp) rp.connected = true;
    } catch (e) {
      if (p) { this._seats[p.seat] = null; this.state.players.delete(client.sessionId); }
    }
  }
  _bothConnected() {
    if (this.state.players.size < 2) return false;
    let ok = true; this.state.players.forEach(p => { if (!p.connected) ok = false; });
    return ok;
  }
  seatOf(client) { const p = this.state.players.get(client.sessionId); return p ? p.seat : -1; }
  isTurn(client) { return this.seatOf(client) === this.state.turn; }
  addScore(seat, n) { this.state.players.forEach(p => { if (p.seat === seat) p.score += n; }); }

  resetCommon() {
    this.state.round = 0; this.state.turn = 0; this.state.winner = -1; this.state.correct = -1;
    this.state.message = ""; this.state.messageKind = ""; this.state.hintText = ""; this.state.blockNext = false;
    this.state.chain.clear(); this.state.answers.clear();
    this.state.players.forEach(p => { p.score = 0; p.skip = LIMITS.skip; p.hint = LIMITS.hint; p.block = LIMITS.block; });
    this.stopClock();
  }

  // ---------- start a mode ----------
  startMode(mode) {
    this.resetCommon();
    this.state.mode = mode;
    const L = LEAGUES[this.state.league];
    if (mode === "trivia") {
      this._plan = this._buildPlan(L.trivia);
      this.state.phase = "handoff";
      this.loadTrivia();
    } else if (mode === "quirky") {
      this._plan = this._buildPlan(L.stat);
      this.state.phase = "handoff";
      this.loadStat();
    } else if (mode === "darts") {
      this._cat = L.darts[Math.floor(Math.random() * L.darts.length)];
      const s = this._startScore(this._cat);
      this.state.startScore = s;
      this.state.players.forEach(p => p.score = s);
      this.state.prompt = String(s); this.state.promptSub = this._cat.label;
      this.state.phase = "active";
      this._dartLog = [[], []];
    } else if (mode === "chain") {
      const names = Object.keys(L.chain);
      const seed = names[Math.floor(Math.random() * names.length)];
      const link = new ChainLink(); link.name = seed; link.team = ""; link.seat = -1;
      this.state.chain.push(link);
      this._used = new Set([seed.toLowerCase()]);
      this.state.prompt = seed;
      this.state.clock = CHAIN_BASE;
      this.state.phase = "active";
      this.startClock();
    }
  }
  _buildPlan(src) {
    let p = this._shuffle(src);
    while (p.length < ROUNDS * 2) p = p.concat(this._shuffle(src));
    return p.slice(0, ROUNDS * 2);
  }
  _shuffle(a){ return [...a].sort(()=>Math.random()-0.5); }
  _startScore(cat){ const med=median(cat.db.map(p=>p.value)); const t=4+Math.floor(Math.random()*3); let raw=med*t; const step=raw>=5000?500:raw>=1000?100:raw>=300?50:raw>=100?10:1; return Math.max(step,Math.round(raw/step)*step); }

  // ---------- TRIVIA ----------
  loadTrivia() {
    const q = this._plan[this.state.round * 2 + this.state.turn];
    this.state.prompt = "TRIVIA";
    this.state.promptSub = q.q;
    this.state.answers.clear(); q.a.forEach(a => this.state.answers.push(a));
    this.state.correct = -1;
    this._curCorrect = q.correct;
  }
  handleAnswer(client, { index }) {
    if (this.state.phase !== "active" || this.state.mode !== "trivia") return;
    if (!this.isTurn(client)) return;
    if (typeof index !== "number" || index < 0 || index >= this.state.answers.length) return;
    this.state.correct = this._curCorrect;
    if (index === this._curCorrect) this.addScore(this.state.turn, 100);
    this.state.phase = "reveal";
  }

  // ---------- STAT LINE ----------
  loadStat() {
    const item = this._plan[this.state.round * 2 + this.state.turn];
    this.state.prompt = item.player;
    this.state.promptSub = item.stat;
    this._curValue = item.value;
    this.state.correct = -1;
  }
  handleGuess(client, { value }) {
    if (this.state.phase !== "active" || this.state.mode !== "quirky") return;
    if (!this.isTurn(client)) return;
    const g = Number(value); if (!isFinite(g)) return;
    const actual = this._curValue;
    const pct = Math.abs(g - actual) / Math.max(actual, 1);
    const earned = Math.max(0, Math.round(100 - pct * 120));
    this.addScore(this.state.turn, earned);
    this.state.correct = 1;
    this.state.message = `Actual ${actual} · +${earned}`;
    this.state.messageKind = "info";
    this._lastEarned = earned; this._lastActual = actual;
    this.state.phase = "reveal";
  }

  advanceAfterReveal(client) {
    if (this.state.phase !== "reveal") return;
    if (!this.isTurn(client)) return;
    this.state.message = ""; this.state.correct = -1;
    if (this.state.turn === 0) { this.state.turn = 1; this.state.phase = "handoff"; }
    else if (this.state.round + 1 >= ROUNDS) { this.finishScored(); }
    else { this.state.round += 1; this.state.turn = 0; this.state.phase = "handoff"; }
    if (this.state.phase === "handoff") {
      if (this.state.mode === "trivia") this.loadTrivia(); else this.loadStat();
    }
  }

  finishScored() {
    this.state.phase = "over";
    let s0=0,s1=0; this.state.players.forEach(p=>{ if(p.seat===0)s0=p.score; else s1=p.score; });
    this.state.winner = s0===s1 ? -1 : (s0>s1?0:1);
    this.stopClock();
  }

  // ---------- 501 ----------
  handleDart(client, { name }) {
    if (this.state.phase !== "active" || this.state.mode !== "darts") return;
    if (!this.isTurn(client)) return;
    const cat = this._cat;
    const rec = cat.db.find(p => p.name.toLowerCase() === String(name||"").toLowerCase().trim());
    if (!rec) { this.msg("Not in this category.", "bad"); return; }
    const seat = this.state.turn;
    let cur = 0; this.state.players.forEach(p=>{ if(p.seat===seat) cur=p.score; });
    const after = cur - rec.value;
    const small = this.state.startScore <= 1000;
    if (after < 0) { this.msg(`${rec.name} (−${rec.value}) — BUST! Turn passes.`, "bad"); this.state.turn = 1 - seat; return; }
    this.state.players.forEach(p=>{ if(p.seat===seat) p.score = after; });
    const won = small ? after === 0 : after <= 10;
    if (won) { this.state.winner = seat; this.state.phase = "over"; this.msg(`${this.nameOf(seat)} checks out!`, "good"); return; }
    this.msg(`${rec.name} −${rec.value}.`, "info");
    this.state.turn = 1 - seat;
  }

  // ---------- THE CHAIN ----------
  startClock() {
    this.stopClock();
    this._clockTimer = this.clock.setInterval(() => {
      if (this.state.phase !== "active" || this.state.mode !== "chain") return;
      this.state.clock -= 1;
      if (this.state.clock <= 0) {
        this.state.clock = 0;
        this.state.winner = 1 - this.state.turn;
        this.state.phase = "over";
        this.msg(`${this.nameOf(this.state.turn)} ran out of time!`, "bad");
        this.stopClock();
      }
    }, 1000);
  }
  stopClock() { if (this._clockTimer) { this._clockTimer.clear(); this._clockTimer = null; } }

  handleChainName(client, { name }) {
    if (this.state.phase !== "active" || this.state.mode !== "chain") return;
    if (!this.isTurn(client)) return;
    const L = LEAGUES[this.state.league];
    const key = String(name||"").toLowerCase().trim(); if (!key) return;
    let canon = null;
    for (const n of Object.keys(L.chain)) if (n.toLowerCase() === key) { canon = n; break; }
    const current = this.state.chain[this.state.chain.length - 1].name;
    if (!canon) { this.msg("Not in the player pool.", "bad"); return; }
    if (this._used.has(canon.toLowerCase())) { this.msg(`${canon} already used. (−2s)`, "bad"); this.state.clock = Math.max(0, this.state.clock - 2); return; }
    const mates = L.chain[current];
    if (!mates || !mates.has(canon)) { this.msg(`✗ ${canon} wasn't a teammate of ${current}. (−2s)`, "bad"); this.state.clock = Math.max(0, this.state.clock - 2); return; }
    const team = L.teams[pairKey(current, canon)] || "";
    const seat = this.state.turn;
    const link = new ChainLink(); link.name = canon; link.team = team; link.seat = seat;
    this.state.chain.push(link);
    this._used.add(canon.toLowerCase());
    this.state.prompt = canon;
    this.msg(`✓ ${canon} played with ${current}${team?` on the ${team}`:""}.`, "good");
    this.state.hintText = "";
    const short = this.state.blockNext; this.state.blockNext = false;
    this.state.turn = 1 - seat;
    this.state.clock = short ? CHAIN_BLOCK : CHAIN_BASE;
  }
  handleLifeline(client, { kind }) {
    if (this.state.phase !== "active" || this.state.mode !== "chain") return;
    if (!this.isTurn(client)) return;
    const seat = this.state.turn; const L = LEAGUES[this.state.league];
    const p = [...this.state.players.values()].find(x => x.seat === seat);
    const current = this.state.chain[this.state.chain.length - 1].name;
    if (kind === "skip" && p.skip > 0) {
      p.skip--; this.msg(`${p.name} skipped — same player carries.`, "info");
      const short = this.state.blockNext; this.state.blockNext = false;
      this.state.turn = 1 - seat; this.state.clock = short ? CHAIN_BLOCK : CHAIN_BASE;
    } else if (kind === "hint" && p.hint > 0) {
      const mates = [...(L.chain[current]||[])].filter(m => !this._used.has(m.toLowerCase()));
      if (!mates.length) { this.msg("No valid teammates remain!", "bad"); return; }
      p.hint--;
      const pick = mates[Math.floor(Math.random()*mates.length)];
      const inits = pick.split(/\s+/).map(w=>w[0].toUpperCase()).join(".") + ".";
      this.state.hintText = `a valid answer has initials ${inits}`;
    } else if (kind === "block" && p.block > 0) {
      p.block--; this.state.blockNext = true;
      this.msg(`${p.name} BLOCKED the opponent — next turn ${CHAIN_BLOCK}s!`, "info");
    }
  }

  // ---------- helpers ----------
  msg(t, k){ this.state.message = t; this.state.messageKind = k; }
  nameOf(seat){ let n=`Player ${seat+1}`; this.state.players.forEach(p=>{if(p.seat===seat)n=p.name;}); return n; }
  onDispose(){ this.stopClock(); }
}

module.exports = { GameRoom };
