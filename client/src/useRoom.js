// ============================================================
//  useRoom — connects to the authoritative Colyseus server,
//  mirrors synced state into React, and exposes send().
//  The client never decides rules; it sends intents + renders.
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "colyseus.js";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

// Convert Colyseus schema state into a plain JS snapshot for React.
function snapshot(state) {
  const players = [];
  state.players.forEach((p) => players.push({
    id: p.id, name: p.name, seat: p.seat, connected: p.connected,
    score: p.score, skip: p.skip, hint: p.hint, block: p.block,
  }));
  players.sort((a, b) => a.seat - b.seat);
  const chain = [];
  state.chain.forEach((c) => chain.push({ name: c.name, team: c.team, seat: c.seat }));
  const answers = [];
  state.answers.forEach((a) => answers.push(a));
  return {
    phase: state.phase, mode: state.mode, league: state.league,
    turn: state.turn, round: state.round, rounds: state.rounds,
    prompt: state.prompt, promptSub: state.promptSub,
    answers, correct: state.correct, startScore: state.startScore,
    clock: state.clock, blockNext: state.blockNext,
    hintText: state.hintText, message: state.message, messageKind: state.messageKind,
    chain, winner: state.winner, players,
  };
}

export function useRoom() {
  const clientRef = useRef(null);
  const roomRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle|connecting|connected|error|full
  const [error, setError] = useState("");
  const [state, setState] = useState(null);
  const [seat, setSeat] = useState(-1);
  const [roomId, setRoomId] = useState("");

  const attach = useCallback((room) => {
    roomRef.current = room;
    setRoomId(room.roomId);
    setSeat(-1);
    room.onStateChange((s) => setState(snapshot(s)));
    room.onError((code, message) => { setError(message || "room error"); setStatus("error"); });
    room.onLeave(() => setStatus("idle"));
    // our seat: find our sessionId in players once state arrives
    const findSeat = (s) => { const me = s.players.get(room.sessionId); if (me) setSeat(me.seat); };
    room.onStateChange.once((s) => findSeat(s));
    setStatus("connected");
    // persist for reconnect
    try { sessionStorage.setItem("fd_reconnect", room.reconnectionToken); } catch {}
  }, []);

  const create = useCallback(async (name) => {
    setStatus("connecting"); setError("");
    try {
      const client = new Client(SERVER_URL); clientRef.current = client;
      const room = await client.create("game", {});
      attach(room);
      room.send("setName", { name });
      return room.roomId;
    } catch (e) { setError(String(e?.message || e)); setStatus("error"); return null; }
  }, [attach]);

  const join = useCallback(async (id, name) => {
    setStatus("connecting"); setError("");
    try {
      const client = new Client(SERVER_URL); clientRef.current = client;
      const room = await client.joinById(id, {});
      attach(room);
      room.send("setName", { name });
      return true;
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg); setStatus(/full/i.test(msg) ? "full" : "error"); return false;
    }
  }, [attach]);

  const send = useCallback((type, payload) => {
    if (roomRef.current) roomRef.current.send(type, payload || {});
  }, []);

  const leave = useCallback(() => {
    if (roomRef.current) roomRef.current.leave(true);
    roomRef.current = null; setStatus("idle"); setState(null);
  }, []);

  useEffect(() => () => { if (roomRef.current) roomRef.current.leave(); }, []);

  return { status, error, state, seat, roomId, create, join, send, leave, SERVER_URL };
}
