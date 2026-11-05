Net.mount(570, 1.1);

const SLOW = 2600;   // pause after each important moment
const step = (ctx, html, kind, ms) => { say(html, kind); return Net.beat(ctx, ms || SLOW); };
// send a packet and stop quietly if the algorithm was switched meanwhile
async function go(ctx, a, b, label, cls, dur) { await send(a, b, label, cls, dur || 700); Net.check(ctx); }
const fmt = t => (Math.round(t * 10) / 10).toFixed(1);
const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + (rows.length ? rows.map(r => `<div class="${r[1] || ''}">${r[0]}</div>`).join('') : '<div class="dim">empty</div>') + '</div>';
const bucket = (items, cap, cls) => '<div class="bk">' + items.map(x => `<div class="bk-it ${cls}">${x}</div>`).join('') + '<div class="bk-it empty">empty</div>'.repeat(cap - items.length) + '</div>';

// ---------------------------------------------------------------
// Same picture for every algorithm: user → rate limiter → API, and a timeline underneath
// ---------------------------------------------------------------
let S;
function base(o) {
  S = { R: o.R, T: 0, arr: [], srv: [], bands: [], served: 0, rule: o.rule, serverRow: !!o.serverRow, limHTML: () => '', bandFn: null };
  Net.node('c', { x: 105, y: 150, label: 'User u123', sub: 'calls GET /api', kind: 'client', w: 170 });
  Net.node('lim', { x: 490, y: 160, label: 'Rate limiter', sub: o.name, kind: 'lb', w: 330 });
  Net.node('srv', { x: 885, y: 150, label: 'API server', kind: 'proxy', w: 170 });
  Net.node('tl', { x: 500, y: 450, label: 'Timeline (seconds)', kind: 'db', w: 940 });
  Net.link('c', 'lim', { cls: 'on' }); Net.link('lim', 'srv', { cls: 'on' });
}
const pos = t => (t / S.R * 100) + '%';
function tlHTML() {
  const marks = list => list.map(m => `<div class="tl-mk ${m.c}" style="left:${pos(m.t)}"></div>`).join('');
  const bands = S.bands.map(b => `<div class="tl-band ${b.cls || ''}" style="left:${pos(b.from)};width:${(b.to - b.from) / S.R * 100}%"><b>${b.label || ''}</b></div>`).join('');
  const now = `<div class="tl-now" style="left:${pos(S.T)}"></div>`;
  let h = `<div class="tl"><div class="tl-row"><span class="tl-lab">arrived</span><div class="tl-track">${bands}${marks(S.arr)}${now}</div></div>`;
  if (S.serverRow) h += `<div class="tl-row"><span class="tl-lab">reached API</span><div class="tl-track">${marks(S.srv)}${now}</div></div>`;
  let ax = '';
  for (let t = 0; t <= S.R; t += (S.R > 12 ? 2 : 1)) ax += `<span style="left:${pos(t)}">${t}</span>`;
  h += `<div class="tl-axis">${ax}</div><div class="tl-key"><span><i></i>allowed</span>${S.serverRow ? '<span><i class="amb"></i>waiting in queue</span>' : ''}<span><i class="bad"></i>429 rejected</span></div></div>`;
  return h;
}
function paint() {
  if (S.bandFn) S.bands = S.bandFn();
  Net.set('lim', { body: `<div class="clk">t = ${fmt(S.T)} s <span>· ${S.rule}</span></div>` + S.limHTML() });
  Net.set('srv', { body: tw([['handled: ' + S.served, 'h']]) });
  Net.set('tl', { body: tlHTML() });
}
// one request: user → limiter → API (allowed) or back to the user (429)
async function hit(ctx, t, decide, fast) {
  S.T = t; paint();
  await go(ctx, 'c', 'lim', 'GET /api', '', fast ? 420 : 700);
  const ok = decide(t);
  S.arr.push({ t, c: ok ? '' : 'bad' }); paint();
  if (ok) {
    await go(ctx, 'lim', 'srv', 'allowed', 'ok', fast ? 420 : 650);
    S.served++; S.srv.push({ t, c: '' }); paint();
  } else {
    Net.flash('lim', 'bad');
    await go(ctx, 'lim', 'c', '429 Too Many', 'bad', fast ? 420 : 650);
  }
  return ok;
}
async function hits(ctx, times, decide) { for (const t of times) await hit(ctx, t, decide, true); }

