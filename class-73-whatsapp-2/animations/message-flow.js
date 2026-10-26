Net.mount(580, 1.1);

const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + (rows.length ? rows.map(r => `<div class="${r[1] || ''}">${r[0]}</div>`).join('') : '<div class="dim">empty</div>') + '</div>';
const bubble = (text, ticks, blue, incoming) => `<div style="text-align:${incoming ? 'left' : 'right'}"><span class="bub ${incoming ? 'in' : ''}">${esc(text)}${ticks ? `<span class="tk ${blue ? 'blue' : ''}">${ticks}</span>` : ''}</span></div>`;

// ================= 6: one chat server and its connection map =================
let MAP;
function serverHTML(cap) {
  return table('clientId → connection', MAP) + (cap ? `<div class="cap" style="margin-top:6px">${cap.label}</div><div class="mbar"><i style="width:${cap.pct}%"></i></div>` : '');
}
function setup6() {
  MAP = [];
  Net.node('d1', { x: 140, y: 110, label: "Aman's phone", kind: 'client', w: 200, body: tw([['offline', 'dim']]) });
  Net.node('d2', { x: 140, y: 290, label: "Riya's phone", kind: 'client', w: 200, body: tw([['offline', 'dim']]) });
  Net.node('d3', { x: 140, y: 470, label: "Riya's tablet", kind: 'client', w: 200, body: tw([['offline', 'dim']]) });
  Net.node('cs', { x: 640, y: 290, label: 'Chat server (just one, for now)', sub: 'holds every WebSocket', kind: 'db', w: 360, body: serverHTML() });
  ['d1', 'd2', 'd3'].forEach(d => Net.link(d, 'cs', { dashed: true }));
  panel([['The map', 'An in-memory map: <code>clientId → its WebSocket</code>. Added when a device connects, removed when it disconnects'], ['Why per device', 'Riya has a phone and a tablet: two connections, two entries'], ['How many fit', 'Memory is the limit: <b>16 GB ÷ ~30 KB</b> per connection ≈ <b>530,000</b>. Heavier Java apps (~100 KB) ≈ 160,000. WhatsApp got 1–2 million per (big) server'], ['Also needed', 'One OS file handle per connection (raise the open-file limit)']]);
}
async function run6(ctx) {
  say('Every device opens <b>one</b> WebSocket to the chat server. The server remembers each one in a <b>map</b>.');
  const devs = [['d1', 'aman-phone', 'conn 1'], ['d2', 'riya-phone', 'conn 2'], ['d3', 'riya-tablet', 'conn 3']];
  for (const d of devs) {
    await send(d[0], 'cs', 'connect', '', 600);
    Net.check(ctx);
    Net.linkSet(d[0], 'cs', { dashed: false, cls: 'on' });
    Net.set(d[0], { body: tw([['connected', 'ok']]) });
    MAP.forEach(r => { r[1] = ''; });
    MAP.push([d[1] + ' → ' + d[2], 'new']);
    Net.set('cs', { body: serverHTML() });
    await wait(ctx, 500);
  }
  say('3 devices, 3 entries. Riya has <b>two</b>: her phone and her tablet.');
  await Net.beat(ctx, 2400);
  say('How many connections can one server hold? <b>Memory</b> decides: each open connection costs ~30 KB.');
  for (const c of [{ label: '16 GB ÷ 30 KB per connection', pct: 30 }, { label: '≈ 530,000 connections', pct: 70 }, { label: '≈ 530,000 connections (WhatsApp: 1–2 million on big servers)', pct: 100 }]) {
    await wait(ctx, 900); Net.set('cs', { body: serverHTML(c) });
  }
  say('One server can hold a lot, but not <b>billions</b>. Many servers is the next class; today, one.', 'win');
}

