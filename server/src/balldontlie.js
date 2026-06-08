// ============================================================
//  balldontlie integration (FREE TIER)
// ============================================================

const BASE = "https://api.balldontlie.io/v1";
const KEY = process.env.BALLDONTLIE_KEY || "";

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

async function fetchPlayers({ maxPages = 3, perPage = 100 } = {}) {
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

async function buildPlayerIndex(curatedNames = []) {
  const index = new Map();
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

function hasKey() { return !!KEY; }

module.exports = { fetchPlayers, buildPlayerIndex, hasKey };