// ================= 1: fixed window counter =================
let F;
function fixedHTML() {
  const w = Math.floor(S.T / 10);
  return [0, 1].map(i => {
    const n = F.count[i] || 0;
    return `<div class="kv ${i === w ? (n >= 5 ? 'bad' : 'chg') : ''}"><span>u123:${i * 10}-${i * 10 + 10}s</span><b>${n} / 5</b></div>`;
  }).join('') + (F.fm ? `<div class="fm ${F.fmc}">${F.fm}</div>` : '');
}
function fixedDecide(t) {
  const w = Math.floor(t / 10), n = F.count[w] || 0;
  if (n >= 5) { F.fm = 'count is 5 → 429'; F.fmc = 'bad'; return false; }
  F.count[w] = n + 1; F.fm = 'INCR → ' + (n + 1) + ' (≤ 5) → allow'; F.fmc = 'ok';
  return true;
}
function setup1() {
  base({ R: 20, name: 'fixed window counter', rule: '5 per 10 s' });
  F = { count: {}, fm: '', fmc: '' };
  S.limHTML = fixedHTML;
  S.bands = [{ from: 0, to: 10, label: 'window 0–10 s' }, { from: 10, to: 20, label: 'window 10–20 s' }];
  paint();
  panel([['How', 'Cut time into fixed windows (0–10 s, 10–20 s…). One counter per user per window; over 5 → 429'], ['Redis', '<code>INCR u123:0-10s</code> + <code>EXPIRE 10</code>. One number per user'], ['Flaw', 'Counters <b>reset at the boundary</b>: 5 at 9.x s + 5 at 10.x s = 10 requests in 2 s, double the limit'], ['Fix', 'Don\'t use fixed windows; measure the last 10 s from <b>now</b> → sliding window']]);
}
async function run1(ctx) {
  await step(ctx, 'Rule: <b>5 requests per 10 seconds</b>. One counter per window.', '', 1800);
  await hit(ctx, 1, fixedDecide);
  await step(ctx, 'First request: <b>INCR</b> the counter for window 0–10 s → 1. Allowed.', '', 2000);
  await hits(ctx, [2, 3, 4, 5], fixedDecide);
  await step(ctx, '5 requests: the counter is full.', '', 1600);
  await hit(ctx, 6, fixedDecide);
  await step(ctx, 'The 6th in the same window → <b>429 Too Many Requests</b>.', 'err');
  S.T = 10; F.fm = 'new window → new counter, 0'; F.fmc = ''; paint();
  await step(ctx, 'At <b>10 s</b> a new window starts, with a fresh counter.', '', 2000);
  await hit(ctx, 10.5, fixedDecide);
  await step(ctx, 'Simple and cheap: one number per user.', 'win');
  // the flaw
  F = { count: {}, fm: '', fmc: '' }; S.arr = []; S.srv = []; S.served = 0; S.T = 0;
  S.bands = [{ from: 0, to: 10 }, { from: 10, to: 20 }]; paint();
  await step(ctx, 'Now the flaw. Fresh start: the user waits, then sends a burst at the <b>very end</b> of the window.', '', 2400);
  await hits(ctx, [9, 9.2, 9.4, 9.6, 9.8], fixedDecide);
  await step(ctx, '5 requests at 9.0–9.8 s: all allowed.', '', 1600);
  await hits(ctx, [10, 10.2, 10.4, 10.6, 10.8], fixedDecide);
  S.bands.push({ from: 9, to: 11, cls: 'bad', label: '10 requests in 2 s!' }); paint();
  say('Flaw: the counter <b>resets</b> at 10 s, so <b>10 requests in 2 seconds</b> got through, <b>double</b> the limit.', 'err');
}

