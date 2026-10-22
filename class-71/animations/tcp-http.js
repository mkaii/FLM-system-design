Net.mount(600, 1.1);

// Two lanes, one above the other: a sender on the left, a receiver on the right.
function lanes(top, bottom) {
  Net.group({ x: 16, y: 14, w: 968, h: 280, label: top });
  Net.group({ x: 16, y: 306, w: 968, h: 280, label: bottom });
}

// ================= 1: TCP vs UDP =================
let GOT;
const gotHTML = (k, waitNote) => tw([['received: ' + (GOT[k].length ? GOT[k].join(' ') : '–'), GOT[k].length === 5 ? 'ok' : ''], [waitNote || '', waitNote && waitNote.indexOf('waiting') === 0 ? 'bad' : 'dim']]);
function setup1() {
  GOT = { t: [], u: [] };
  lanes('TCP: every packet arrives, in order', 'UDP: send and forget');
  Net.node('ts', { x: 170, y: 160, label: 'Sender', kind: 'client', w: 220, body: tw([['sends packets 1 2 3 4 5', 'dim']]) });
  Net.node('tr', { x: 820, y: 160, label: 'Receiver', kind: 'db', w: 260, body: gotHTML('t') });
  Net.node('us', { x: 170, y: 450, label: 'Sender', kind: 'client', w: 220, body: tw([['sends packets 1 2 3 4 5', 'dim']]) });
  Net.node('ur', { x: 820, y: 450, label: 'Receiver', kind: 'db', w: 260, body: gotHTML('u') });
  Net.link('ts', 'tr'); Net.link('us', 'ur');
  panel([['TCP', 'Handshake first. Every packet is numbered; a lost one is <b>resent</b>, and the receiver hands data to the app <b>in order</b>'], ['UDP', 'No handshake. Packets are just sent. A lost one is <b>gone</b>; nobody waits for it'], ['Used for', '<b>TCP</b>: web pages, APIs, files (every byte matters). <b>UDP</b>: video calls, games, DNS, and HTTP/3 (QUIC adds its own resending on top)']]);
}
async function run1(ctx) {
  say('Both senders send packets <b>1 to 5</b>. Packet <b>3</b> gets lost on the way, in both lanes.');
  await Net.beat(ctx, 1800);
  for (let p = 1; p <= 5; p++) {
    if (p === 3) {
      await both([lose('ts', 'tr', '3'), lose('us', 'ur', '3')]);
    } else {
      await both([send('ts', 'tr', '' + p, 'ok', 550), send('us', 'ur', '' + p, 'ok', 550)]);
      Net.check(ctx);
      if (p < 3) GOT.t.push(p);
      GOT.u.push(p);
    }
    Net.check(ctx);
    Net.set('tr', { body: gotHTML('t', p > 3 ? 'waiting for 3… holding 4' + (p === 5 ? ' 5' : '') : '') });
    Net.set('ur', { body: gotHTML('u', p > 3 ? 'gave 4' + (p === 5 ? ', 5' : '') + ' to the app; 3 is skipped' : '') });
  }
  say('<b>UDP</b> handed 1 2 4 5 to the app; 3 is simply skipped. <b>TCP</b> holds back 4 and 5 until 3 arrives.');
  await Net.beat(ctx, 2600);
  await send('tr', 'ts', 'resend 3', 'bad', 700);
  Net.check(ctx);
  await send('ts', 'tr', '3', 'ok', 700);
  Net.check(ctx);
  GOT.t = [1, 2, 3, 4, 5];
  Net.set('tr', { body: gotHTML('t', 'all 5, in order ✓') });
  say('TCP asked for 3 again, got it, and delivered <b>1 2 3 4 5</b>. Complete and in order, but it had to <b>wait</b>.', 'win');
}

