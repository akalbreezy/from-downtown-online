// ============================================================
//  balldontlie integration (FREE TIER)
//  Free tier = teams, players, games endpoints; 5 req/min.
//  Career/season STAT LINES are NOT on free tier ($9.99 plan),
//  so stat values stay curated until you upgrade.
//
//  Strategy: fetch the player pool ONCE at server start, cache
//  in memory, throttle to respect 5 req/min, and fall back to
//  curated data on any error/rate-limit so the game never breaks.
// ============================================================

const BASE = "https://api.balldontlie.io/v1";
const KEY = process.env.BALLDONTLIE_KEY || ""; // set in server env

// crude throttle: free tier allows ~5 requests/minute
let _lastWindow = 0, _countInWindow = 0;
async function throttle() {
  const now = Date.now();
  if (now - _lastWindow > 60_000) { _lastWindow = now; _countInWindow = 0; }
  if (_countInWindow >= 5) {
    const wait = 60_000 - (now - _lastWindow) + 250;
    await new Promise(r => setTimeout(r, wait));
    _lastWindow = Date.now(); _countInWindow = 0;
  }
  _countInWindow++;
}

async function api(path, params = {}) {
  if (!KEY) throw new Error("no-key");
  await throttle();
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k + "[]", x));
    else url.searchParams.set(k, v);
  });
  const res = await fetch(url, { headers: { Authorization: KEY } });
  if (res.status === 429) throw new Error("rate-limited");
  if (!res.ok) throw new Error("api-" + res.status);
  return res.json();
}

// Pull a page of active players (paginated via cursor).
// Returns array of { full_name, team } — used to VALIDATE names
// and enrich the player pool. Career stats are NOT fetched (paid).
export async function fetchPlayers({ maxPages = 3, perPage = 100 } = {}) {
  const out = [];
  let cursor = undefined;
  for (let i = 0; i < maxPages; i++) {
    const params = { per_page: perPage };
    if (cursor != null) params.cursor = cursor;
    const json = await api("/players", params);
    (json.data || []).forEach(p => {
      const full = `${p.first_name} ${p.last_name}`.trim();
      const team = p.team?.full_name || p.team?.name || "";
      if (full) out.push({ name: full, team });
    });
    cursor = json.meta?.next_cursor;
    if (cursor == null) break;
  }
  return out;
}

// Build a Set of canonical real player names for validation.
// Falls back to the provided curated names on any failure.
export async function buildPlayerIndex(curatedNames = []) {
  const index = new Map(); // lowercase -> canonical
  curatedNames.forEach(n => index.set(n.toLowerCase(), n));
  if (!KEY) {
    console.log("[balldontlie] no API key set — using curated player pool only.");
    return { index, source: "curated" };
  }
  try {
    const players = await fetchPlayers({ maxPages: 3 });
    players.forEach(p => { if (!index.has(p.name.toLowerCase())) index.set(p.name.toLowerCase(), p.name); });
    console.log(`[balldontlie] loaded ${players.length} real players (plus curated).`);
    return { index, source: "balldontlie+curated" };
  } catch (e) {
    console.log(`[balldontlie] fetch failed (${e.message}) — falling back to curated pool.`);
    return { index, source: "curated-fallback" };
  }
}

export function hasKey() { return !!KEY; }