// ================= 2: sliding window log =================
let G;
function logHTML() {
  const rows = G.log.map(x => [fmt(x) + ' s', x > S.T - 10 ? '' : 'gone']);
  const n = G.log.filter(x => x > S.T - 10).length;
  return table('stored timestamps (sorted set)', rows.slice(-6)) + `<div class="fm ${G.fmc}">${G.fm || 'in the last 10 s: ' + n + ' / 5'}</div>`;
}
function logDecide(t) {
  G.log = G.log.filter(x => x > t - 10);
  const n = G.log.length;
  if (n >= 5) { G.fm = 'last 10 s already has 5 → 429'; G.fmc = 'bad'; return false; }
  G.log.push(t); G.fm = 'last 10 s had ' + n + ' → allow, store ' + fmt(t); G.fmc = 'ok';
  return true;
}
function setup2() {
  base({ R: 20, name: 'sliding window log', rule: '5 in any 10 s' });
  G = { log: [], fm: '', fmc: '' };
  S.limHTML = logHTML;
  S.bandFn = () => (S.T > 0 ? [{ from: Math.max(0, S.T - 10), to: S.T, label: 'last 10 s' }] : []);
  paint();
  panel([['How', 'Store the <b>time</b> of every allowed request. On each new one, drop times older than 10 s and count the rest'], ['Redis', 'A sorted set per user: <code>ZREMRANGEBYSCORE</code> (drop old) + <code>ZCARD</code> (count) + <code>ZADD</code> (store)'], ['Flaw', '<b>Memory</b>: one entry per request. 1M users × 100 requests = 100M timestamps'], ['Fix', 'Keep just <b>two counters</b> and estimate → sliding window counter']]);
}
async function run2(ctx) {
  await step(ctx, 'Store the <b>time of every request</b>. Count only those in the <b>last 10 s</b>, measured back from now.', '', 2400);
  await hits(ctx, [9, 9.2, 9.4, 9.6, 9.8], logDecide);
  await step(ctx, 'The same boundary burst: 5 at 9.0–9.8 s are stored.', '', 1800);
  await hit(ctx, 10, logDecide);
  await hit(ctx, 10.4, logDecide, true);
  await step(ctx, 'At 10 s nothing resets: the last 10 s still has 5 → <b>429</b>. The boundary trick is caught.', 'win');
  S.T = 19.1; paint();
  await step(ctx, 'Jump to 19.1 s: the 9.0 s entry is now <b>older than 10 s</b>, so it drops out.', '', 2200);
  await hit(ctx, 19.1, logDecide);
  await step(ctx, 'One slot freed → allowed. <b>Exact</b>, at every moment.', 'win');
  G.fm = '1M users × 100 entries = 100M timestamps'; G.fmc = 'bad'; paint();
  say('Flaw: <b>memory</b>. It keeps a timestamp for <b>every</b> request of every user.', 'err');
}

