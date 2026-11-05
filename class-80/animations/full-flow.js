Net.mount(650, 1.1);

const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + rows.map(r => `<div class="${r[1] || ''}">${r[0]}</div>`).join('') + '</div>';
// response shown in the app: smaller text so full header names fit on one line
const resp = lines => tw(lines).replace('<div class="tw">', '<div class="tw" style="font-size:10px">');
const SLOW = 2600;   // pause after each important moment
const step = (ctx, html, kind, ms) => { say(html, kind); return Net.beat(ctx, ms || SLOW); };
// send a packet and stop quietly if the flow was restarted meanwhile
async function go(ctx, a, b, label, cls, dur) { await send(a, b, label, cls, dur || 750); Net.check(ctx); }

// the Redis cluster as a consistent-hashing ring: 4 nodes at slots 0, 25, 50, 75
const NODES = [['R1', 0], ['R2', 25], ['R3', 50], ['R4', 75]];
function ring(slot, owner) {
  const cx = 110, cy = 80, r = 50;
  const pt = (s, rr) => { const a = s / 100 * 2 * Math.PI - Math.PI / 2; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
  let h = `<svg width="220" height="160" viewBox="0 0 220 160"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#777" stroke-dasharray="3 3"/>`;
  NODES.forEach(n => {
    const p = pt(n[1], r), l = pt(n[1], r + 24), on = n[0] === owner;
    h += `<circle cx="${p[0]}" cy="${p[1]}" r="12" fill="${on ? '#fff' : '#222'}" stroke="#aaa"/>`
      + `<text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="${on ? '#000' : '#ddd'}" font-family="monospace">${n[0]}</text>`
      + `<text x="${l[0]}" y="${l[1] + 3}" text-anchor="middle" font-size="9" fill="#888" font-family="monospace">${n[1]}</text>`;
  });
  if (slot !== null) {
    const p = pt(slot, r), l = pt(slot, r - 20);
    h += `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#e5675f"/><text x="${l[0]}" y="${l[1] + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="monospace">${slot}</text>`;
  }
  return h + '</svg>';
}

let V;
function paint() {
  Net.set('c', { body: V.client });
  Net.set('ag1', { body: tw([[V.ag1 || 'stateless', V.ag1 ? 'amb' : 'dim']]) });
  Net.set('ag2', { body: tw([[V.ag2 || 'stateless', V.ag2 ? 'amb' : 'dim']]) });
  Net.set('ag3', { body: tw([[V.ag3 || 'stateless', V.ag3 ? 'amb' : 'dim']]) });
  Net.set('rc', { body: '<div style="text-align:center">' + ring(V.slot, V.owner) + '</div>' + (V.ringNote ? tw([[V.ringNote, 'h']]) : '') + (V.owner ? table('R3 · jaikant:bucket (hash)', [['tokens       ' + V.tokens, V.hot ? 'hot' : ''], ['last_refill  10:00:00', '']]) : '') });
  Net.set('auth', { body: tw([['signs with the key in config', 'dim']]) });
}
function setup() {
  V = { client: tw([['not logged in', 'dim']]), ag1: '', ag2: '', ag3: '', slot: null, owner: '', ringNote: '', tokens: 1, hot: false };
  Net.node('c', { x: 100, y: 300, label: "Jaikant's app", kind: 'client', w: 190 });
  Net.node('lb', { x: 258, y: 300, label: 'Load balancer', kind: 'lb', w: 100 });
  Net.node('ag1', { x: 400, y: 185, label: 'API gateway 1', kind: 'proxy', w: 140 });
  Net.node('ag2', { x: 400, y: 300, label: 'API gateway 2', kind: 'proxy', w: 140 });
  Net.node('ag3', { x: 400, y: 415, label: 'API gateway 3', kind: 'proxy', w: 140 });
  Net.node('auth', { x: 600, y: 75, label: 'Auth service', kind: 'proxy', w: 160 });
  Net.node('udb', { x: 820, y: 75, label: 'Users DB', kind: 'db', w: 130, body: tw([['jaikant · pwd hash', 'dim']]) });
  Net.node('lb2', { x: 600, y: 285, label: 'Load balancer', kind: 'lb', w: 120 });
  Net.node('rc', { x: 600, y: 478, label: 'Redis cluster', sub: 'consistent hashing ring', kind: 'lb', w: 250 });
  Net.node('ms1', { x: 800, y: 195, label: 'Orders service 1', kind: 'proxy', w: 140 });
  Net.node('ms2', { x: 800, y: 300, label: 'Orders service 2', kind: 'proxy', w: 140 });
  Net.node('ms3', { x: 800, y: 405, label: 'Orders service 3', kind: 'proxy', w: 140 });
  Net.node('db', { x: 935, y: 300, label: 'Orders DB', kind: 'db', w: 120 });
  Net.link('c', 'lb', { cls: 'on' });
  ['ag1', 'ag2', 'ag3'].forEach(g => { Net.link('lb', g); Net.link(g, 'lb2'); Net.link(g, 'rc', { dashed: true }); });
  Net.link('ag1', 'auth'); Net.link('auth', 'udb');
  ['ms1', 'ms2', 'ms3'].forEach(m => { Net.link('lb2', m); Net.link(m, 'db'); });
  paint();
  panel([
    ['Login', 'ID + password → Auth service checks the Users DB → signs a <b>JWT</b> (15 min) + refresh token. The JWT itself is stored nowhere'],
    ['API gateway', 'Verifies the JWT with the key it holds in memory (no DB call), reads <code>sub</code> = jaikant'],
    ['Redis cluster', '<code>hash(jaikant) % 100 = 37</code> → next node clockwise on the ring = <b>R3</b>. Every gateway lands on the same node for the same user'],
    ['Token bucket', '<code>HMGET jaikant:bucket tokens last_refill</code> → refill for time passed → take 1 → <code>HSET</code> (one Lua script, atomic)'],
    ['Remember', 'Token left → forward to the services and answer <b>200</b> with <code>X-RateLimit-*</code> headers. No token → <b>429</b> + <code>Retry-After</code>, and the services never see it']
  ]);
}

async function run(ctx) {
  // ---------- 1. login ----------
  await step(ctx, '<b>1. Login.</b> Jaikant types his ID and password.', '', 2000);
  await go(ctx, 'c', 'lb', 'login id + pwd');
  await go(ctx, 'lb', 'ag1', 'login');
  await go(ctx, 'ag1', 'auth', 'login');
  await go(ctx, 'auth', 'udb', 'check password');
  await go(ctx, 'udb', 'auth', 'match ✓', 'ok', 650);
  Net.flash('auth', 'ok');
  await step(ctx, 'Password matches. The Auth service <b>signs a JWT</b> with its key: <code>{sub: jaikant, plan: free}</code>.');
  await go(ctx, 'auth', 'ag1', 'JWT + refresh', 'ok', 650);
  await go(ctx, 'ag1', 'lb', 'JWT + refresh', 'ok', 600);
  await go(ctx, 'lb', 'c', 'JWT + refresh', 'ok', 600);
  V.client = tw([['JWT  sub: jaikant · 15 min', 'h'], ['refresh token', 'dim']]); paint();
  await step(ctx, 'His app keeps the <b>JWT</b> (and a refresh token). Nothing about this token is stored on the server.', 'win');

  // ---------- 2. API call: gateway + JWT ----------
  await step(ctx, '<b>2. API call.</b> He opens his orders: <code>GET /orders</code> with <code>Authorization: Bearer JWT</code>.', '', 2200);
  await go(ctx, 'c', 'lb', 'GET /orders + JWT');
  await go(ctx, 'lb', 'ag2', 'GET /orders + JWT');
  V.ag2 = 'JWT signature ✓'; paint(); Net.flash('ag2', 'ok');
  await step(ctx, 'The load balancer picks <b>gateway 2</b>. It re-signs the JWT with its key: signature matches → genuine. <b>No DB call.</b>');
  V.ag2 = 'sub = jaikant'; paint();
  await step(ctx, 'It reads <code>sub</code> from the payload: this is <b>jaikant</b>. That is the rate limit key.', '', 2200);

  // ---------- 3. Redis cluster: consistent hashing ----------
  V.ag2 = 'hash(jaikant) % 100 = 37'; V.slot = 37; paint();
  await step(ctx, '<b>3. Which Redis node?</b> <code>hash(jaikant) % 100 = 37</code> → slot 37 on the ring.');
  V.owner = 'R3'; V.ringNote = '37 → next clockwise → R3'; paint(); Net.flash('rc', 'ok');
  await step(ctx, 'Walk clockwise from 37: the next node is <b>R3</b> (at 50). Jaikant\'s bucket lives on R3.');
  await go(ctx, 'ag2', 'rc', 'HMGET jaikant:bucket', '', 850);
  V.hot = true; paint();
  await go(ctx, 'rc', 'ag2', 'tokens 1 · 10:00:00', 'ok', 800);
  V.ag2 = '1 token → take it → 0'; paint();
  await go(ctx, 'ag2', 'rc', 'HSET tokens 0', '', 800);
  V.tokens = 0; paint();
  await step(ctx, 'Refill for the time passed (none), <b>1 token</b> left → take it → write back <b>0</b>. Allowed.', 'win');
  V.hot = false;

  // ---------- 4. allowed: on to the microservices ----------
  await step(ctx, '<b>4. Allowed.</b> On to the orders service, through another load balancer.', '', 2000);
  await go(ctx, 'ag2', 'lb2', 'GET /orders');
  await go(ctx, 'lb2', 'ms2', 'GET /orders');
  await go(ctx, 'ms2', 'db', 'SELECT orders', '', 650);
  await go(ctx, 'db', 'ms2', 'rows', 'ok', 600);
  await go(ctx, 'ms2', 'lb2', '200 orders', 'ok', 650);
  await go(ctx, 'lb2', 'ag2', '200 orders', 'ok', 600);
  V.ag2 = '+ X-RateLimit headers'; paint();
  await go(ctx, 'ag2', 'lb', '200 + headers', 'ok', 600);
  await go(ctx, 'lb', 'c', '200 + headers', 'ok', 600);
  V.client = resp([['200 OK  · orders', 'ok'], ['X-RateLimit-Limit: 100', ''], ['X-RateLimit-Remaining: 0', ''], ['X-RateLimit-Reset: 10:00:01', '']]); paint();
  await step(ctx, 'He gets his orders, plus headers saying his limit, what is left (<b>0</b>) and when it refills.', 'win', 3200);

  // ---------- 5. rate limited ----------
  V.ag2 = '';
  await step(ctx, '<b>5. He taps again</b>, straight away.', '', 1800);
  await go(ctx, 'c', 'lb', 'GET /orders + JWT');
  await go(ctx, 'lb', 'ag3', 'GET /orders + JWT');
  V.ag3 = 'JWT ✓ · sub = jaikant'; paint();
  await step(ctx, 'This time the load balancer picks <b>gateway 3</b>. Same checks: JWT valid, user jaikant.', '', 2200);
  V.ag3 = 'hash → 37 → R3'; V.hot = true; paint(); Net.flash('rc', 'ok');
  await step(ctx, 'Same hash, same slot 37, <b>same node R3</b>: every gateway finds the same bucket.', '', 2200);
  await go(ctx, 'ag3', 'rc', 'HMGET jaikant:bucket', '', 850);
  await go(ctx, 'rc', 'ag3', 'tokens 0', 'bad', 800);
  V.ag3 = '0 tokens → 429'; V.hot = false; paint(); Net.flash('ag3', 'bad');
  await step(ctx, '<b>0 tokens</b> → rate limited. The orders service is <b>never called</b>.', 'err');
  await go(ctx, 'ag3', 'lb', '429', 'bad', 650);
  await go(ctx, 'lb', 'c', '429', 'bad', 650);
  V.client = resp([['429 Too Many Requests', 'bad'], ['X-RateLimit-Limit: 100', ''], ['X-RateLimit-Remaining: 0', ''], ['Retry-After: 1', 'amb']]); paint();
  say('He gets <b>429 Too Many Requests</b> with <code>Retry-After: 1</code>: "try again in 1 second".', 'err');
}

startPage([
  { label: 'Login → JWT → gateway → Redis → 200 / 429', story: 'Jaikant logs in, opens his orders, then taps again too fast.', setup: setup, run: run,
    q: 'His second request lands on a different API gateway. How does it still find his bucket?',
    a: ['Gateways keep no state. They all use the same Redis cluster.', 'hash(jaikant) always gives slot 37 → R3, so every gateway reads the same bucket.'] }
]);