// ================= 7: a live chat room needs no database =================
function setup7live() {
  Net.node('a', { x: 130, y: 150, label: 'Aman', sub: 'in the room', kind: 'client', w: 200, body: tw([['connected', 'ok']]) });
  Net.node('r', { x: 130, y: 420, label: 'Riya', sub: 'in the room', kind: 'client', w: 200, body: tw([['connected', 'ok']]) });
  Net.node('cs', { x: 500, y: 290, label: 'Chat server', sub: 'room: IPL final live chat', kind: 'proxy', w: 260, body: tw([['in the room: aman, riya', 'h'], ['no database', 'dim']]) });
  Net.node('sa', { x: 870, y: 290, label: 'Sara', sub: 'not here yet', kind: 'client', w: 200, state: 'down', badge: 'not connected', badgeCls: 'bad', body: tw([['…', 'dim']]) });
  Net.link('a', 'cs', { cls: 'on' }); Net.link('r', 'cs', { cls: 'on' }); Net.link('cs', 'sa', { dashed: true });
  panel([['Live chat room', 'The server just <b>relays</b>: a message comes in, it goes out to whoever is connected right now. No database at all (like our class 71 WebSocket demo)'], ['What you lose', 'Anyone not connected at that moment misses it; joining late or refreshing shows no history; a server crash loses messages in flight'], ['Fine for', 'Live stream and match comments, game lobby chat, "typing…" signals'], ['WhatsApp', 'Must reach people who are offline and never lose a message → it <b>saves first</b> (next step)']]);
}
async function run7live(ctx) {
  say('A <b>live chat room</b> for the IPL final. Aman and Riya are in; Sara isn\'t yet.');
  await Net.beat(ctx, 2000);
  Net.set('a', { body: bubble('GOAL!! what a six 🔥', '', false) });
  await send('a', 'cs', '"what a six"', '', 650);
  Net.check(ctx);
  say('The server doesn\'t save anything. It just passes the message to <b>everyone connected right now</b>.');
  await both([send('cs', 'r', '"what a six"', 'ok', 650), lose('cs', 'sa', 'Sara')]);
  Net.check(ctx);
  Net.set('r', { body: bubble('GOAL!! what a six 🔥', '', false, true) });
  say('Riya gets it instantly. Sara wasn\'t connected, so for her it\'s simply <b>gone</b>.', 'err');
  await Net.beat(ctx, 2600);
  say('Two minutes later, Sara joins.');
  Net.set('sa', { state: '', badge: '', sub: 'just joined', body: tw([['(empty: no history)', 'dim']]) });
  await send('sa', 'cs', 'join', '', 600);
  Net.check(ctx);
  Net.linkSet('cs', 'sa', { dashed: false, cls: 'on' });
  Net.set('cs', { body: tw([['in the room: aman, riya, sara', 'h'], ['no database', 'dim']]) });
  say('Sara sees <b>nothing</b> from before: there\'s nowhere to fetch it from. For live match chat, that\'s fine.');
  await Net.beat(ctx, 2600);
  say('WhatsApp can\'t work like this: Riya\'s tablet may be off for hours. So WhatsApp <b>saves every message first</b>.', 'win');
}

// ================= shared scene for steps 8-10 =================
let INB, MSGS;
const paintDb = () => Net.set('db', { body: table('Message: id · chat · sender · text', MSGS) + '<div style="height:6px"></div>' + table('Inbox: clientId · messageId · expiresAt', INB) });
function scene(o) {
  INB = []; MSGS = [];
  Net.node('a', { x: 130, y: 150, label: "Aman's phone", kind: 'client', w: 210, body: '' });
  Net.node('cs', { x: 500, y: 150, label: 'Chat server', sub: 'map: who is on which connection', kind: 'proxy', w: 260, body: '' });
  Net.node('rp', { x: 870, y: o.tablet ? 110 : 150, label: "Riya's phone", kind: 'client', w: 210, body: tw([['online', 'ok']]) });
  if (o.tablet) Net.node('rt', { x: 870, y: 360, label: "Riya's tablet", kind: 'client', w: 210, state: 'down', badge: 'offline', badgeCls: 'bad', body: tw([['switched off', 'dim']]) });
  Net.node('db', { x: 500, y: 430, label: 'DynamoDB', kind: 'db', w: 340, body: '' });
  Net.link('a', 'cs', { cls: 'on' }); Net.link('cs', 'rp', { cls: 'on' }); Net.link('cs', 'db');
  if (o.tablet) Net.link('cs', 'rt', { dashed: true });
  paintDb();
}
const aman = (ticks, blue) => Net.set('a', { body: bubble('hi', ticks, blue) });
const map = (lines) => Net.set('cs', { body: tw(lines) });

