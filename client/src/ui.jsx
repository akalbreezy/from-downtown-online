import React from "react";

// ============================================================
//  UI — dark broadcast look (shared styles + Style block)
// ============================================================
// Full NBA court SVG — used as a fixed background watermark
const COURT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 500" fill="none" stroke="rgba(80,130,200,0.18)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- outer boundary -->
  <rect x="10" y="10" width="920" height="480" rx="6"/>
  <!-- half-court line -->
  <line x1="470" y1="10" x2="470" y2="490"/>
  <!-- centre circle -->
  <circle cx="470" cy="250" r="60"/>
  <circle cx="470" cy="250" r="6" fill="rgba(80,130,200,0.18)" stroke="none"/>

  <!-- LEFT key (paint) -->
  <rect x="10" y="178" width="190" height="144"/>
  <!-- left free-throw circle -->
  <path d="M200,178 a72,72 0 0,1 0,144" stroke-dasharray="6 5"/>
  <path d="M200,178 a72,72 0 0,0 0,144"/>
  <!-- left restricted arc -->
  <path d="M10,217 a40,40 0 0,1 0,66" stroke="rgba(80,130,200,0.12)"/>
  <!-- left backboard + rim -->
  <line x1="10" y1="232" x2="10" y2="268" stroke-width="4"/>
  <!-- left three-point arc -->
  <path d="M10,83 L160,83 a170,170 0 0,1 0,334 L10,417"/>
  <!-- left corner three lines -->
  <line x1="10" y1="83" x2="160" y2="83"/>
  <line x1="10" y1="417" x2="160" y2="417"/>

  <!-- RIGHT key (paint) -->
  <rect x="740" y="178" width="190" height="144"/>
  <!-- right free-throw circle -->
  <path d="M740,178 a72,72 0 0,0 0,144" stroke-dasharray="6 5"/>
  <path d="M740,178 a72,72 0 0,1 0,144"/>
  <!-- right restricted arc -->
  <path d="M930,217 a40,40 0 0,0 0,66" stroke="rgba(80,130,200,0.12)"/>
  <!-- right backboard -->
  <line x1="930" y1="232" x2="930" y2="268" stroke-width="4"/>
  <!-- right three-point arc -->
  <path d="M930,83 L780,83 a170,170 0 0,0 0,334 L930,417"/>
  <!-- right corner three lines -->
  <line x1="930" y1="83" x2="780" y2="83"/>
  <line x1="930" y1="417" x2="780" y2="417"/>

  <!-- lane tick marks left -->
  <line x1="130" y1="178" x2="130" y2="166"/><line x1="160" y1="178" x2="160" y2="166"/>
  <line x1="130" y1="322" x2="130" y2="334"/><line x1="160" y1="322" x2="160" y2="334"/>
  <line x1="10" y1="214" x2="22" y2="214"/><line x1="10" y1="286" x2="22" y2="286"/>
  <!-- lane tick marks right -->
  <line x1="810" y1="178" x2="810" y2="166"/><line x1="780" y1="178" x2="780" y2="166"/>
  <line x1="810" y1="322" x2="810" y2="334"/><line x1="780" y1="322" x2="780" y2="334"/>
  <line x1="930" y1="214" x2="918" y2="214"/><line x1="930" y1="286" x2="918" y2="286"/>
