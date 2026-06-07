# FROM DOWNTOWN — Online (server-authoritative)

Real-time 1-v-1 basketball game. Two folders:

- **/server** — authoritative game server (Colyseus + Node). All rules + the shot clock run here. Clients can't cheat: they send intents, the server validates.
- **/client** — React/Vite front-end. Renders server state, sends intents. Lobby + shareable invite link.

## This build (testable slice)
- ✅ Lobby: create a game, get an invite link, opponent joins via link
- ✅ Waiting-for-opponent + reconnect grace (30s)
- ✅ League + mode select (host-driven)
- ✅ **TRIVIA** fully wired to the live server (turn-locked, authoritative scoring)
- ⏳ Stat Line / 501 / The Chain — rules already on the server; client screens come next

## Run it locally
You need Node.js 18+ (free, from nodejs.org).

**1. Start the server**
```
cd server
npm install
npm run dev        # listens on http://localhost:2567
```

**2. Start the client (new terminal)**
```
cd client
cp .env.example .env      # VITE_SERVER_URL=ws://localhost:2567 is correct for local
npm install
npm run dev               # opens http://localhost:5173
```

**3. Test 1-v-1**
- Open http://localhost:5173 → "Create Game"
- Copy the invite link, open it in a 2nd tab/window (or another device on your network)
- Both connected → host picks league + Trivia → play. Turns are enforced by the server.

## Deploy (free to start)
- **Server → Render.com** (free web service): New > Web Service > point at the /server repo, build `npm install`, start `npm start`. Render gives you `https://something.onrender.com`. Your WS URL is `wss://something.onrender.com`.
- **Client → Vercel** (free): import the /client repo, framework = Vite. Add env var `VITE_SERVER_URL = wss://something.onrender.com`. Deploy.
- Note: Render's free tier sleeps when idle (first connection takes ~30s to wake). A few $/mo keeps it always-on.

## Honest caveats
- **Data is APPROXIMATE** — verify all stats/teammate links before any public/competitive use.
- **No real logos or player photos** (trademark/copyright). Original emblems/silhouettes only.
- I couldn't run this against a live server in the build environment — do a local test first; if anything errors, send the message and I'll debug.
