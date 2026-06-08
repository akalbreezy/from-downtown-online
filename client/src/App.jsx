import React, { useState, useEffect } from "react";
import { useRoom } from "./useRoom.js";
import { Style, W } from "./ui.jsx";

// ============================================================
//  FROM DOWNTOWN — online client (server-authoritative)
//  Mode-by-mode build. Live now: Lobby/link + TRIVIA.
// ============================================================
export default function App() {
  const room = useRoom();
  const { status, state, seat, roomId } = room;

  // read ?r=ROOMID from the URL for join-by-link
  const [linkId] = useState(() => new URLSearchParams(window.location.search).get("r") || "");

  return (
    <div style={W.root}>
      <Style />
      <div style={W.floor} />
      <header style={W.topbar} className="w-topbar">
        <span style={W.brandFrom}>FROM</span>
        <span style={W.brandDown}>DOWNTOWN</span>
        <span style={W.brandTag}>ONLINE · HEAD-TO-HEAD</span>
      </header>
      <div style={W.stage} className="w-stage">
        {status !== "connected" && <Lobby room={room} linkId={linkId} />}
        {status === "connected" && state && (
          <Game room={room} state={state} seat={seat} roomId={roomId} />
        )}
      </div>
      <footer style={W.footer}>
        <span style={W.footBadge}><span style={W.footBall} /> A <b style={W.footName}>SHORT &amp; WIDE</b> PRODUCTION</span>
      </footer>
    </div>
  );
}

// ---- LOBBY: create or join via link ------------------------
function Lobby({ room, linkId }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState(linkId ? "join" : "home"); // home|create|join
  const [joinId, setJoinId] = useState(linkId);
  const { status, error, create, join } = room;
  const busy = status === "connecting";

  if (mode === "home" && !linkId) {
    return (
      <div style={W.homeWrap} className="w-home">
        <div style={W.homeLeft} className="w-stagger">
          <div style={W.heroPlate}><span style={W.heroFrom}>FROM</span><span style={W.heroDown}>DOWNTOWN</span></div>
          <p style={W.heroBlurb}>Real-time 1-v-1 basketball trivia. Create a game, send your opponent the link, and settle it live — trivia, stat line, 501, and the teammate chain.</p>
          <div style={W.leagueChips}><span style={W.chip}>🏀 NBA</span><span style={W.chip}>🏀 NBL</span><span style={W.chip}>LIVE ONLINE</span></div>
        </div>
        <div style={W.homeRight} className="w-stagger">
          <div style={W.panelHead}>START A GAME</div>
          <input style={W.input} placeholder="Your name" value={name} maxLength={16} onChange={e=>setName(e.target.value)} />
          <button style={W.cta} className="w-pop" disabled={busy} onClick={()=>create(name||"Player 1")}>{busy?"CREATING…":"CREATE GAME →"}</button>
          <div style={W.vsRow}><span style={W.vsBar}/><span style={W.vsTxt}>OR</span><span style={W.vsBar}/></div>
          <button style={W.ctaGhost} className="w-pop" onClick={()=>setMode("join")}>JOIN WITH A CODE</button>
          {error && <div style={W.errLine}>{error}</div>}
        </div>
      </div>
    );
  }
  // join screen (also the landing when arriving via ?r= link)
  return (
    <div style={W.centerCol}>
      <div style={W.joinCard}>
        <div style={W.panelHead}>{linkId ? "JOIN THIS GAME" : "JOIN A GAME"}</div>
        {linkId && <p style={W.subTitle}>You were invited to a 1-v-1. Enter your name to join.</p>}
        <input style={W.input} placeholder="Your name" value={name} maxLength={16} onChange={e=>setName(e.target.value)} />
        {!linkId && <input style={{...W.input, marginTop:10}} placeholder="Game code" value={joinId} onChange={e=>setJoinId(e.target.value.trim())} />}
        <button style={W.cta} className="w-pop" disabled={busy||!joinId} onClick={()=>join(joinId, name||"Player 2")}>{busy?"JOINING…":"JOIN →"}</button>
        {status==="full" && <div style={W.errLine}>That game is already full (2 players max).</div>}
        {error && status!=="full" && <div style={W.errLine}>{error}</div>}
        {!linkId && <button style={W.link} onClick={()=>window.location.reload()}>← back</button>}
      </div>
    </div>
  );
}