// ================= 7: the happy path =================
function setup7() {
  scene({});
  aman('', false);
  map([['aman-phone → conn 1', 'dim'], ['riya-phone → conn 2', 'dim']]);
  panel([['Trigger', 'Nothing watches the database. Delivery happens <b>inside the chat server\'s handling of Aman\'s message</b>: save, then push'], ['Order', '0. Who gets it (ChatParticipant, then Client). 1. Save Message + Inbox (never lost) → ✓ to Aman. 2. Look up Riya in the map. 3. Push. 4. Riya\'s ack → delete her inbox row. 5. Tell Aman → ✓✓'], ['The database', 'A safety copy: if the push fails, the Inbox row is still there to retry from']]);
}
async function run7(ctx) {
  say('Aman sends "hi" to Riya.');
  aman('', false);
  await send('a', 'cs', 'sendMessage "hi"', '', 650);
  Net.check(ctx);
  await send('cs', 'db', 'who is in chat7? their devices?', '', 650);
  Net.check(ctx);
  await send('db', 'cs', 'riya → riya-phone', 'ok', 600);
  Net.check(ctx);
  say('First, who gets it? ChatParticipant: <b>Riya</b>. Client table: her device is <b>riya-phone</b>.');
  await Net.beat(ctx, 1800);
  say('Step 1: <b>save first</b>, so nothing can be lost.');
  await send('cs', 'db', 'save', '', 600);
  Net.check(ctx);
  MSGS = [['msg1 · chat7 · aman · "hi"', 'new']]; INB = [['riya-phone · msg1 · +30d', 'new']]; paintDb();
  await send('cs', 'a', '✓ saved', 'ok', 550);
  Net.check(ctx);
  aman('✓', false);
  say('Saved, so the server tells Aman: <b>✓</b> "I have it".');
  await Net.beat(ctx, 1800);
  map([['aman-phone → conn 1', 'dim'], ['riya-phone → conn 2', 'h']]);
  say('Step 2: look up Riya in the <b>map</b>: riya-phone is on conn 2.');
  await Net.beat(ctx, 2000);
  await send('cs', 'rp', 'newMessage "hi"', 'ok', 650);
  Net.check(ctx);
  Net.set('rp', { body: bubble('hi', '', false, true) });
  say('Step 3: <b>push</b> it down Riya\'s connection.');
  await Net.beat(ctx, 1600);
  await send('rp', 'cs', 'ack', 'ok', 550);
  Net.check(ctx);
  await send('cs', 'db', 'delete inbox row', '', 550);
  Net.check(ctx);
  INB = [['riya-phone · msg1 · +30d', 'gone']]; paintDb();
  say('Step 4: Riya\'s phone <b>acks</b> → her inbox row is deleted. The message itself stays.');
  await Net.beat(ctx, 1800);
  INB = []; paintDb();
  await send('cs', 'a', '✓✓ delivered', 'ok', 600);
  Net.check(ctx);
  aman('✓✓', false);
  say('Step 5: the server passes the ack on to Aman: <b>✓✓</b> delivered.');
  await Net.beat(ctx, 2200);
  say('What triggered the delivery? <b>Aman\'s message arriving</b>. The server saves it, then pushes it, in one go.', 'win');
}

