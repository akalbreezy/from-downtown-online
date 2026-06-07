// ============================================================
//  FROM DOWNTOWN — authoritative game server (Colyseus)
// ============================================================
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { monitor } from "@colyseus/monitor";
import { GameRoom } from "./GameRoom.js";
import { buildPlayerIndex, hasKey } from "./balldontlie.js";
import { LEAGUES } from "./data.js";

const port = Number(process.env.PORT || 2567);
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => res.send("FROM DOWNTOWN server is up."));
app.get("/health", (_req, res) => res.json({ ok: true, players: globalThis.__playerSource || "loading" }));
app.use("/monitor", monitor()); // optional dashboard at /monitor

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

// Load the real NBA player pool once at startup (free-tier balldontlie),
// merged with the curated chain names. Stored globally so rooms can read it.
(async () => {
  const curated = Object.keys(LEAGUES.nba.chain);
  const { index, source } = await buildPlayerIndex(curated);
  globalThis.__playerIndex = index;       // lowercase -> canonical real name
  globalThis.__playerSource = source;
  console.log(`[FROM DOWNTOWN] player pool ready (${index.size} names, source: ${source})`);
})();

// "game" room; clients create with a code or join by roomId
gameServer.define("game", GameRoom);

gameServer.listen(port);
console.log(`[FROM DOWNTOWN] listening on :${port}${hasKey() ? "" : "  (no BALLDONTLIE_KEY set — curated data only)"}`);