// ---- shareable link panel ----------------------------------
function ShareBar({ roomId }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}?r=${roomId}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),1500); } catch {} };
  return (
    <div style={W.shareBar} className="w-share-bar">
      <span style={W.shareLabel}>INVITE LINK</span>
      <input style={W.shareInput} className="w-share-input" readOnly value={url} onFocus={e=>e.target.select()} />
      <button style={W.shareBtn} className="w-pop" onClick={copy}>{copied?"COPIED ✓":"COPY"}</button>
    </div>
  );
}

// ---- GAME shell: waiting / league / mode / play ------------
function Game({ room, state, seat, roomId }) {
  const { send } = room;
  const me = state.players.find(p=>p.seat===seat);
  const opp = state.players.find(p=>p.seat!==seat);
  const bothHere = state.players.length === 2 && state.players.every(p=>p.connected);

  // waiting for opponent
  if (!bothHere) {
    return (
      <div style={W.centerCol}>
        <div style={W.waitCard}>
          <div style={W.panelHead}>WAITING FOR OPPONENT</div>
          <div style={W.spinner} />
          <p style={W.subTitle}>Send this link to whoever you want to play. The game starts the moment they join.</p>
          <ShareBar roomId={roomId} />
          <div style={W.seatNote}>You are <b style={{color: seat===0?"var(--orange)":"var(--teal)"}}>Player {seat+1}</b></div>
        </div>
      </div>
    );
  }

  if (state.phase === "lobby" || state.phase === "mode") {
    return <LeagueAndMode state={state} seat={seat} send={send} roomId={roomId} />;
  }
  if (state.mode === "trivia" && ["handoff","active","reveal"].includes(state.phase)) {
    return <Trivia state={state} seat={seat} send={send} />;
  }
  if (state.mode === "quirky" && ["handoff","active","reveal"].includes(state.phase)) {
    return <StatLine state={state} seat={seat} send={send} />;
  }
  if (state.mode === "darts" && state.phase === "active") {
    return <Darts state={state} seat={seat} send={send} />;
  }
  if (state.mode === "chain" && state.phase === "active") {
    return <Chain state={state} seat={seat} send={send} />;
  }
  if (state.phase === "over") {
    return <Result state={state} seat={seat} send={send} />;
  }
  return null;
}