// ================= 3: sliding window counter =================
let H;
function scHTML() {
  const w = Math.floor(S.T / 10);
  return `<div class="kv"><span>previous window</span><b>${H.counts[w - 1] || 0}</b></div><div class="kv chg"><span>current window</span><b>${H.counts[w] || 0}</b></div>` + (H.fm ? `<div class="fm ${H.fmc}">${H.fm}</div>` : '<div class="fm">current + previous × overlap</div>');
}
function scDecide(t) {
  const w = Math.floor(t / 10), prev = H.counts[w - 1] || 0, cur = H.counts[w] || 0;
  const share = Math.round((10 - (t - w * 10)) / 10 * 100) / 100;
  const est = cur + prev * share;
  const sum = `${cur} + ${prev} × ${share.toFixed(2)} = ${(Math.round(est * 100) / 100)}`;
  if (est >= 5) { H.fm = sum + ' → 429'; H.fmc = 'bad'; return false; }
  H.counts[w] = cur + 1; H.fm = sum + ' → allow'; H.fmc = 'ok';
  return true;
}
function setup3() {
  base({ R: 20, name: 'sliding window counter', rule: '≈ 5 in any 10 s' });
  H = { counts: {}, fm: '', fmc: '' };
  S.limHTML = scHTML;
  S.bandFn = () => (S.T > 10 ? [{ from: 0, to: 10 }, { from: S.T - 10, to: S.T, label: 'last 10 s' }].concat(H.real ? [H.real] : []) : [{ from: 0, to: 10 }]);
  paint();
  panel([['How', 'Two counters: previous window and current window. Estimate = <b>current + previous × (share of the last 10 s that lies in the previous window)</b>'], ['Redis', 'Two keys per user, like fixed window: cheap'], ['Flaw', '<b>Approximation</b>: it assumes the previous window\'s requests were spread evenly. Bunched ones give a wrong answer'], ['Fix', 'Different idea altogether: buckets']]);
}
async function run3(ctx) {
  await step(ctx, 'Keep only <b>two counters</b>. First, the previous window (0–10 s) gets 5 requests, all early.', '', 2400);
  await hits(ctx, [0.5, 0.8, 1.1, 1.4, 1.7], scDecide);
  H.fm = ''; S.T = 12; paint();
  await step(ctx, 'Now it is 12 s. The last 10 s (2–12 s) overlaps the previous window by <b>80%</b>.', '', 2400);
  await hit(ctx, 12, scDecide);
  await step(ctx, 'Estimate: current 0 + previous 5 × 0.8 = <b>4</b> → under 5, allowed. Just two numbers per user.', 'win');
  await hit(ctx, 12.5, scDecide);
  await step(ctx, '1 + 5 × 0.75 = 4.75 → allowed.', '', 2000);
  await hit(ctx, 13, scDecide);
  await step(ctx, '2 + 5 × 0.7 = <b>5.5</b> → 429.', 'err');
  H.real = { from: 3, to: 13, cls: 'bad', label: 'really: only 2 requests' }; paint();
  say('Flaw: the 5 old requests were all at 0–2 s, so the last 10 s really has only <b>2</b>. It <b>assumed</b> they were spread evenly → <b>wrong 429</b>. It is an approximation.', 'err');
}

// ================= 4: leaky bucket =================
let Q;
function leakyHTML() {
  return bucket(Q.queue, 4, '') + '<div class="bk-out">leaks 1 request to the API every 2 s</div>' + (Q.fm ? `<div class="fm ${Q.fmc}">${Q.fm}</div>` : '');
}
async function arrive(ctx, t, id, fast) {
  S.T = t; paint();
  await go(ctx, 'c', 'lim', 'req ' + id, '', fast ? 420 : 700);
  if (Q.queue.length >= 4) {
    S.arr.push({ t, c: 'bad' }); Q.fm = 'bucket full → 429'; Q.fmc = 'bad'; paint();
    Net.flash('lim', 'bad');
    await go(ctx, 'lim', 'c', '429', 'bad', fast ? 420 : 650);
    return;
  }
  Q.queue.push('req ' + id); S.arr.push({ t, c: 'amb' }); Q.fm = 'queued (' + Q.queue.length + ' / 4)'; Q.fmc = ''; paint();
}
async function leak(ctx, t) {
  S.T = t; const r = Q.queue.shift(); Q.fm = r + ' leaks out'; Q.fmc = 'ok'; paint();
  await go(ctx, 'lim', 'srv', r, 'ok', 700);
  S.served++; S.srv.push({ t, c: '' }); paint();
}
function setup4() {
  base({ R: 12, name: 'leaky bucket (a queue)', rule: 'queue 4, out 1 per 2 s', serverRow: true });
  Q = { queue: [], fm: '', fmc: '' };
  S.limHTML = leakyHTML;
  paint();
  panel([['How', 'Requests go into a <b>queue</b> of fixed size. They leave at a <b>fixed rate</b> (1 every 2 s). Queue full → 429'], ['Good', 'The API gets a perfectly <b>steady</b> flow, whatever the user does'], ['Flaw', '<b>Delay</b>: bursts wait in the queue even when the API is idle, and old requests hold up new ones'], ['Fix', 'Let saved-up capacity be used straight away → token bucket']]);
}
async function run4(ctx) {
  await step(ctx, 'Requests drop into a <b>bucket (queue) of 4</b>. It leaks <b>one request every 2 s</b> to the API.', '', 2400);
  for (let i = 1; i <= 5; i++) await arrive(ctx, 0.8 + i * 0.2, i, i > 1);
  await step(ctx, 'A burst of 5: 4 fit in the bucket, the 5th <b>overflows</b> → 429.', 'err');
  await leak(ctx, 2);
  await step(ctx, 'At 2 s, req 1 leaks out to the API.', '', 1800);
  await arrive(ctx, 3, 6);
  await step(ctx, 'req 6 arrives at 3 s and joins the <b>back</b> of the queue.', '', 1800);
  for (const t of [4, 6, 8, 10]) await leak(ctx, t);
  await step(ctx, 'The API sees a <b>perfectly steady</b> flow: one every 2 s.', 'win');
  S.bands = [{ from: 3, to: 10, cls: 'bad', label: 'req 6 waited 7 s' }]; paint();
  say('Flaw: <b>delay</b>. req 6 arrived at 3 s but reached the API at 10 s, though the API was mostly idle. Bursts are never served fast.', 'err');
}