// ================= 2: HTTP/1.0 vs HTTP/1.1 =================
const API = ['/menu', '/offers', '/cart'];
function counters(id, hs, label) { Net.set(id, { body: kv('handshakes', hs, hs > 1 ? 'bad' : 'good') + tw([[label || '', 'dim']]) }); }
function setup2() {
  lanes('HTTP/1.0: a new connection for every request', 'HTTP/1.1: one connection, reused (keep-alive)');
  Net.node('ab', { x: 170, y: 160, label: 'Browser', kind: 'client', w: 220, body: '' });
  Net.node('as', { x: 820, y: 160, label: 'swiggy.com', kind: 'db', w: 220, body: '' });
  Net.node('bb', { x: 170, y: 450, label: 'Browser', kind: 'client', w: 220, body: '' });
  Net.node('bs', { x: 820, y: 450, label: 'swiggy.com', kind: 'db', w: 220, body: '' });
  Net.link('ab', 'as'); Net.link('bb', 'bs');
  counters('ab', 0); counters('bb', 0);
  panel([['Example', 'The app calls 3 APIs: <code>/menu</code>, <code>/offers</code>, <code>/cart</code>'], ['HTTP/1.0', 'For each call: handshake → ask → answer → hang up. <b>3 handshakes</b>'], ['HTTP/1.1', '<b>1 handshake per line</b>, then the line is reused: ask, answer, ask, answer. One request at a time on a line, so to go faster the browser opens more lines to the same server (up to <b>6</b>), and each new line costs its own handshake'], ['Used for', 'HTTP/1.1: still common, and inside data centres (load balancer → our Spring Boot apps)']]);
}
async function run2(ctx) {
  say('The app needs 3 APIs. Watch how many <b>handshakes</b> each version does.');
  await Net.beat(ctx, 1800);
  let a = 0, b = 0;
  for (let i = 0; i < 3; i++) {
    // HTTP/1.0: handshake every time
    a++; counters('ab', a, 'handshake for ' + API[i]);
    await send('ab', 'as', 'handshake', '', 500);
    Net.check(ctx);
    if (i === 0) { b++; counters('bb', b, 'handshake (once)'); await send('bb', 'bs', 'handshake', '', 500); Net.check(ctx); }
    await both([send('ab', 'as', 'GET ' + API[i], '', 500), send('bb', 'bs', 'GET ' + API[i], '', 500)]);
    Net.check(ctx);
    await both([send('as', 'ab', '200', 'ok', 500), send('bs', 'bb', '200', 'ok', 500)]);
    Net.check(ctx);
    counters('ab', a, 'hang up ✗');
    Net.linkSet('ab', 'as', { dashed: true });
    counters('bb', b, API.slice(0, i + 1).join(' ') + ' done, line still open');
    Net.linkSet('bb', 'bs', { cls: 'on' });
    await wait(ctx, 600);
    Net.linkSet('ab', 'as', { dashed: false });
  }
  say('HTTP/1.0: <b>3 handshakes</b>. HTTP/1.1 on one line: <b>1 handshake</b>, then reused, one request at a time. (If the browser opens 6 lines to go faster, that is 6 handshakes.)', 'win');
}

// ================= 3: HTTP/2 vs HTTP/3, one lost packet =================
let ST;
function apiHTML(k) { return API.map(a => { const s = ST[k][a]; return `<div class="fr ${s === 'done' ? 'done' : s === 'wait' ? 'stall' : 'load'}"><span>${a}</span><span class="bar"><i style="width:${s === 'done' ? 100 : 60}%"></i></span><span class="t">${s === 'done' ? '✓' : s === 'wait' ? 'waits' : ''}</span></div>`; }).join(''); }
function setup3() {
  ST = { a: {}, b: {} };
  API.forEach(x => { ST.a[x] = 'load'; ST.b[x] = 'load'; });
  lanes('HTTP/2: 3 APIs at once on 1 line (TCP)', 'HTTP/3: 3 APIs at once on 1 line (QUIC on UDP)');
  Net.node('ab', { x: 170, y: 160, label: 'Browser', kind: 'client', w: 240, body: apiHTML('a') });
  Net.node('as', { x: 820, y: 160, label: 'swiggy.com', kind: 'db', w: 200, body: kv('handshakes', '1', 'good') });
  Net.node('bb', { x: 170, y: 450, label: 'Browser', kind: 'client', w: 240, body: apiHTML('b') });
  Net.node('bs', { x: 820, y: 450, label: 'swiggy.com', kind: 'db', w: 200, body: kv('handshakes', '1', 'good') });
  Net.link('ab', 'as', { cls: 'on' }); Net.link('bb', 'bs', { cls: 'on' });
  panel([['Same in both', 'One line, all 3 APIs asked at once; the answers come back mixed together'], ['A packet is lost', 'A piece of <code>/offers</code>\' answer goes missing. It is resent automatically; the app never sees an error'], ['HTTP/2', 'TCP must deliver in order, so <code>/menu</code> and <code>/cart</code> <b>wait too</b>, even though their data already arrived'], ['HTTP/3', 'QUIC keeps each API separate: <code>/menu</code> and <code>/cart</code> finish; only <code>/offers</code> waits'], ['Used for', 'HTTP/2: most websites. HTTP/3: Google, YouTube, Facebook, Cloudflare sites']]);
}
async function run3(ctx) {
  say('Both browsers ask for <b>/menu, /offers and /cart at once</b>, on one line.');
  await both([send('ab', 'as', 'GET ×3', '', 600), send('bb', 'bs', 'GET ×3', '', 600)]);
  Net.check(ctx);
  await Net.beat(ctx, 1200);
  say('The answers come back mixed. A piece of <b>/offers</b> is lost in both lanes.', 'err');
  await both([send('as', 'ab', 'menu', 'ok', 600), send('bs', 'bb', 'menu', 'ok', 600)]);
  Net.check(ctx);
  await both([lose('as', 'ab', 'offers'), lose('bs', 'bb', 'offers')]);
  Net.check(ctx);
  await both([send('as', 'ab', 'cart', 'ok', 600), send('bs', 'bb', 'cart', 'ok', 600)]);
  Net.check(ctx);
  API.forEach(x => { ST.a[x] = 'wait'; });
  ST.b['/menu'] = 'done'; ST.b['/cart'] = 'done'; ST.b['/offers'] = 'wait';
  Net.set('ab', { body: apiHTML('a') }); Net.set('bb', { body: apiHTML('b') });
  Net.flash('ab', 'bad');
  say('<b>HTTP/2</b>: all 3 wait, because TCP won\'t hand over anything past the gap. <b>HTTP/3</b>: /menu and /cart are done; only /offers waits.');
  await Net.beat(ctx, 3000);
  await both([send('as', 'ab', 'offers (resent)', 'ok', 700), send('bs', 'bb', 'offers (resent)', 'ok', 700)]);
  Net.check(ctx);
  API.forEach(x => { ST.a[x] = 'done'; ST.b[x] = 'done'; });
  Net.set('ab', { body: apiHTML('a') }); Net.set('bb', { body: apiHTML('b') });
  say('The resend arrives and everything completes. HTTP/3 just meant <b>less waiting</b> for the other APIs.', 'win');
}