// ---- league + mode select (only seat 0 drives, both see) ---
function LeagueAndMode({ state, seat, send, roomId }) {
  const host = seat === 0;
  const MODES=[["trivia","🧠","TRIVIA"],["quirky","📊","STAT LINE"],["darts","🎯","501"],["chain","🔗","THE CHAIN"]];
  return (
    <div style={W.centerCol}>
      <ShareBar roomId={roomId} />
      <div style={{height:16}} />
      <div style={W.leagueTag}>{(state.league||"nba").toUpperCase()}</div>
      <h2 style={W.bigTitle}>{host ? "PICK LEAGUE & GAME" : "WAITING FOR HOST"}</h2>
      <p style={W.subTitle}>{host ? "You're the host — choose the league and game." : "Player 1 is choosing the league and game…"}</p>

      <div style={W.leagueRow} className="w-league-row">
        {["nba","nbl"].map(k=>(
          <button key={k} className="w-pop w-tile" style={{...W.leagueCard, opacity: host?1:.6, borderColor: state.league===k?"var(--orange)":"var(--line)"}}
            disabled={!host} onClick={()=>send("pickLeague",{league:k})}>
            <span style={W.leagueAbbr}>{k.toUpperCase()}</span>
          </button>
        ))}
      </div>
      <div style={W.modeGrid} className="w-mode-grid">
        {MODES.map(([id,icon,nm])=>(
          <button key={id} className="w-pop w-tile" style={{...W.modeTile, opacity:host?1:.6}} disabled={!host} onClick={()=>send("pickMode",{mode:id})}>
            <span style={W.modeIcon}>{icon}</span><span style={W.modeName}>{nm}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- TRIVIA (server-authoritative) -------------------------
function Trivia({ state, seat, send }) {
  const myTurn = state.turn === seat;
  const turnName = state.players.find(p=>p.seat===state.turn)?.name || `Player ${state.turn+1}`;
  return (
    <div style={W.broadcast} className="w-broadcast">
      <ScoreRail state={state} seat={seat} />
      <main style={W.mainStage}>
        {state.phase === "handoff" ? (
          <div style={W.handoff}>
            <div style={W.handoffLabel}>NOW UP</div>
            <div style={{...W.handoffName, color: state.turn===0?"var(--orange)":"var(--teal)"}} className="w-handoff-name">{turnName}</div>
            <p style={W.subTitle}>Round {state.round+1} of {state.rounds}</p>
            {myTurn
              ? <button style={W.cta} className="w-pop" onClick={()=>send("advance")}>I'M READY →</button>
              : <div style={W.seatNote}>Waiting for {turnName}…</div>}
          </div>
        ) : (
          <>
            <div style={W.prompt}>
              <span style={W.promptLabel}>TRIVIA · {myTurn?"YOUR QUESTION":`${turnName.toUpperCase()}'S QUESTION`}</span>
              <span style={W.qText}>{state.promptSub}</span>
            </div>
            <div style={W.answerGrid} className="w-answer-grid">
              {state.answers.map((opt,i)=>{
                let bg="var(--surface2)",bd="var(--line)",cl="var(--text)";
                if(state.phase==="reveal" && state.correct>=0){ if(i===state.correct){bg="var(--teal)";bd="var(--teal)";cl="#04221d";} }
                const can = myTurn && state.phase==="active";
                return <button key={i} disabled={!can} style={{...W.answer, background:bg, borderColor:bd, color:cl, opacity: can||state.phase==="reveal"?1:.7}} className="w-pop"
                  onClick={()=>send("answer",{index:i})}><span style={W.ansLetter}>{String.fromCharCode(65+i)}</span>{opt}</button>;
              })}
            </div>
            {state.phase==="reveal" && (myTurn
              ? <button style={W.cta} className="w-pop" onClick={()=>send("advance")}>{state.turn===0?"NEXT PLAYER →":(state.round+1>=state.rounds?"SEE RESULT →":"NEXT ROUND →")}</button>
              : <div style={W.seatNote}>Waiting for {turnName}…</div>)}
          </>
        )}
      </main>
    </div>
  );
}

function ScoreRail({ state, seat }) {
  return (
    <aside style={W.rail} className="w-rail">
      <div style={W.scorebd} className="w-scoreboard">
        <div style={W.scorebdHead}>SCORE · RD {Math.min(state.round+1,state.rounds)}/{state.rounds}</div>
        <div className="w-score-rows">
          {state.players.map(p=>{
            const c = p.seat===0?"var(--orange)":"var(--teal)";
            const up = state.turn===p.seat;
            return (
              <div key={p.seat} style={{...W.scoreRow, borderColor:c, opacity:up?1:.6, boxShadow:up?`0 0 0 1px ${c}`:"none"}} className="w-score-row">
                <div style={{flex:1}}>
                  <div style={W.scoreName}>{p.name}{p.seat===seat?" (you)":""}{!p.connected?" ⚠":""}</div>
                  <div style={{...W.scoreState,color:c}}>{up?"● ON THE CLOCK":"WAITING"}</div>
                </div>
                <div style={{...W.scoreNum,color:c}} className="w-score-num">{p.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

// ---- STAT LINE (server-authoritative) ----------------------
function StatLine({ state, seat, send }) {
  const [guess, setGuess] = useState("");
  const myTurn = state.turn === seat;
  const turnName = state.players.find(p=>p.seat===state.turn)?.name || `Player ${state.turn+1}`;

  const submit = () => {
    const v = parseFloat(guess);
    if (!isFinite(v)) return;
    send("guess", { value: v });
    setGuess("");
  };

  return (
    <div style={W.broadcast} className="w-broadcast">
      <ScoreRail state={state} seat={seat} />
      <main style={W.mainStage}>
        {state.phase === "handoff" ? (
          <div style={W.handoff}>
            <div style={W.handoffLabel}>NOW UP</div>
            <div style={{...W.handoffName, color: state.turn===0?"var(--orange)":"var(--teal)"}} className="w-handoff-name">{turnName}</div>
            <p style={W.subTitle}>Round {state.round+1} of {state.rounds}</p>
            {myTurn
              ? <button style={W.cta} className="w-pop" onClick={()=>send("advance")}>I'M READY →</button>
              : <div style={W.seatNote}>Waiting for {turnName}…</div>}
          </div>
        ) : (
          <>
            <div style={W.prompt}>
              <span style={W.promptLabel}>STAT LINE · {myTurn?"YOUR TURN":`${turnName.toUpperCase()}'S TURN`}</span>
              <span style={W.qText}>{state.prompt}</span>
              <span style={W.promptStatSub}>{state.promptSub}</span>
            </div>
            {state.phase === "active" && myTurn && (
              <div style={W.guessRow} className="w-guess-row">
                <input style={{...W.input, flex:1, marginTop:0}} type="number" placeholder="Your guess…" value={guess}
                  onChange={e=>setGuess(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") submit(); }} />
                <button style={{...W.cta, marginTop:0, width:"auto", padding:"15px 28px"}} className="w-pop" onClick={submit}>LOCK IN →</button>
              </div>
            )}
            {state.phase === "active" && !myTurn && (
              <div style={W.seatNote}>Waiting for {turnName} to guess…</div>
            )}
            {state.phase === "reveal" && (
              <div style={W.revealBox}>
                <div style={W.revealLabel}>RESULT</div>
                <div style={W.revealMsg}>{state.message}</div>
                {myTurn
                  ? <button style={W.cta} className="w-pop" onClick={()=>send("advance")}>{state.turn===0?"NEXT PLAYER →":(state.round+1>=state.rounds?"SEE RESULT →":"NEXT ROUND →")}</button>
                  : <div style={W.seatNote}>Waiting for {turnName}…</div>}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ---- 501 DARTS (server-authoritative) ----------------------
function Darts({ state, seat, send }) {
  const [dartName, setDartName] = useState("");
  const myTurn = state.turn === seat;
  const turnName = state.players.find(p=>p.seat===state.turn)?.name || `Player ${state.turn+1}`;

  const submit = () => {
    if (!dartName.trim()) return;
    send("dart", { name: dartName.trim() });
    setDartName("");
  };

  return (
    <div style={W.broadcast} className="w-broadcast">
      <ScoreRail state={state} seat={seat} />
      <main style={W.mainStage}>
        <div style={W.prompt}>
          <span style={W.promptLabel}>501 · {state.promptSub}</span>
          <span style={W.qText}>NAME A PLAYER — THEIR STAT COUNTS DOWN</span>
        </div>
        <div style={W.dartScores} className="w-dart-scores">
          {state.players.map(p=>(
            <div key={p.seat} style={{...W.dartScoreCol, borderColor:p.seat===0?"var(--orange)":"var(--teal)", opacity:state.turn===p.seat?1:.5}}>
              <div style={W.dartName}>{p.name}{p.seat===seat?" (you)":""}</div>
              <div style={{...W.dartNum, color:p.seat===0?"var(--orange)":"var(--teal)"}}>{p.score}</div>
              {state.turn===p.seat && <div style={W.onClock}>● ON THE CLOCK</div>}
            </div>
          ))}
        </div>
        {state.message && (
          <div style={{...W.msgBanner, borderColor:state.messageKind==="bad"?"var(--red)":state.messageKind==="good"?"var(--teal)":"var(--line)", color:state.messageKind==="bad"?"var(--red)":state.messageKind==="good"?"var(--teal)":"var(--text)"}}>
            {state.message}
          </div>
        )}
        {myTurn ? (
          <div style={W.guessRow} className="w-guess-row">
            <input style={{...W.input, flex:1, marginTop:0}} placeholder="Player name…" value={dartName}
              onChange={e=>setDartName(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") submit(); }} />
            <button style={{...W.cta, marginTop:0, width:"auto", padding:"15px 28px"}} className="w-pop" onClick={submit}>THROW →</button>
          </div>
        ) : (
          <div style={W.seatNote}>{turnName} is throwing…</div>
        )}
      </main>
    </div>
  );
}

// ---- THE CHAIN (server-authoritative) ----------------------
function Chain({ state, seat, send }) {
  const [chainInput, setChainInput] = useState("");
  const myTurn = state.turn === seat;
  const turnName = state.players.find(p=>p.seat===state.turn)?.name || `Player ${state.turn+1}`;
  const me = state.players.find(p=>p.seat===seat);
  const current = state.chain.length > 0 ? state.chain[state.chain.length-1].name : state.prompt;
  const clockColor = state.clock <= 5 ? "var(--red)" : state.clock <= 10 ? "var(--gold)" : "var(--teal)";

  const submit = () => {
    if (!chainInput.trim()) return;
    send("chainName", { name: chainInput.trim() });
    setChainInput("");
  };

  return (
    <div style={W.broadcast}>
      <aside style={W.rail}>
        <div style={W.scorebd}>
          <div style={W.scorebdHead}>SHOT CLOCK</div>
          <div style={{...W.chainClock, color:clockColor, textShadow:`0 0 20px ${clockColor}`}} className="w-chain-clock">{state.clock}</div>
          {state.blockNext && <div style={W.blockedTag}>BLOCKED ⚡</div>}
        </div>
        {me && (
          <div style={W.scorebd}>
            <div style={W.scorebdHead}>YOUR LIFELINES</div>
            <div style={W.lifelineGrid} className="w-lifeline-grid">
              {[["skip","⏭","SKIP",me.skip],["hint","💡","HINT",me.hint],["block","🚫","BLOCK",me.block]].map(([kind,icon,label,count])=>(
                <button key={kind} style={{...W.lifeBtn, opacity:count>0&&myTurn?1:.35}} disabled={!myTurn||count<=0} className="w-pop"
                  onClick={()=>send("lifeline",{kind})}>
                  <span style={W.lifeBtnIcon}>{icon}</span>
                  <span style={W.lifeBtnLabel}>{label}</span>
                  <span style={W.lifeBtnCount}>{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
      <main style={W.mainStage}>
        <div style={W.prompt}>
          <span style={W.promptLabel}>THE CHAIN · {myTurn?"YOUR TURN":`${turnName.toUpperCase()}'S TURN`}</span>
          <span style={W.qText}>NAME A TEAMMATE OF</span>
          <span style={W.chainCurrentName}>{current}</span>
        </div>
        {state.hintText && (
          <div style={{...W.msgBanner, borderColor:"var(--gold)", color:"var(--gold)"}}>💡 {state.hintText}</div>
        )}
        {state.message && (
          <div style={{...W.msgBanner, borderColor:state.messageKind==="bad"?"var(--red)":state.messageKind==="good"?"var(--teal)":"var(--line)", color:state.messageKind==="bad"?"var(--red)":state.messageKind==="good"?"var(--teal)":"var(--text)"}}>
            {state.message}
          </div>
        )}
        {myTurn ? (
          <div style={W.guessRow} className="w-guess-row">
            <input style={{...W.input, flex:1, marginTop:0}} placeholder="Teammate name…" value={chainInput}
              onChange={e=>setChainInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") submit(); }} />
            <button style={{...W.cta, marginTop:0, width:"auto", padding:"15px 28px"}} className="w-pop" onClick={submit}>NAME →</button>
          </div>
        ) : (
          <div style={W.seatNote}>{turnName} is naming a teammate…</div>
        )}
        <div style={W.chainHistory} className="w-chain-history">
          {[...state.chain].reverse().map((link,i)=>(
            <div key={i} style={{...W.chainLink, borderLeftColor:link.seat===0?"var(--orange)":link.seat===-1?"var(--line)":"var(--teal)"}}>
              <span style={W.chainLinkName}>{link.name}</span>
              {link.team && <span style={W.chainLinkTeam}>{link.team}</span>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Result({ state, seat, send }) {
  const win = state.winner;
  const youWon = win === seat;
  return (
    <div style={W.centerCol}>
      <div style={W.endCard} className="w-end-card">
        <div style={W.endKick}>🏆 FINAL</div>
        <h2 style={W.chainTitle}>{win<0?"TIE GAME":(youWon?"YOU WIN":`${state.players.find(p=>p.seat===win)?.name} WINS`)}</h2>
        <div style={W.finalRow}>
          {state.players.map(p=>(
            <div key={p.seat} style={{...W.finalCol, color:p.seat===0?"var(--orange)":"var(--teal)"}}>
              <span style={W.finalName}>{p.name}</span>
              <span style={W.finalScore} className="w-final-score">{p.score}</span>
            </div>
          ))}
        </div>
        <button style={W.cta} className="w-pop" onClick={()=>send("rematch")}>PLAY AGAIN →</button>
      </div>
    </div>
  );
}
