Net.mount(560, 1.1);

// customer (left) - server (middle) - rider (right)
let C;
const custHTML = () => `<div class="big ${C.fresh ? 'good' : ''}">${C.screen}</div><div class="cap">customer's screen</div>` + kv('requests made', C.creq);
const riderHTML = () => (C.inbox ? tw([['💬 ' + C.inbox, 'amb']]) : '') + kv('requests made', C.rreq);
const paintC = () => Net.set('cu', { body: custHTML() });
const paintR = () => Net.set('ri', { body: riderHTML() });
function scene(serverSub) {
  C = { screen: 'waiting…', fresh: false, creq: 0, rreq: 0, inbox: '' };
  Net.node('cu', { x: 160, y: 280, label: 'Customer app', sub: 'browser', kind: 'client', w: 250, body: custHTML() });
  Net.node('sv', { x: 500, y: 280, label: 'Server', sub: serverSub, kind: 'db', w: 250, body: '' });
  Net.node('ri', { x: 850, y: 280, label: 'Rider app', sub: 'phone', kind: 'server', w: 230, body: riderHTML() });
  Net.link('cu', 'sv'); Net.link('sv', 'ri');
}
const srv = lines => Net.set('sv', { body: tw(lines) });

// ================= 1: SSE =================
function setup1() {
  scene('GET /events · POST /send');
  srv([['no one listening', 'dim']]);
  panel([['Who calls what', '<b>Customer app</b> calls <code>GET /events</code> <b>once</b>: "keep sending me updates". <b>Rider app</b> calls <code>POST /send</code> <b>every time it moves</b>'], ['How the server reaches the customer', 'It never calls the customer. It keeps writing into the reply of the customer\'s <code>GET /events</code>, which never ends'], ['One way', 'The customer can\'t send anything back on that line; it would need a separate request'], ['Used for', 'Live scores, order status, AI answers typing out word by word']]);
}
async function run1(ctx) {
  say('The customer opens the order page. The app makes <b>one</b> request: <b>GET /events</b>.');
  C.creq++; paintC();
  await send('cu', 'sv', 'GET /events', '', 700);
  Net.check(ctx);
  Net.linkSet('cu', 'sv', { cls: 'on' });
  srv([['customer\'s line: open', 'ok'], ['(the reply never ends)', 'dim']]);
  say('The server starts the reply but <b>never finishes it</b>. The line stays open.');
  await Net.beat(ctx, 2000);
  for (const d of ['2 km away', '1 km away', 'at your door']) {
    C.rreq++; paintR();
    await send('ri', 'sv', 'POST /send: ' + d, '', 650);
    Net.check(ctx);
    if (d === '2 km away') say('The rider moves. The <b>rider\'s app</b> makes a normal request: <b>POST /send</b>.');
    await send('sv', 'cu', d, 'ok', 600);
    Net.check(ctx);
    C.screen = d; C.fresh = true; paintC();
    if (d === '2 km away') { say('The server writes "2 km away" into the customer\'s <b>open reply</b>. The screen updates, with no new request from the customer.'); await Net.beat(ctx, 2400); }
    else await wait(ctx, 600);
  }
  say(`Customer: <b>${C.creq} request</b> in total. Rider: <b>${C.rreq} requests</b>, one per update.`);
  await Net.beat(ctx, 2200);
  say('The customer wants to say "ring the bell". The SSE line only goes server → customer…', 'err');
  await lose('cu', 'sv', 'ring the bell');
  Net.check(ctx);
  Net.flash('cu', 'bad');
  await Net.beat(ctx, 1600);
  say('…so it can\'t. SSE is <b>one way</b>. For two-way, we need a WebSocket.', 'win');
}

// ================= 2: WebSocket, both directions =================
function setup2() {
  scene('/chat');
  srv([['people on /chat: 0', 'dim']]);
  panel([['Who calls what', '<b>Both</b> apps connect to <code>/chat</code> <b>once</b>. After that, nobody makes new requests: they just send messages on their open line'], ['Connecting', 'Starts as HTTP: "<code>Upgrade: websocket</code>" → server answers "<code>101 Switching Protocols</code>" → now it\'s a two-way pipe'], ['The server', 'Gets a message on one line and writes it into the other line(s). Rider → customer and customer → rider work the same way'], ['Used for', 'Chat, live location with replies, multiplayer games, collaborative docs']]);
}
async function run2(ctx) {
  say('Both apps open a line to <b>/chat</b>, once.');
  C.creq++; C.rreq++; paintC(); paintR();
  await both([send('cu', 'sv', 'Upgrade: websocket', '', 700), send('ri', 'sv', 'Upgrade: websocket', '', 700)]);
  Net.check(ctx);
  await both([send('sv', 'cu', '101', 'ok', 600), send('sv', 'ri', '101', 'ok', 600)]);
  Net.check(ctx);
  Net.linkSet('cu', 'sv', { cls: 'on' }); Net.linkSet('sv', 'ri', { cls: 'on' });
  srv([['people on /chat: 2', 'ok']]);
  say('Two open lines: customer ⇄ server and rider ⇄ server.');
  await Net.beat(ctx, 2000);
  say('<b>Rider → customer:</b> the rider sends "2 km away" on its own line.');
  await send('ri', 'sv', '2 km away', '', 650);
  Net.check(ctx);
  await send('sv', 'cu', '2 km away', 'ok', 600);
  Net.check(ctx);
  C.screen = '2 km away'; C.fresh = true; paintC();
  await Net.beat(ctx, 2200);
  say('<b>Customer → rider:</b> the customer types "please ring the bell" and sends it on <b>its own line</b>.');
  await send('cu', 'sv', 'please ring the bell', '', 650);
  Net.check(ctx);
  await send('sv', 'ri', 'please ring the bell', 'ok', 600);
  Net.check(ctx);
  C.inbox = 'please ring the bell'; paintR();
  await Net.beat(ctx, 2200);
  say(`Still <b>1 request each</b> (the connect). Messages flow <b>both ways</b> on the same open lines.`, 'win');
}

startPage([
  { label: '1 SSE', story: 'The customer watches the rider; the rider sends updates.', setup: setup1, run: run1, q: 'Who calls GET /events, who calls POST /send, and how many times?', a: ['The customer\'s app calls GET /events once; that reply never ends.', 'The rider\'s app calls POST /send every time it moves.', 'The server writes each update into the customer\'s open reply. The customer can\'t send back on it.'] },
  { label: '2 WebSocket', story: 'The rider sends updates, and the customer replies.', setup: setup2, run: run2, q: 'How does a message go from the customer to the rider on a WebSocket?', a: ['Both apps opened a line to /chat once (Upgrade → 101).', 'The customer sends on its own line, and the server writes it into the rider\'s line.', 'No new request per message, in either direction.'] }
]);