// ================= 4: see it in DevTools =================
const ROWS = [['www.google.com', 'document', 'h3'], ['gstatic.com/…/logo.png', 'png', 'h3'], ['apis.google.com/…/cb.js', 'script', 'h2'], ['an older site', 'document', 'http/1.1']];
const devtools = n => '<table class="sheet"><tr><th>name</th><th>type</th><th>protocol</th></tr>' + ROWS.map((r, i) => `<tr class="${i < n ? '' : 'hide'}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('') + '</table>'
  + `<div class="kv" style="margin-top:10px"><span>response header of an h2 request</span><b>alt-svc: h3=":443"</b></div>`;
function setup5() {
  Net.node('dt', { x: 500, y: 290, label: 'Chrome DevTools → Network', sub: 'right-click a column header → tick Protocol', kind: 'proxy', w: 700, body: devtools(0) });
  panel([['Steps', 'Right-click → Inspect → <b>Network</b> → reload → right-click a column header → tick <b>Protocol</b>'], ['Reading it', '<code>h3</code> = HTTP/3 on UDP. <code>h2</code> = HTTP/2 on TCP. <code>http/1.1</code> = HTTP/1.1 on TCP. TCP/UDP itself is not a column'], ['First load shows h2?', 'The server\'s <code>alt-svc: h3=":443"</code> header tells Chrome "I also speak HTTP/3", so the next reload uses <code>h3</code>']]);
}
async function run5(ctx) {
  say('Open google.com with the Protocol column on.');
  for (let i = 1; i <= ROWS.length; i++) { await wait(ctx, 800); Net.set('dt', { body: devtools(i) }); }
  say('<b>h3</b> = UDP, everything else = TCP. The <b>alt-svc</b> header is how Chrome learns that HTTP/3 is available.', 'win');
}

startPage([
  { label: '1 TCP vs UDP', story: 'Sending 5 packets; packet 3 gets lost.', setup: setup1, run: run1, q: 'Packet 3 of 5 is lost. What does TCP do, and what does UDP do?', a: ['TCP resends 3 and holds 4 and 5 until it arrives, then delivers 1 2 3 4 5 in order.', 'UDP delivers 1 2 4 5; 3 is gone and nobody waits for it.'] },
  { label: '2 HTTP/1.0 vs 1.1', story: 'The app calls /menu, /offers and /cart, one after another.', setup: setup2, run: run2, q: 'How many handshakes for 3 API calls in HTTP/1.0, and in HTTP/1.1?', a: ['HTTP/1.0: 3, one per request (connect, ask, answer, hang up).', 'HTTP/1.1: 1 per line. One line reused for all 3 = 1 handshake.', 'If the browser opens more lines to go faster (up to 6), each line has its own handshake.'] },
  { label: '3 HTTP/2 vs 3', story: '3 APIs at once on one line; a packet of /offers is lost.', setup: setup3, run: run3, q: 'A piece of /offers\' answer is lost. Do /menu and /cart have to wait?', a: ['HTTP/2: yes. TCP delivers in order, so everything after the gap waits.', 'HTTP/3: no. QUIC keeps each API separate; only /offers waits.', 'In both, the lost piece is resent automatically; the app never sees an error.'] },
  { label: '4 DevTools', story: 'See it on real websites.', setup: setup5, run: run5, q: 'Where in Chrome can you see which HTTP version a request used?', a: ['DevTools → Network → Protocol column: h3, h2 or http/1.1.', 'h3 means UDP; the others mean TCP.'] }
]);