</svg>`;

const COURT_URL = `url("data:image/svg+xml,${encodeURIComponent(COURT_SVG)}")`;

export function Style() {
  return (<style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Oswald:wght@500;600;700&family=Archivo:wght@500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    :root{
      --wood:#0e1420; --wood-dk:#080c14; --surface:#141d2e; --surface2:#1b2740; --line:#2a3a57;
      --text:#eaf1ff; --muted:#8aa0c4; --orange:#ff6a2b; --orange-dk:#e8501a; --teal:#22e0c8;
      --gold:#ffc23d; --red:#ff4d6d; --paper:#0f1726;
      --glowO:rgba(255,106,43,.55); --glowT:rgba(34,224,200,.5);
    }
    *{box-sizing:border-box;}
    body{margin:0;font-family:'Archivo',sans-serif;}
    ::selection{background:var(--orange);color:#fff;}
    input:focus{outline:none;} input::placeholder{color:var(--muted);}
    button{cursor:pointer;font-family:'Archivo',sans-serif;transition:transform .14s cubic-bezier(.2,.8,.3,1.2),box-shadow .2s,border-color .2s,filter .2s;}
    button:disabled{cursor:default;}
    button:active:not(:disabled){transform:scale(.98);}
    @keyframes wrise{0%{transform:translateY(22px);opacity:0}100%{transform:translateY(0);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .w-stagger>*{opacity:0;animation:wrise .55s cubic-bezier(.2,.8,.3,1.1) forwards;}
    .w-stagger>*:nth-child(1){animation-delay:.05s}.w-stagger>*:nth-child(2){animation-delay:.14s}
    .w-stagger>*:nth-child(3){animation-delay:.23s}
    .w-pop:hover:not(:disabled){transform:translateY(-4px);}
    .w-tile:hover:not(:disabled){border-color:var(--orange)!important;box-shadow:0 0 0 1px var(--orange),0 18px 50px -12px var(--glowO)!important;}
  `}</style>);
}