// ================= 8: offline device + multi-device =================
function setup8() {
  scene({ tablet: true });
  aman('', false);
  map([['aman-phone → conn 1', 'dim'], ['riya-phone → conn 2', 'dim'], ['(riya-tablet: not connected)', 'dim']]);
  panel([['Per device', 'One Inbox row <b>per device</b>, so each device is tracked on its own'], ['Online device', 'Gets it now, acks, its row is deleted'], ['Offline device', 'Its row just waits'], ['Second trigger', 'A device <b>connecting</b>: the server reads that device\'s inbox and sends everything waiting'], ['Never comes back', 'A <b>TTL</b> deletes inbox rows after 30 days']]);
}
async function run8(ctx) {
  say('Riya\'s <b>phone is online</b>, her <b>tablet is off</b>. Aman sends "hi".');
  await send('a', 'cs', 'sendMessage "hi"', '', 600);
  Net.check(ctx);
  await send('cs', 'db', 'who is in chat7? their devices?', '', 600);
  Net.check(ctx);
  await send('db', 'cs', 'riya → phone, tablet', 'ok', 550);
  Net.check(ctx);
  say('Riya has <b>two</b> devices in the Client table: phone and tablet. Online or not doesn\'t matter for saving.');
  await Net.beat(ctx, 1800);
  await send('cs', 'db', 'save', '', 550);
  Net.check(ctx);
  MSGS = [['msg1 · chat7 · aman · "hi"', 'new']];
  INB = [['riya-phone · msg1 · +30d', 'new'], ['riya-tablet · msg1 · +30d', 'new']]; paintDb();
  await send('cs', 'a', '✓ saved', 'ok', 500);
  Net.check(ctx);
  aman('✓', false);
  say('One message, and <b>one inbox row per device</b>: phone and tablet. Aman gets <b>✓</b>.');
  await Net.beat(ctx, 2200);
  await send('cs', 'rp', 'newMessage', 'ok', 600);
  Net.check(ctx);
  Net.set('rp', { body: bubble('hi', '', false, true) });
  await send('rp', 'cs', 'ack', 'ok', 500);
  Net.check(ctx);
  INB = [['riya-phone · msg1 · +30d', 'gone'], ['riya-tablet · msg1 · +30d', 'amb']]; paintDb();
  await wait(ctx, 900);
  INB = [['riya-tablet · msg1 · +30d', 'amb']]; paintDb();
  await send('cs', 'a', '✓✓ delivered', 'ok', 550);
  Net.check(ctx);
  aman('✓✓', false);
  say('Phone: delivered, acked, row deleted, Aman sees <b>✓✓</b>. Tablet: not connected, so its row <b>waits</b>.');
  await Net.beat(ctx, 2600);
  say('An hour later, Riya switches the tablet on.');
  Net.set('rt', { state: '', badge: '', body: tw([['connecting…', 'h']]) });
  await send('rt', 'cs', 'connect', '', 650);
  Net.check(ctx);
  Net.linkSet('cs', 'rt', { dashed: false, cls: 'on' });
  map([['aman-phone → conn 1', 'dim'], ['riya-phone → conn 2', 'dim'], ['riya-tablet → conn 3', 'h']]);
  say('<b>The connection itself is the trigger</b>: "riya-tablet is here, what is waiting for it?"');
  await send('cs', 'db', 'inbox for riya-tablet?', '', 600);
  Net.check(ctx);
  await send('db', 'cs', 'msg1', 'ok', 550);
  Net.check(ctx);
  await send('cs', 'rt', 'newMessage', 'ok', 600);
  Net.check(ctx);
  Net.set('rt', { body: bubble('hi', '', false, true) });
  await send('rt', 'cs', 'ack', 'ok', 500);
  Net.check(ctx);
  INB = [['riya-tablet · msg1 · +30d', 'gone']]; paintDb();
  await wait(ctx, 900);
  INB = []; paintDb();
  say('Delivered to the tablet too, and its row is gone. If it had never come back, the <b>30-day TTL</b> would clear it.', 'win');
}

