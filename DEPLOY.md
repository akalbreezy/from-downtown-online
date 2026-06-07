# Pushing FROM DOWNTOWN live

Two halves:
- **Client (the website)** → Cloudflare Pages, on your domain
- **Server (the referee)** → Render (free tier)

You'll need free accounts: **GitHub**, **Render**, and your existing **Cloudflare**.
Nothing here costs money to start.

---

## STEP 1 — Put the code on GitHub

Install Git if you don't have it (git-scm.com), then in a terminal, from the
`from-downtown-online` folder:

```
git init
git add .
git commit -m "FROM DOWNTOWN online"
```

Now make a repo on github.com (the "+" top-right → New repository → name it
`from-downtown-online` → Create). GitHub shows you a URL. Then:

```
git remote add origin https://github.com/YOURNAME/from-downtown-online.git
git branch -M main
git push -u origin main
```

Your code is now on GitHub. Both Render and Cloudflare read from here.

---

## STEP 2 — Deploy the SERVER on Render

1. render.com → sign up (use "Sign in with GitHub" — easiest).
2. Dashboard → **New +** → **Web Service**.
3. Connect your GitHub, pick the `from-downtown-online` repo.
4. Fill in:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
5. Click **Create Web Service**. Wait for it to go live (a few minutes).
6. Render shows a URL like `https://from-downtown-xxxx.onrender.com`.
   Your WebSocket address is the same with **wss://**:
   `wss://from-downtown-xxxx.onrender.com`  ← copy this, you need it next.

Test it: open the `https://...onrender.com` URL in a browser. You should see
"FROM DOWNTOWN server is up."

---

## STEP 3 — Deploy the SITE on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick the same repo.
2. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory (Advanced):** `client`
3. Before the first deploy, add an **Environment variable**:
   - Name: `VITE_SERVER_URL`
   - Value: `wss://from-downtown-xxxx.onrender.com`  (your Render wss URL)
4. **Save and Deploy.** You get a `https://your-project.pages.dev` URL.

Open that URL → Create Game → copy the invite link → open it in a second
window. If both connect and Trivia plays, it works.

---

## STEP 4 — Put it on YOUR domain

(Your domain is already in Cloudflare, so this is quick.)

1. In your Pages project → **Custom domains** tab → **Set up a custom domain**.
2. Enter the domain you want, e.g. `play.yourdomain.com` (a subdomain is
   tidiest) or your root `yourdomain.com`.
3. Cloudflare auto-creates the DNS record since the domain lives here — confirm.
4. SSL is automatic. Live in a few minutes.

Done — your game is on your domain.

---

## IMPORTANT: after the domain is live

The server only accepts connections; no extra config needed for the domain.
But two things to know:

- **Free Render server sleeps after ~15 min idle.** First game after a quiet
  period takes ~30s to wake (you'll see "connecting…"). Upgrading Render to a
  paid instance (~$7/mo) keeps it instant. Everything else stays free.
- **Updating the game later:** just `git push` your changes. Render and
  Cloudflare both auto-redeploy from GitHub. No re-setup.

---

## Before you share it publicly
- **Verify the data.** All NBA/NBL stats and teammate links are approximate,
  hand-entered values. Check them against real sources first.
- **No real logos or player photos** — those are trademarked/copyrighted. The
  app uses original emblems and silhouettes only. Keep it that way unless you
  license the real assets.
- Only Trivia is wired to the client so far (the other three modes' rules are
  on the server, screens come next).

## If something breaks
Open the browser console (F12) and Render's "Logs" tab. Send me the error text
and I'll help you fix it.

---

## OPTIONAL: real NBA player data (balldontlie free tier)

The server can pull a real NBA player list from balldontlie's free tier to
widen the player pool. It's optional — without a key the game runs on the
curated data.

1. Sign up free at balldontlie.io → get your API key (free tier, no card for free).
2. On **Render** → your service → **Environment** → add:
   - Key: `BALLDONTLIE_KEY`
   - Value: your balldontlie key
3. Redeploy. On startup the server logs how many players it loaded.

### What the FREE tier does and doesn't do
- ✅ Real player list / teams / games (validates names, widens the pool)
- ❌ Career/season STAT LINES are NOT on the free tier — they need the
  $9.99/mo ALL-STAR plan. Until then, Stat Line / 501 numbers stay on the
  curated (approximate) values.
- The teammate CHAIN links are a relationship the API doesn't provide at all,
  so the Chain always uses the curated graph regardless of tier.
- Free tier is capped at 5 requests/minute — the server throttles and caches
  to respect that, and falls back to curated data if the API is unavailable.