// ================= 5: token bucket =================
let K;
function tokenHTML() {
  return bucket(Array(K.tokens).fill('token'), 4, 'tok') + '<div class="bk-out">+1 token every 2 s (max 4)</div>' + (K.fm ? `<div class="fm ${K.fmc}">${K.fm}</div>` : '');
}
function tokenDecide() {
  if (K.tokens === 0) { K.fm = 'no token → 429'; K.fmc = 'bad'; return false; }
  K.tokens--; K.fm = 'took a token → ' + K.tokens + ' left'; K.fmc = 'ok';
  return true;
}
async function refill(ctx, t) {
  S.T = t;
  if (K.tokens < 4) { K.tokens++; K.fm = '+1 token → ' + K.tokens; K.fmc = ''; }
  paint(); Net.flash('lim', 'ok');
  await wait(ctx, 700);
}
function setup5() {
  base({ R: 12, name: 'token bucket', rule: '4 tokens, +1 per 2 s', serverRow: true });
  K = { tokens: 4, fm: '', fmc: '' };
  S.limHTML = tokenHTML;
  paint();
  panel([['How', 'A bucket holds up to 4 <b>tokens</b>, refilled at 1 every 2 s. Each request takes one; no token → 429'], ['Good', 'Allows short <b>bursts</b> (saved-up tokens) but limits the average rate. No queue, no waiting'], ['Redis', 'Per user: tokens + last refill time. Read-refill-take must be <b>atomic</b> (a Lua script) when many limiters share it'], ['Flaw', 'The API still gets <b>bursts</b> (up to the bucket size at once), and there are <b>two knobs</b> to tune: size and refill rate']]);
}
async function run5(ctx) {
  await step(ctx, 'The bucket holds up to <b>4 tokens</b> and gets <b>+1 every 2 s</b>. Each request must take a token.', '', 2400);
  await hits(ctx, [1, 1.2, 1.4, 1.6, 1.8], tokenDecide);
  await step(ctx, 'A burst: 4 requests take the 4 saved tokens and go through <b>at once</b>. The 5th finds none → 429.', 'win');
  await refill(ctx, 2);
  await hit(ctx, 2.5, tokenDecide);
  await step(ctx, 'At 2 s one token drips in, and the next request uses it straight away. <b>No waiting in a queue.</b>', '', 2200);
  for (const t of [4, 6, 8]) await refill(ctx, t);
  await step(ctx, 'While the user is quiet, tokens <b>pile up</b> again (max 4).', '', 2000);
  await hits(ctx, [8.5, 8.7, 8.9], tokenDecide);
  S.bands = [{ from: 0.7, to: 2, cls: 'bad', label: 'burst' }, { from: 8.2, to: 9.2, cls: 'bad', label: 'burst' }]; paint();
  say('Flaw: the API still gets <b>bursts</b> (4 at once at 1 s, 3 at 8.5 s) and must cope with them. And you must tune <b>two knobs</b>: bucket size and refill rate.', 'err');
}