// ================= 9: ticks =================
function setup9() {
  scene({});
  aman('', false);
  map([['aman-phone → conn 1', 'dim'], ['riya-phone → conn 2', 'dim']]);
  panel([['✓ grey', '<b>Server</b> → Aman, right after saving: "I have it"'], ['✓✓ grey', '<b>Riya\'s device</b> acks → server forwards "delivered" → Aman'], ['✓✓ blue', '<b>Riya\'s app</b>, when she opens the chat, sends "read" → server → Aman'], ['Aman offline?', 'The receipt waits in <b>Aman\'s</b> inbox like any message'], ['Groups', '✓✓ only when <b>every</b> member\'s device has it; blue only when every member read it']]);
}
async function run9(ctx) {
  say('Ticks are just small <b>receipt messages</b> going back to the sender.');
  await send('a', 'cs', 'sendMessage "hi"', '', 600);
  Net.check(ctx);
  await send('cs', 'db', 'recipients + save', '', 600);
  Net.check(ctx);
  MSGS = [['msg1 · chat7 · aman · "hi"', 'new']]; INB = [['riya-phone · msg1 · +30d', 'new']]; paintDb();
  await send('cs', 'a', '✓ saved', 'ok', 550);
  Net.check(ctx);
  aman('✓', false);
  say('<b>✓</b> One grey tick: the <b>server</b> has saved it.');
  await Net.beat(ctx, 2200);
  await send('cs', 'rp', 'newMessage', 'ok', 600);
  Net.check(ctx);
  Net.set('rp', { body: bubble('hi', '', false, true) + tw([['(chat not opened yet)', 'dim']]) });
  await send('rp', 'cs', 'ack', 'ok', 500);
  Net.check(ctx);
  INB = []; paintDb();
  await send('cs', 'a', '✓✓ delivered', 'ok', 550);
  Net.check(ctx);
  aman('✓✓', false);
  say('<b>✓✓</b> Two grey ticks: Riya\'s <b>phone</b> acked it.');
  await Net.beat(ctx, 2400);
  say('Riya opens the chat.');
  Net.set('rp', { body: bubble('hi', '', false, true) + tw([['chat opened 👀', 'ok']]) });
  await send('rp', 'cs', 'read', 'ok', 550);
  Net.check(ctx);
  await send('cs', 'a', 'read', 'ok', 550);
  Net.check(ctx);
  aman('✓✓', true);
  say('<b>Blue ✓✓</b>: Riya\'s app sent a "read" receipt. Same path as any message.', 'win');
}

