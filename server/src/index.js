// ============================================================
//  FROM DOWNTOWN — authoritative game server (Colyseus)
// ============================================================
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("colyseus");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { monitor } = require("@colyseus/monitor");
const { GameRoom } = require("./GameRoom.js");
const { buildPlayerIndex, hasKey } = require("./balldontlie.js");
const { LEAGUES } = require("./data.js");

const port = Number(process.env.PORT || 2567);
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => res.send("FROM DOWNTOWN server is up."));
app.get("/health", (_req, res) => res.json({ ok: true, players: globalThis.__playerSource || "loading" }));
app.use("/monitor", monitor());

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

(async () => {
  const curated = Object.keys(LEAGUES.nba.chain);
  const { index, source } = await buildPlayerIndex(curated);
  globalThis.__playerIndex = index;
  globalThis.__playerSource = source;
  console.log(`[FROM DOWNTOWN] player pool ready (${index.size} names, source: ${source})`);
})();

gameServer.define("game", GameRoom);

gameServer.listen(port);
console.log(`[FROM DOWNTOWN] listening on :${port}${hasKey() ? "" : "  (no BALLDONTLIE_KEY set — curated data only)"}`);