// ================= 6: summary =================
const SUM_HEAD = ['algorithm', 'how', 'flaw', 'used by'];
const SUM = [
  ['Fixed window', 'one counter per window (INCR + EXPIRE)', '2× burst at the window boundary', 'simple APIs'],
  ['Sliding log', 'every timestamp; count the last 10 s', 'memory: one entry per request', 'low traffic, must be exact'],
  ['Sliding counter', 'current + previous × overlap', 'approximate (assumes even spread)', 'Cloudflare'],
  ['Leaky bucket', 'queue, leaks at a fixed rate', 'bursts wait → extra delay', 'NGINX limit_req, network shaping'],
  ['Token bucket', 'tokens refill; a request takes one', 'bursts reach the API; 2 knobs to tune', 'AWS API Gateway, Stripe']
];
const sheet = n => '<table class="sheet"><tr>' + SUM_HEAD.map(h => `<th>${h}</th>`).join('') + '</tr>' + SUM.map((r, i) => `<tr class="${i < n ? '' : 'hide'}">` + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('') + '</table>';
function setup6() {
  Net.node('board', { x: 500, y: 270, label: 'Rate limiting algorithms', kind: 'proxy', w: 940, body: sheet(0) });
  $('#final').classList.add('hidden');
}
async function run6(ctx) {
  say('All five on one table, easiest first.');
  for (let i = 1; i <= SUM.length; i++) { await wait(ctx, 1000); Net.set('board', { body: sheet(i) }); }
  say('Each one fixes the flaw of the one before. <b>Token bucket</b> is the usual default for APIs.', 'win');
}

startPage([
  { label: '1 Fixed window', story: 'User u123 calls our API. Rule: 5 requests per 10 seconds.', setup: setup1, run: run1, q: 'A user sends 5 requests at 9.9 s and 5 more at 10.1 s. What happens?', a: ['All 10 are allowed: the counter resets at 10 s.', '10 requests in 0.2 s, double the limit. That is the flaw.'] },
  { label: '2 Sliding log', story: 'Same rule, but measured over the last 10 s from right now.', setup: setup2, run: run2, q: 'How does it catch the boundary burst, and what does it cost?', a: ['It counts stored timestamps in the last 10 s, so nothing resets.', 'Cost: it stores one timestamp per request (memory).'] },
  { label: '3 Sliding counter', story: 'Only two counters per user, and a guess for the rest.', setup: setup3, run: run3, q: 'Why can two counters give a wrong answer?', a: ['It assumes the previous window\'s requests were spread evenly.', 'If they were bunched at the start, it over-counts and rejects wrongly.'] },
  { label: '4 Leaky bucket', story: 'Requests wait in a queue and go out at a fixed rate.', setup: setup4, run: run4, q: 'The API is idle. Does a burst get served quickly?', a: ['No. Everything leaves at 1 per 2 s, so bursts wait in the queue.', 'Steady for the API, slow for the user.'] },
  { label: '5 Token bucket', story: 'Tokens drip in; each request spends one.', setup: setup5, run: run5, q: 'What does the token bucket allow that the leaky bucket doesn\'t?', a: ['Bursts: saved-up tokens let several requests through at once, with no queue.', 'Flip side: the API must handle those bursts, and size + refill rate must be tuned.'] },
  { label: '6 Summary', story: 'All five side by side.', setup: setup6, run: run6, q: 'Which flaw does each algorithm fix?', a: ['Sliding log fixes the boundary burst; sliding counter fixes the memory.', 'Buckets control the rate itself; token bucket allows bursts without the queue delay.'] }
]);