export const W = {
  root:{minHeight:"100vh",background:"radial-gradient(120% 80% at 50% -10%, #1a2742 0%, var(--wood) 45%, var(--wood-dk) 100%)",color:"var(--text)",fontFamily:"'Archivo',sans-serif",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"},
  get floor(){return {position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`radial-gradient(60% 50% at 15% 0%, var(--glowO), transparent 60%),radial-gradient(60% 50% at 85% 100%, var(--glowT), transparent 60%),${COURT_URL}`,backgroundSize:"auto, auto, 95% auto",backgroundRepeat:"no-repeat",backgroundPosition:"center, center, center center",opacity:.9}},
  topbar:{position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",gap:14,padding:"14px 28px",background:"linear-gradient(180deg, rgba(8,12,20,.95), rgba(8,12,20,.75))",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--line)",boxShadow:"0 1px 0 var(--orange)"},
  brandFrom:{fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:3,color:"var(--muted)",fontSize:14},
  brandDown:{fontFamily:"'Bungee',cursive",fontSize:22,color:"var(--orange)",marginLeft:2,textShadow:"0 0 18px var(--glowO)"},
  brandTag:{marginLeft:"auto",fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:2,fontSize:11,textTransform:"uppercase",color:"var(--teal)",textShadow:"0 0 12px var(--glowT)"},
  stage:{position:"relative",zIndex:1,flex:1,width:"100%",maxWidth:1120,margin:"0 auto",padding:"34px 28px",display:"flex",flexDirection:"column",justifyContent:"center"},
  footer:{position:"relative",zIndex:1,textAlign:"center",padding:"16px"},
  footBadge:{display:"inline-flex",alignItems:"center",gap:8,color:"var(--muted)",fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:1.5,fontSize:11,textTransform:"uppercase"},
  footName:{color:"var(--orange)",fontWeight:700},
  footBall:{width:12,height:12,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,#ff9a4d,var(--orange) 70%)"},

  homeWrap:{display:"grid",gridTemplateColumns:"1.25fr .85fr",gap:40,alignItems:"center"},
  homeLeft:{},
  heroPlate:{display:"inline-flex",flexDirection:"column",lineHeight:.84,marginBottom:20},
  heroFrom:{fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:8,fontSize:"clamp(20px,2.6vw,30px)",color:"var(--muted)"},
  heroDown:{fontFamily:"'Bungee',cursive",fontSize:"clamp(48px,7vw,88px)",color:"var(--orange)",textShadow:"0 0 30px var(--glowO)"},
  heroBlurb:{maxWidth:460,fontSize:18,lineHeight:1.55,color:"var(--text)",opacity:.8},
  leagueChips:{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"},
  chip:{fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:1,fontSize:13,textTransform:"uppercase",background:"rgba(34,224,200,.08)",border:"1px solid var(--line)",borderRadius:999,padding:"7px 14px",color:"var(--teal)"},
  homeRight:{background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:16,padding:26,boxShadow:"0 24px 60px -12px rgba(0,0,0,.7)"},
  panelHead:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:2,fontSize:13,textTransform:"uppercase",color:"var(--orange)",textShadow:"0 0 12px var(--glowO)",textAlign:"center",marginBottom:16},
  input:{width:"100%",background:"var(--paper)",border:"1px solid var(--line)",borderRadius:10,padding:"13px 16px",fontSize:18,fontWeight:600,fontFamily:"'Archivo',sans-serif",color:"var(--text)"},
  vsRow:{display:"flex",alignItems:"center",gap:12,justifyContent:"center",margin:"14px 0"},
  vsBar:{flex:1,height:1,background:"var(--line)"},
  vsTxt:{fontFamily:"'Bungee',cursive",fontSize:14,color:"var(--muted)"},
  cta:{width:"100%",background:"linear-gradient(180deg, #ff7d42, var(--orange) 55%, var(--orange-dk))",color:"#fff",border:"none",borderRadius:10,padding:"15px 24px",fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:1.5,fontSize:17,textTransform:"uppercase",marginTop:14,boxShadow:"0 10px 30px -6px var(--glowO)"},
  ctaGhost:{width:"100%",background:"rgba(255,255,255,.04)",color:"var(--text)",border:"1px solid var(--line)",borderRadius:10,padding:"13px 20px",fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:1,fontSize:14,textTransform:"uppercase"},
  link:{background:"none",border:"none",color:"var(--muted)",fontWeight:600,fontSize:14,marginTop:14,fontFamily:"'Archivo',sans-serif"},
  errLine:{color:"var(--red)",fontWeight:600,fontSize:14,marginTop:12,textAlign:"center"},

  centerCol:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"},
  bigTitle:{fontFamily:"'Bungee',cursive",fontSize:"clamp(26px,4vw,42px)",margin:"2px 0",color:"var(--text)"},
  subTitle:{fontSize:16,color:"var(--text)",opacity:.72,maxWidth:520,margin:"6px auto 18px",lineHeight:1.55},

  joinCard:{background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:16,padding:"34px 38px",maxWidth:440,width:"100%",boxShadow:"0 20px 56px -16px rgba(0,0,0,.75)"},
  waitCard:{background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:16,padding:"34px 38px",maxWidth:520,width:"100%",boxShadow:"0 20px 56px -16px rgba(0,0,0,.75)"},
  spinner:{width:40,height:40,margin:"6px auto 14px",borderRadius:"50%",border:"4px solid var(--line)",borderTopColor:"var(--orange)",animation:"spin 1s linear infinite"},
  seatNote:{fontSize:15,color:"var(--muted)",marginTop:12},

  shareBar:{display:"flex",alignItems:"center",gap:8,background:"var(--paper)",border:"1px solid var(--line)",borderRadius:10,padding:"8px 8px 8px 14px",maxWidth:540,width:"100%",margin:"0 auto"},
  shareLabel:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:1,fontSize:11,textTransform:"uppercase",color:"var(--teal)",whiteSpace:"nowrap"},
  shareInput:{flex:1,background:"transparent",border:"none",color:"var(--text)",fontSize:13,fontFamily:"'DM Mono',monospace"},
  shareBtn:{background:"var(--orange)",color:"#fff",border:"none",borderRadius:8,padding:"9px 14px",fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"},

  leagueTag:{display:"inline-block",fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:2,fontSize:12,textTransform:"uppercase",color:"var(--orange)",textShadow:"0 0 10px var(--glowO)",marginBottom:8},
  leagueRow:{display:"flex",gap:18,marginTop:8,marginBottom:18},
  leagueCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:16,padding:"24px 38px",boxShadow:"0 18px 50px -14px rgba(0,0,0,.7)",color:"var(--text)"},
  leagueAbbr:{fontFamily:"'Bungee',cursive",fontSize:34,color:"var(--orange)",textShadow:"0 0 20px var(--glowO)"},
  modeGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,maxWidth:760,width:"100%"},
  modeTile:{display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:14,padding:"22px 14px",boxShadow:"0 14px 40px -16px rgba(0,0,0,.7)",color:"var(--text)"},
  modeIcon:{fontSize:30},
  modeName:{fontFamily:"'Bungee',cursive",fontSize:15},

  broadcast:{display:"grid",gridTemplateColumns:"280px 1fr",gap:24,alignItems:"start",width:"100%"},
  rail:{display:"flex",flexDirection:"column",gap:14,position:"sticky",top:88},
  scorebd:{background:"linear-gradient(180deg, #0a0f1a, #060a12)",border:"1px solid var(--line)",borderRadius:12,padding:14,boxShadow:"0 10px 28px rgba(0,0,0,.5)"},
  scorebdHead:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:2,fontSize:11,textTransform:"uppercase",color:"var(--gold)",textAlign:"center",marginBottom:10,opacity:.85},
  scoreRow:{display:"flex",alignItems:"center",gap:10,border:"1px solid",borderRadius:10,padding:"10px 12px",marginBottom:8,transition:"opacity .3s, box-shadow .3s",background:"rgba(255,255,255,.02)"},
  scoreName:{fontSize:15,fontWeight:700,color:"var(--text)",lineHeight:1.1},
  scoreState:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:1,fontSize:9,textTransform:"uppercase",marginTop:3},
  scoreNum:{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:30,lineHeight:1,textShadow:"0 0 14px currentColor"},

  mainStage:{display:"flex",flexDirection:"column",gap:14,minHeight:420},
  handoff:{background:"linear-gradient(135deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:16,padding:"44px 36px",textAlign:"center",boxShadow:"0 20px 56px -16px rgba(0,0,0,.75)"},
  handoffLabel:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:2,fontSize:12,textTransform:"uppercase",color:"var(--muted)",marginBottom:10},
  handoffName:{fontFamily:"'Bungee',cursive",fontSize:"clamp(30px,5vw,52px)",margin:"4px 0 10px",textShadow:"0 0 26px rgba(234,241,255,.3)"},
  prompt:{background:"linear-gradient(135deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:14,padding:"26px 28px",textAlign:"center",boxShadow:"0 14px 40px -14px rgba(0,0,0,.7)"},
  promptLabel:{display:"block",fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:3,fontSize:12,textTransform:"uppercase",color:"var(--teal)",textShadow:"0 0 12px var(--glowT)",marginBottom:8},
  qText:{display:"block",fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:"clamp(22px,3vw,32px)",lineHeight:1.25,color:"var(--text)",marginTop:6},
  answerGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  answer:{display:"flex",alignItems:"center",gap:12,textAlign:"left",border:"1px solid",borderRadius:12,padding:"16px 18px",fontSize:18,fontWeight:600,fontFamily:"'Archivo',sans-serif",boxShadow:"0 8px 22px -10px rgba(0,0,0,.6)"},
  ansLetter:{fontFamily:"'Bungee',cursive",fontSize:14,width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.06)",color:"var(--teal)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},

  // shared across stat line, darts, chain
  guessRow:{display:"flex",gap:12,alignItems:"stretch"},
  msgBanner:{border:"1px solid",borderRadius:12,padding:"14px 18px",fontSize:16,fontWeight:600,fontFamily:"'Archivo',sans-serif",textAlign:"center",background:"rgba(0,0,0,.3)"},

  // stat line
  promptStatSub:{display:"block",fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:16,color:"var(--muted)",marginTop:8,textTransform:"uppercase",letterSpacing:1},
  revealBox:{background:"linear-gradient(135deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:14,padding:"28px 28px",textAlign:"center",boxShadow:"0 14px 40px -14px rgba(0,0,0,.7)"},
  revealLabel:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:3,fontSize:12,textTransform:"uppercase",color:"var(--teal)",textShadow:"0 0 12px var(--glowT)",marginBottom:10},
  revealMsg:{fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:500,color:"var(--text)",margin:"8px 0 20px"},

  // 501 darts
  dartScores:{display:"flex",gap:18},
  dartScoreCol:{flex:1,background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"2px solid",borderRadius:14,padding:"22px 20px",textAlign:"center",transition:"opacity .3s",boxShadow:"0 14px 40px -14px rgba(0,0,0,.7)"},
  dartName:{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:8,fontFamily:"'Archivo',sans-serif"},
  dartNum:{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:52,lineHeight:1,textShadow:"0 0 18px currentColor"},
  onClock:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:1,fontSize:10,textTransform:"uppercase",marginTop:8,color:"inherit",opacity:.8},

  // the chain
  chainClock:{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:64,lineHeight:1,textAlign:"center",padding:"8px 0 4px",transition:"color .5s"},
  blockedTag:{textAlign:"center",fontSize:11,color:"var(--red)",fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:1,marginTop:6,textTransform:"uppercase"},
  lifelineGrid:{display:"flex",gap:8,marginTop:8},
  lifeBtn:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"rgba(255,255,255,.04)",border:"1px solid var(--line)",borderRadius:10,padding:"10px 6px",color:"var(--text)",transition:"opacity .2s, transform .14s cubic-bezier(.2,.8,.3,1.2)"},
  lifeBtnIcon:{fontSize:20},
  lifeBtnLabel:{fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"var(--muted)"},
  lifeBtnCount:{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:500,color:"var(--teal)"},
  chainCurrentName:{display:"block",fontFamily:"'Bungee',cursive",fontSize:"clamp(24px,4vw,42px)",color:"var(--orange)",textShadow:"0 0 20px var(--glowO)",marginTop:6},
  chainHistory:{display:"flex",flexDirection:"column",gap:6,maxHeight:280,overflowY:"auto",paddingRight:4},
  chainLink:{borderLeft:"3px solid",paddingLeft:12,paddingTop:4,paddingBottom:4},
  chainLinkName:{fontSize:15,fontWeight:700,color:"var(--text)",fontFamily:"'Archivo',sans-serif"},
  chainLinkTeam:{fontSize:12,color:"var(--muted)",marginLeft:10,fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:.5,textTransform:"uppercase"},

  endCard:{background:"linear-gradient(180deg, var(--surface2), var(--surface))",border:"1px solid var(--line)",borderRadius:18,padding:"32px 38px",maxWidth:620,width:"100%",boxShadow:"0 20px 56px -16px rgba(0,0,0,.75)"},
  endKick:{fontFamily:"'Oswald',sans-serif",fontWeight:700,letterSpacing:2,fontSize:14,textTransform:"uppercase",color:"var(--gold)"},
  chainTitle:{fontFamily:"'Bungee',cursive",fontSize:"clamp(34px,6vw,60px)",margin:"6px 0",color:"var(--orange)",textShadow:"0 0 30px var(--glowO)"},
  finalRow:{display:"flex",alignItems:"center",justifyContent:"center",gap:40,margin:"18px 0"},
  finalCol:{display:"flex",flexDirection:"column",alignItems:"center",gap:6},
  finalName:{fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:16,textTransform:"uppercase"},
  finalScore:{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:56,lineHeight:1,textShadow:"0 0 22px currentColor"},
};