// ================= 10: the high-level design =================
function setup10() {
  Net.node('a', { x: 105, y: 110, label: "Aman's phone", kind: 'client', w: 170, body: '' });
  Net.node('rp', { x: 105, y: 290, label: "Riya's phone", kind: 'client', w: 170, body: '' });
  Net.node('rt', { x: 105, y: 470, label: "Riya's tablet", kind: 'client', w: 170, body: '' });
  Net.node('lb', { x: 320, y: 290, label: 'L4 load balancer', sub: 'passes through', kind: 'proxy', w: 180, body: '' });
  Net.node('cs', { x: 560, y: 290, label: 'Chat server', kind: 'lb', w: 220, body: tw([['WebSockets', ''], ['map: clientId → connection', '']]) });
  Net.node('db', { x: 855, y: 290, label: 'DynamoDB', kind: 'db', w: 250, body: tw([['User · Client', ''], ['Chat · ChatParticipant (+GSI)', ''], ['Message (senderId)', ''], ['Inbox (TTL 30 days)', '']]) });
  ['a', 'rp', 'rt'].forEach(d => Net.link(d, 'lb', { cls: 'on' }));
  Net.link('lb', 'cs', { cls: 'on' }); Net.link('cs', 'db');
  panel([['L4 load balancer', 'Just passes long-lived WebSocket connections through (no need to read HTTP, as an L7 one would)'], ['Chat server', 'Holds the WebSockets and the map; saves, then pushes'], ['DynamoDB', 'Chats, participants (+GSI), messages, per-device inbox with a 30-day TTL'], ['Next class', 'Billions of users means <b>many</b> chat servers. Riya may sit on a different server than Aman: how does the message find her? (Redis Pub/Sub)']]);
}
async function run10(ctx) {
  say('The whole design so far, with <b>one</b> chat server.');
  await Net.beat(ctx, 1600);
  await send('a', 'lb', '"hi"', '', 500);
  Net.check(ctx);
  await send('lb', 'cs', '"hi"', '', 500);
  Net.check(ctx);
  await send('cs', 'db', 'save', '', 500);
  Net.check(ctx);
  await send('cs', 'lb', '"hi"', 'ok', 500);
  Net.check(ctx);
  await both([send('lb', 'rp', '"hi"', 'ok', 500), send('lb', 'rt', '"hi"', 'ok', 500)]);
  Net.check(ctx);
  say('Phone → load balancer → chat server → <b>save</b> → push to each of Riya\'s devices.');
  await Net.beat(ctx, 2600);
  Net.node('cs2', { x: 560, y: 495, label: 'Chat server 2, 3, …', sub: 'next class', kind: 'lb', w: 220, state: 'down', body: tw([['Riya might be here', 'dim']]) });
  Net.link('lb', 'cs2', { dashed: true });
  say('Next class: one server can\'t hold billions of connections. With <b>many</b> chat servers, how does Aman\'s message find Riya?', 'win');
}

startPage([
  { label: '6 One chat server', story: 'Three devices connect to the chat server.', setup: setup6, run: run6, q: 'How does the server know which connection belongs to Riya\'s tablet, and how many connections can it hold?', a: ['An in-memory map: clientId → WebSocket, one entry per device.', 'Memory decides: 16 GB ÷ ~30 KB ≈ 530,000 connections (WhatsApp: 1–2M on big servers).'] },
  { label: '7 Live room (no DB)', story: 'A live chat room during the IPL final.', setup: setup7live, run: run7live, q: 'In a live chat room, do we even need a database?', a: ['No: the server just relays each message to whoever is connected right now.', 'The cost: anyone not connected misses it, and late joiners see no history.', 'WhatsApp must reach offline devices, so it saves first.'] },
  { label: '8 Send a message', story: 'Aman sends "hi"; Riya is online.', setup: setup7, run: run7, q: 'The message is saved in the database. What picks it up and sends it to Riya?', a: ['Nothing watches the database.', 'The chat server, while handling Aman\'s message: save, look Riya up in the map, push.', 'Riya acks → her inbox row is deleted.'] },
  { label: '9 Offline device', story: 'Riya\'s phone is on, her tablet is off.', setup: setup8, run: run8, q: 'The phone gets the message now. How does the tablet get it later?', a: ['Each device has its own inbox row; the tablet\'s waits.', 'When the tablet connects, the server reads its inbox and sends what\'s waiting.', 'A 30-day TTL clears rows that are never delivered.'] },
  { label: '10 Ticks', story: 'Aman watches his ticks change.', setup: setup9, run: run9, q: 'Who sends each tick: ✓, ✓✓, blue ✓✓?', a: ['✓: the server, after saving.', '✓✓: Riya\'s device acks, and the server tells Aman.', 'Blue: Riya opens the chat, her app sends "read".'] },
  { label: '11 Big picture', story: 'Everything on one diagram.', setup: setup10, run: run10, q: 'What breaks when one chat server isn\'t enough?', a: ['Aman and Riya may be connected to different servers.', 'Aman\'s server has no connection to Riya. Finding her is next class (Redis Pub/Sub).'] }
]);
