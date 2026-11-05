Net.mount(590, 1.1);

const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + (rows.length ? rows.map(r => `<div class="${r[1] || ''}">${r[0]}</div>`).join('') : '<div class="dim">empty</div>') + '</div>';
const bubble = (text, ticks, blue, incoming) => `<div style="text-align:${incoming ? 'left' : 'right'}"><span class="bub ${incoming ? 'in' : ''}">${esc(text)}${ticks ? `<span class="tk ${blue ? 'blue' : ''}">${ticks}</span>` : ''}</span></div>`;
const tables = list => '<div style="display:flex;gap:6px;align-items:flex-start">' + list.map(t => `<div style="flex:${t[2] || 1}">${table(t[0], t[1])}</div>`).join('') + '</div>';
const SLOW = 2600;   // pause after each important moment
const step = (ctx, html, kind, ms) => { say(html, kind); return Net.beat(ctx, ms || SLOW); };
// send a packet and stop quietly if the topic was switched meanwhile
async function go(ctx, a, b, label, cls, dur) { await send(a, b, label, cls, dur || 800); Net.check(ctx); }

// a table that fills in row by row (for the "board" topics)
const sheet = (head, rows, n) => '<table class="sheet"><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr>' + rows.map((r, i) => `<tr class="${i < n ? '' : 'hide'}">` + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('') + '</table>';
async function fillBoard(ctx, head, rows, lines) {
  for (let i = 1; i <= rows.length; i++) {
    if (lines && lines[i - 1]) say(lines[i - 1]);
    Net.set('board', { body: sheet(head, rows, i) });
    await Net.beat(ctx, 1500);
  }
}

// ---------------------------------------------------------------
// The "many servers" world, shared by topics 6 to 9:
// Aman on chat server 1, Riya's phone on server 2, (her tablet on server 3)
// ---------------------------------------------------------------
let W;
function world(o) {
  o = o || {};
  W = {
    tablet: !!o.tablet,
    presence: o.presence || '',
    aOn: o.aOn !== false, aBub: '', aTick: '', aBlue: false,
    phone: { on: o.phoneOn !== false, got: false, note: '' },
    tab: { on: !!o.tablet, got: false, note: '' },
    s1: { map: [], subs: [], note: '' },
    s2: { map: [], subs: [], note: '' },
    s3: { map: [], subs: [], note: '' },
    hot: '', msg: [], inb: [], seen: o.seen ? [['riya · 10:42', '']] : []
  };
  if (o.connected !== false) {
    if (W.aOn) { W.s1.map = ['aman → aman-phone']; W.s1.subs = ['aman']; }
    if (W.phone.on) { W.s2.map = ['riya → riya-phone']; W.s2.subs = ['riya']; }
    if (W.tab.on) { W.s3.map = ['riya → riya-tablet']; W.s3.subs = ['riya']; }
  }
  Net.node('a', { x: 95, y: 120, label: "Aman's phone", kind: 'client', w: 170, body: '' });
  Net.node('s1', { x: 300, y: 135, label: 'Chat server 1', kind: 'proxy', w: 195, body: '' });
  Net.node('rd', { x: 470, y: 330, label: 'Redis Pub/Sub', sub: 'routes, stores nothing', kind: 'lb', w: 240, body: '' });
  Net.node('s2', { x: 700, y: 120, label: 'Chat server 2', kind: 'proxy', w: 195, body: '' });
  Net.node('rp', { x: 905, y: 120, label: "Riya's phone", kind: 'client', w: 170, body: '' });
  if (W.tablet) {
    Net.node('s3', { x: 715, y: 345, label: 'Chat server 3', kind: 'proxy', w: 170, body: '' });
    Net.node('rt', { x: 905, y: 345, label: "Riya's tablet", kind: 'client', w: 170, body: '' });
  }
  Net.node('db', { x: 450, y: 525, label: 'DynamoDB', kind: 'db', w: 640, body: '' });
  Net.link('a', 's1'); Net.link('s2', 'rp');
  Net.link('s1', 'rd'); Net.link('rd', 's2');
  Net.link('s1', 'db'); Net.link('s2', 'db');
  if (W.tablet) { Net.link('s3', 'rt'); Net.link('rd', 's3'); Net.link('s3', 'db'); }
  paintW();
}
function channels() {
  const ch = {};
  [['s1', 'server 1'], ['s2', 'server 2'], ['s3', 'server 3']].forEach(s => W[s[0]].subs.forEach(u => { (ch[u] = ch[u] || []).push(s[1]); }));
  return Object.keys(ch).map(u => [u + ' → ' + ch[u].join(', '), W.hot === u ? 'hot' : '']);
}
const devHTML = (d, name) => (d.got ? bubble(name || 'hi', '', false, true) : '') + (d.note ? tw([[d.note, d.note.indexOf('✗') >= 0 ? 'dim' : 'ok']]) : (d.got ? '' : tw([[d.on ? 'connected' : 'switched off', d.on ? 'ok' : 'dim']])));
const srvHTML = s => table('map', s.map.map(x => [x, ''])) + '<div style="height:4px"></div>' + table('subscribed to', s.subs.map(x => [x, 'h'])) + (s.note ? tw([[s.note, 'amb']]) : '');
function paintW() {
  const aHead = W.presence ? tw([['Riya · ' + W.presence, W.presence === 'online' ? 'ok' : (W.presence.indexOf('typing') >= 0 ? 'amb' : 'dim')]]) : tw([['Riya', 'dim']]);
  Net.set('a', { body: aHead + (W.aBub ? bubble(W.aBub, W.aTick, W.aBlue) : ''), state: W.aOn ? '' : 'down', badge: W.aOn ? '' : 'offline', badgeCls: 'bad' });
  Net.set('rp', { body: devHTML(W.phone), state: W.phone.on ? '' : 'down', badge: W.phone.on ? '' : 'offline', badgeCls: 'bad' });
  if (W.tablet) Net.set('rt', { body: devHTML(W.tab), state: W.tab.on ? '' : 'down', badge: W.tab.on ? '' : 'offline', badgeCls: 'bad' });
  ['s1', 's2', 's3'].forEach(s => Net.set(s, { body: srvHTML(W[s]) }));
  Net.set('rd', { body: table('channel → subscribed servers', channels()) });
  Net.set('db', { body: tables([['Message', W.msg, 1.5], ['Inbox', W.inb, 1.3], ['LastSeen', W.seen, 0.9]]) });
  Net.linkSet('a', 's1', { cls: W.aOn ? 'on' : '', dashed: !W.aOn });
  Net.linkSet('s2', 'rp', { cls: W.phone.on ? 'on' : '', dashed: !W.phone.on });
  if (W.tablet) Net.linkSet('s3', 'rt', { cls: W.tab.on ? 'on' : '', dashed: !W.tab.on });
}
const hiRow = () => [['msg1 · aman → chat7 · "hi"', 'new']];

// ================= 1: requirements, entities, APIs =================
const REQ_HEAD = ['', 'what', 'one line'];
const REQ = [
  ['Functional', '1:1 + groups, offline (30 days), ticks, media, many devices', 'what the user can do'],
  ['Non-functional', '< 500 ms, never lose a message, billions of users', 'how well it must work'],
  ['Entities', 'User, Client (= device), Chat, ChatParticipant, Message, Inbox', 'the nouns'],
  ['Client → server', 'createChat, sendMessage, modifyChatParticipants, getUploadUrl', 'over the WebSocket'],
  ['Server → client', 'newMessage, chatUpdate (+ the client acks each one)', 'pushed on the same socket']
];
function setup1() {
  Net.node('board', { x: 500, y: 290, label: 'Requirements → entities → APIs', kind: 'proxy', w: 920, body: sheet(REQ_HEAD, REQ, 0) });
  panel([['Order', 'Requirements → entities → APIs → high-level design → deep dives'], ['Client', 'A <b>device</b>, not a person. One user = phone + laptop + tablet'], ['Remember', 'Every later decision must serve: <b>fast, never lose a message, huge scale</b>']]);
}
async function run1(ctx) {
  await fillBoard(ctx, REQ_HEAD, REQ, ['First <b>what</b> it must do…', '…then <b>how well</b>.', 'The <b>nouns</b> we store.', 'What the phone asks the server…', '…and what the server pushes back.']);
  say('That is the whole setup. Now each piece as a flow.', 'win');
}

// ================= 2: which connection =================
function setup2() {
  Net.node('q1', { x: 130, y: 110, label: 'Needs updates instantly?', kind: 'lb', w: 200 });
  Net.node('poll', { x: 130, y: 300, label: 'Polling', sub: 'dashboards', kind: 'proxy', w: 170 });
  Net.node('q2', { x: 400, y: 110, label: 'Both ways, often?', kind: 'lb', w: 190 });
  Net.node('sse', { x: 400, y: 300, label: 'SSE', sub: 'live scores, AI typing', kind: 'proxy', w: 190 });
  Net.node('q3', { x: 660, y: 110, label: 'Audio / video, phone to phone?', kind: 'lb', w: 210 });
  Net.node('rtc', { x: 660, y: 300, label: 'WebRTC', sub: 'calls', kind: 'proxy', w: 170 });
  Net.node('ws', { x: 895, y: 110, label: 'WebSocket', sub: 'chat', kind: 'proxy', w: 170 });
  Net.node('cap', { x: 500, y: 475, label: 'How many per server?', kind: 'db', w: 620, body: tw([['1 open connection ≈ 30 KB of RAM', 'dim'], ['16 GB ÷ 30 KB ≈ 530,000 connections per chat server', 'dim']]) });
  Net.link('q1', 'poll', { label: 'no' }); Net.link('q1', 'q2', { label: 'yes' });
  Net.link('q2', 'sse', { label: 'no' }); Net.link('q2', 'q3', { label: 'yes' });
  Net.link('q3', 'rtc', { label: 'yes' }); Net.link('q3', 'ws', { label: 'no' });
  panel([['Polling', 'Client keeps asking. Fine when a delay is okay'], ['SSE', 'Server → client only, on one long HTTP response'], ['WebSocket', 'One open two-way pipe: GET + Upgrade → <b>101</b>. Chat sends <b>and</b> receives all the time'], ['Remember', 'Chat = <b>WebSocket</b>. One server holds about <b>500K</b> connections, so billions of users need <b>many servers</b>']]);
}
async function run2(ctx) {
  await step(ctx, 'Pick the connection for chat by answering three questions.', '', 1800);
  Net.flash('q1', 'ok');
  await go(ctx, 'q1', 'q2', 'yes, < 500 ms', 'ok', 900);
  await step(ctx, 'A message must arrive <b>instantly</b>, so polling is out.', '', 1800);
  Net.flash('q2', 'ok');
  await go(ctx, 'q2', 'q3', 'yes, send + receive', 'ok', 900);
  await step(ctx, 'Chat <b>sends and receives</b> all the time, so one-way SSE is out.', '', 1800);
  Net.flash('q3', 'ok');
  await go(ctx, 'q3', 'ws', 'no, text', 'ok', 900);
  Net.flash('ws', 'ok');
  await step(ctx, 'Text goes through our servers, not phone to phone → <b>WebSocket</b>.', 'win');
  Net.set('cap', { body: tw([['1 open connection ≈ 30 KB of RAM', 'h'], ['16 GB ÷ 30 KB ≈ 530,000 connections per chat server', 'h']]) });
  Net.flash('cap', 'ok');
  say('Each open socket costs RAM: about <b>500K per server</b>. Billions of users → <b>thousands of chat servers</b>.', 'win');
}

// ================= 3: data model =================
const DM_HEAD = ['table', 'key', 'holds'];
const DM = [
  ['Chat', 'chatId', 'type (1:1 / group), name, createdBy'],
  ['ChatParticipant', 'chatId · userId', 'who is in a chat; GSI userId · chatId = "my chats"'],
  ['Client', 'userId · clientId', 'a user\'s devices'],
  ['Message', 'messageId', 'chatId, senderId, text or mediaKey, sentAt: stored once'],
  ['Inbox', 'clientId · messageId', '"this device still has to get this", TTL 30 days'],
  ['LastSeen', 'userId', 'time the last device went offline']
];
function setup3() {
  Net.node('board', { x: 500, y: 270, label: 'DynamoDB tables (NoSQL: tables, but no joins, read by key)', kind: 'db', w: 920, body: sheet(DM_HEAD, DM, 0) });
  panel([['Why DynamoDB', 'Billions of writes a day, read only by key, scales by splitting on the key'], ['Why GSI', 'Main key answers "who is in chat7?". The GSI answers "which chats is Riya in?"'], ['Remember', 'Message stored <b>once</b>; <b>Inbox = one row per device</b> still waiting, deleted on ack']]);
}
async function run3(ctx) {
  await fillBoard(ctx, DM_HEAD, DM, ['A <b>Chat</b> holds only its details…', '…<b>who</b> is in it is ChatParticipant, one row per person.', 'Each user has a few <b>devices</b>.', 'A message is stored <b>once</b>…', '…and the <b>Inbox</b> tracks each device that still needs it.', 'And when someone was last online.']);
  say('Six tables. The Inbox is the one that guarantees delivery.', 'win');
}

// ================= 4: send a message (one server, Riya online) =================
let X;
function oneServer(o) {
  X = { rOn: o.rOn, aBub: '', aTick: '', aBlue: false, rGot: false, rNote: '', map: ['aman → aman-phone'].concat(o.rOn ? ['riya → riya-phone'] : []), note: '', msg: [], inb: [] };
  Net.node('a', { x: 110, y: 140, label: "Aman's phone", kind: 'client', w: 190 });
  Net.node('s', { x: 480, y: 140, label: 'Chat server', sub: 'map: user → open socket', kind: 'proxy', w: 230 });
  Net.node('rp', { x: 870, y: 140, label: "Riya's phone", kind: 'client', w: 190 });
  Net.node('db', { x: 480, y: 440, label: 'DynamoDB', kind: 'db', w: 600 });
  Net.link('a', 's', { cls: 'on' }); Net.link('s', 'rp'); Net.link('s', 'db');
  paintX();
}
function paintX() {
  Net.set('a', { body: X.aBub ? bubble(X.aBub, X.aTick, X.aBlue) : tw([['chat with Riya', 'dim']]) });
  Net.set('s', { body: table('map', X.map.map(m => [m, m.indexOf('riya') === 0 && X.note ? 'hot' : ''])) + (X.note ? tw([[X.note, 'amb']]) : '') });
  Net.set('rp', { body: (X.rGot ? bubble('hi', '', false, true) : '') + tw([[X.rNote || (X.rOn ? 'connected' : 'switched off'), X.rOn ? 'ok' : 'dim']]), state: X.rOn ? '' : 'down', badge: X.rOn ? '' : 'offline', badgeCls: 'bad' });
  Net.set('db', { body: tables([['Message', X.msg, 1.4], ['Inbox', X.inb, 1]]) });
  Net.linkSet('s', 'rp', { cls: X.rOn ? 'on' : '', dashed: !X.rOn });
}
function setup4() {
  oneServer({ rOn: true });
  panel([['Order', 'look up devices → <b>save</b> (Message + Inbox) → <b>✓</b> → push → ack → delete Inbox row → <b>✓✓</b> → read → <b>blue</b>'], ['Save first', 'If the server dies right after ✓, the message is still in the database'], ['Remember', '✓ = server saved it. ✓✓ = a device acked it. Blue = opened']]);
}
async function run4(ctx) {
  X.aBub = 'hi'; paintX();
  await go(ctx, 'a', 's', 'sendMessage "hi"');
  await go(ctx, 's', 'db', 'chat7 members + devices?');
  await go(ctx, 'db', 's', 'riya → riya-phone', 'ok', 700);
  await step(ctx, '1. Find who gets it: Riya, one device.');
  await go(ctx, 's', 'db', 'save', '', 700);
  X.msg = hiRow(); X.inb = [['riya-phone · msg1', 'new']]; paintX();
  await step(ctx, '2. <b>Save first</b>: the Message, and an Inbox row for her device.');
  await go(ctx, 's', 'a', '✓', 'ok', 700);
  X.aTick = '✓'; paintX();
  await step(ctx, '3. <b>✓</b>: the server has it safely.', 'win');
  X.note = 'riya → riya-phone ✓'; paintX();
  await go(ctx, 's', 'rp', 'newMessage "hi"', 'ok');
  X.rGot = true; X.note = ''; paintX();
  await step(ctx, '4. Riya is in the server\'s map → push on her open socket.');
  await go(ctx, 'rp', 's', 'ack msg1', 'ok', 700);
  await go(ctx, 's', 'db', 'delete Inbox row', '', 700);
  X.inb = [['riya-phone · msg1', 'gone']]; paintX();
  await go(ctx, 's', 'a', '✓✓', 'ok', 700);
  X.aTick = '✓✓'; X.inb = []; paintX();
  await step(ctx, '5. Her phone acks → Inbox row deleted → <b>✓✓</b>.', 'win');
  X.rNote = 'chat opened 👀'; paintX();
  await go(ctx, 'rp', 's', 'read msg1', 'ok', 700);
  await go(ctx, 's', 'a', 'blue ✓✓', 'ok', 700);
  X.aBlue = true; paintX();
  say('6. She opens the chat → <b>read</b> → Aman sees <b>blue ✓✓</b>.', 'win');
}

// ================= 5: Riya offline =================
function setup5() {
  oneServer({ rOn: false });
  panel([['Offline', 'Not in the map → nothing to push. The Inbox row waits (up to 30 days, TTL)'], ['Reconnect', 'Connect → server reads <b>that device\'s</b> Inbox → pushes → ack → delete → ✓✓'], ['Remember', 'The <b>Inbox</b> is what makes "never lose a message" true']]);
}
async function run5(ctx) {
  X.aBub = 'hi'; paintX();
  await go(ctx, 'a', 's', 'sendMessage "hi"');
  await go(ctx, 's', 'db', 'save', '', 700);
  X.msg = hiRow(); X.inb = [['riya-phone · msg1', 'new']]; paintX();
  await go(ctx, 's', 'a', '✓', 'ok', 700);
  X.aTick = '✓'; paintX();
  await step(ctx, 'Saved → <b>✓</b>, same as before.');
  X.note = 'riya? not in map'; paintX();
  Net.flash('s', 'bad');
  await step(ctx, 'Riya is <b>not</b> in the map: her phone is off. Nothing to push. Aman stays on <b>✓</b>.', 'err');
  X.note = ''; paintX();
  await step(ctx, 'An hour later, Riya switches her phone on.', '', 1800);
  X.rOn = true; paintX();
  await go(ctx, 'rp', 's', 'connect', '', 700);
  X.map = ['aman → aman-phone', 'riya → riya-phone']; paintX();
  await go(ctx, 's', 'db', 'Inbox for riya-phone?', '', 800);
  await go(ctx, 'db', 's', 'msg1', 'ok', 700);
  await go(ctx, 's', 'rp', 'newMessage "hi"', 'ok');
  X.rGot = true; paintX();
  await step(ctx, 'On connect, the server reads <b>her device\'s Inbox</b> and delivers what waited.');
  await go(ctx, 'rp', 's', 'ack msg1', 'ok', 700);
  X.inb = [['riya-phone · msg1', 'gone']]; paintX();
  await go(ctx, 's', 'a', '✓✓', 'ok', 700);
  X.aTick = '✓✓'; X.inb = []; paintX();
  say('Ack → row deleted → Aman finally sees <b>✓✓</b>.', 'win');
}

// ================= 6: many servers = Redis Pub/Sub =================
function setup6() {
  world({ connected: false, phoneOn: true });
  panel([['Problem', 'Aman is on server 1, Riya on server 2. Server 1\'s map doesn\'t have her'], ['Channel', 'One channel per <b>userId</b>. It appears when a server runs <code>SUBSCRIBE riya</code> and disappears when nobody is subscribed'], ['Remember', 'Connect → <b>SUBSCRIBE me</b>. Send → <b>PUBLISH them</b>. Redis only routes, it stores nothing']]);
}
async function run6(ctx) {
  await step(ctx, 'Many chat servers. Aman lands on <b>server 1</b>, Riya on <b>server 2</b>.', '', 2000);
  await go(ctx, 'a', 's1', 'connect', '', 700);
  W.s1.map = ['aman → aman-phone']; paintW(); Net.linkSet('a', 's1', { cls: 'on' });
  await go(ctx, 's1', 'rd', 'SUBSCRIBE aman', '', 800);
  W.s1.subs = ['aman']; paintW();
  await go(ctx, 'rp', 's2', 'connect', '', 700);
  W.s2.map = ['riya → riya-phone']; paintW();
  await go(ctx, 's2', 'rd', 'SUBSCRIBE riya', '', 800);
  W.s2.subs = ['riya']; W.hot = 'riya'; paintW();
  await step(ctx, 'On connect, each server <b>subscribes</b> to that user\'s channel: "send me anything for Riya".');
  W.hot = ''; W.aBub = 'hi'; paintW();
  await go(ctx, 'a', 's1', 'sendMessage "hi"');
  await go(ctx, 's1', 'db', 'save', '', 700);
  W.msg = hiRow(); W.inb = [['riya-phone · msg1', 'new']]; paintW();
  await go(ctx, 's1', 'a', '✓', 'ok', 700);
  W.aTick = '✓'; paintW();
  await step(ctx, 'Same as before: <b>save first</b>, then <b>✓</b>.');
  await go(ctx, 's1', 'rd', 'PUBLISH riya "hi"', '', 900);
  W.hot = 'riya'; paintW();
  await go(ctx, 'rd', 's2', '"hi" for riya', 'ok', 900);
  await go(ctx, 's2', 'rp', 'newMessage "hi"', 'ok');
  W.phone.got = true; W.hot = ''; paintW();
  await step(ctx, 'Server 1 <b>publishes</b> to channel riya → Redis hands it to server 2 → pushed to her phone.');
  await go(ctx, 'rp', 's2', 'ack msg1', 'ok', 700);
  await go(ctx, 's2', 'db', 'delete row', '', 700);
  W.inb = []; paintW();
  await go(ctx, 's2', 'rd', 'PUBLISH aman "delivered"', '', 900);
  W.hot = 'aman'; paintW();
  await go(ctx, 'rd', 's1', 'delivered msg1', 'ok', 800);
  await go(ctx, 's1', 'a', '✓✓', 'ok', 700);
  W.aTick = '✓✓'; W.hot = ''; paintW();
  say('The receipt goes back the same way: <b>PUBLISH aman</b> → server 1 → <b>✓✓</b>.', 'win');
}

// ================= 7: presence + last seen =================
function setup7() {
  world({ phoneOn: true });
  panel([['Online?', '<code>PUBSUB NUMSUB riya</code>: 1 or more subscribers = online, 0 = offline'], ['Last seen', 'Her <b>last</b> device disconnects → server unsubscribes and writes <b>LastSeen</b>'], ['Remember', 'Presence comes from <b>who is subscribed</b>; only the "last seen" time is saved']]);
}
async function run7(ctx) {
  await step(ctx, 'Aman opens his chat with Riya. Is she online?', '', 2000);
  await go(ctx, 's1', 'rd', 'PUBSUB NUMSUB riya', '', 800);
  W.hot = 'riya'; paintW();
  await go(ctx, 'rd', 's1', '1 subscriber', 'ok', 700);
  W.presence = 'online'; paintW();
  await go(ctx, 's1', 'a', 'online', 'ok', 600);
  await step(ctx, 'One server listens on <b>riya</b> → she is <b>online</b>.', 'win');
  W.hot = '';
  await step(ctx, 'Riya closes the app.', '', 1600);
  W.phone.on = false; W.s2.map = []; paintW();
  await both([go(ctx, 's2', 'rd', 'UNSUBSCRIBE riya', 'bad', 800), go(ctx, 's2', 'db', 'LastSeen riya = 10:42', '', 800)]);
  W.s2.subs = []; W.seen = [['riya · 10:42', 'new']]; paintW();
  await step(ctx, 'Server 2 unsubscribes and saves <b>last seen 10:42</b>.');
  await go(ctx, 's1', 'rd', 'PUBSUB NUMSUB riya', '', 700);
  await go(ctx, 'rd', 's1', '0 subscribers', 'bad', 600);
  await go(ctx, 's1', 'db', 'LastSeen riya?', '', 700);
  await go(ctx, 'db', 's1', '10:42', 'ok', 600);
  W.presence = 'last seen 10:42'; paintW();
  await go(ctx, 's1', 'a', 'last seen 10:42', 'ok', 600);
  say('0 subscribers → offline → Aman sees <b>"last seen 10:42"</b>.', 'win');
}

// ================= 8: many devices =================
function setup8() {
  world({ tablet: true, presence: 'online' });
  panel([['Inbox', '<b>One row per device</b>: phone and tablet each get their own'], ['One publish', '<code>PUBLISH riya</code> once → Redis copies it to <b>every</b> subscribed server (2 and 3)'], ['Remember', 'Each device acks and deletes <b>its own</b> row. The first ack gives Aman ✓✓']]);
}
async function run8(ctx) {
  W.aBub = 'hi'; paintW();
  await go(ctx, 'a', 's1', 'sendMessage "hi"');
  await go(ctx, 's1', 'db', 'devices? save', '', 800);
  W.msg = hiRow(); W.inb = [['riya-phone · msg1', 'new'], ['riya-tablet · msg1', 'new']]; paintW();
  await go(ctx, 's1', 'a', '✓', 'ok', 700);
  W.aTick = '✓'; paintW();
  await step(ctx, 'Riya has a phone <b>and</b> a tablet → <b>two Inbox rows</b>. Then ✓.');
  await go(ctx, 's1', 'rd', 'PUBLISH riya "hi"', '', 900);
  W.hot = 'riya'; paintW();
  await both([go(ctx, 'rd', 's2', '"hi"', 'ok', 900), go(ctx, 'rd', 's3', '"hi"', 'ok', 900)]);
  await both([go(ctx, 's2', 'rp', 'newMessage', 'ok', 800), go(ctx, 's3', 'rt', 'newMessage', 'ok', 800)]);
  W.phone.got = true; W.tab.got = true; W.hot = ''; paintW();
  await step(ctx, '<b>One</b> publish → Redis copies it to <b>both</b> servers → both devices get it.');
  await go(ctx, 'rp', 's2', 'ack', 'ok', 700);
  await go(ctx, 's2', 'db', 'delete phone row', '', 700);
  W.inb = [['riya-phone · msg1', 'gone'], ['riya-tablet · msg1', '']]; paintW();
  await go(ctx, 's2', 'rd', 'PUBLISH aman "delivered"', '', 900);
  await go(ctx, 'rd', 's1', 'delivered', 'ok', 800);
  await go(ctx, 's1', 'a', '✓✓', 'ok', 700);
  W.aTick = '✓✓'; W.inb = [['riya-tablet · msg1', '']]; paintW();
  await step(ctx, 'Phone acks first → <b>its</b> row is deleted → Aman gets <b>✓✓</b>.', 'win');
  await go(ctx, 'rt', 's3', 'ack', 'ok', 700);
  await go(ctx, 's3', 'db', 'delete tablet row', '', 700);
  W.inb = []; paintW();
  say('Tablet acks → its row goes too. Both devices have "hi".', 'win');
}

// ================= 9: save it, or fire and forget =================
function setup9() {
  world({ aOn: false, phoneOn: true, presence: 'online' });
  W.msg = [['msg1 · aman → chat7 · "hi"', '']]; W.phone.got = true; W.aBub = 'hi'; W.aTick = '✓✓';
  paintW();
  panel([['Fire and forget', '<b>typing…</b>, online: if nobody listens, it is just dropped. Fine, it would be stale anyway'], ['Must not be lost', 'Messages <b>and receipts</b>: save first, then publish. Saved receipts reach the sender when he reconnects'], ['Remember', 'Redis Pub/Sub is only the <b>fast path</b> for people online; the database guarantees delivery']]);
}
async function run9(ctx) {
  await step(ctx, 'Aman is <b>offline</b>. Riya starts typing a reply.', '', 2000);
  W.phone.note = 'typing…'; paintW();
  await go(ctx, 'rp', 's2', 'typing…', '', 700);
  await go(ctx, 's2', 'rd', 'PUBLISH aman "typing"', '', 800);
  await lose('rd', 's1', 'nobody');
  Net.check(ctx);
  await step(ctx, 'Nobody listens on <b>aman</b> → "typing…" is dropped. <b>Nothing saved</b>, and that is fine.', 'err');
  W.phone.note = 'chat opened 👀'; paintW();
  await go(ctx, 'rp', 's2', 'read msg1', 'ok', 700);
  await go(ctx, 's2', 'db', 'save receipt', '', 800);
  W.inb = [['aman-phone · read msg1', 'new']]; paintW();
  await go(ctx, 's2', 'rd', 'PUBLISH aman "read"', '', 800);
  await lose('rd', 's1', 'nobody');
  Net.check(ctx);
  await step(ctx, 'She <b>reads</b> it. A receipt must not be lost → <b>saved first</b> in Aman\'s Inbox, then published (dropped).');
  await step(ctx, 'Later, Aman comes online.', '', 1600);
  W.aOn = true; paintW();
  await go(ctx, 'a', 's1', 'connect', '', 700);
  W.s1.map = ['aman → aman-phone']; paintW();
  await go(ctx, 's1', 'rd', 'SUBSCRIBE aman', '', 700);
  W.s1.subs = ['aman']; paintW();
  await go(ctx, 's1', 'db', 'Inbox for aman-phone?', '', 800);
  await go(ctx, 'db', 's1', 'read msg1', 'ok', 700);
  await go(ctx, 's1', 'a', 'blue ✓✓', 'ok', 700);
  W.aBlue = true; W.inb = []; paintW();
  say('His server reads his Inbox → the saved receipt arrives → <b>blue ✓✓</b>. The typing signal is long gone, as it should be.', 'win');
}

// ================= 10: load balancer + reconnect =================
let L;
function paintL() {
  Net.set('lb', { body: tw([['least connections', 'dim']]) });
  Net.set('s2', { body: tw([[L.c2.toLocaleString('en-IN') + ' connections', 'h']]) + (L.on === 's2' ? table('subscribed to', [['riya', 'h']]) : '') });
  Net.set('s3', { body: tw([[L.c3.toLocaleString('en-IN') + ' connections', 'h']]) + (L.on === 's3' ? table('subscribed to', [['riya', 'h']]) : '') });
  Net.set('rp', { body: tw([[L.on ? 'connected to ' + (L.on === 's2' ? 'server 2' : 'server 3') : 'not connected', L.on ? 'ok' : 'dim']]), state: L.drop ? 'down' : '' });
  Net.set('db', { body: table('Inbox', L.inb) });
  Net.linkSet('lb', 's2', { cls: L.on === 's2' ? 'on' : '' });
  Net.linkSet('lb', 's3', { cls: L.on === 's3' ? 'on' : '' });
  Net.linkSet('rp', 'lb', { cls: L.on ? 'on' : '', dashed: !L.on });
}
function setup10() {
  L = { c2: 410000, c3: 450000, on: '', drop: false, inb: [] };
  Net.node('rp', { x: 100, y: 230, label: "Riya's phone", kind: 'client', w: 180 });
  Net.node('lb', { x: 330, y: 230, label: 'L4 load balancer', kind: 'lb', w: 190 });
  Net.node('s2', { x: 580, y: 110, label: 'Chat server 2', kind: 'proxy', w: 200 });
  Net.node('s3', { x: 580, y: 360, label: 'Chat server 3', kind: 'proxy', w: 200 });
  Net.node('rd', { x: 860, y: 110, label: 'Redis Pub/Sub', kind: 'lb', w: 190, body: tw([['channel riya', 'dim']]) });
  Net.node('db', { x: 860, y: 360, label: 'DynamoDB', kind: 'db', w: 220 });
  Net.link('rp', 'lb'); Net.link('lb', 's2'); Net.link('lb', 's3');
  Net.link('s2', 'rd'); Net.link('s3', 'rd'); Net.link('s2', 'db'); Net.link('s3', 'db');
  paintL();
  panel([['L4', 'Passes the TCP connection through without reading HTTP, so the WebSocket just works'], ['Only at connect', 'The LB picks a server <b>once</b> (least connections). After that the socket stays pinned there'], ['Remember', 'Which server you land on <b>doesn\'t matter</b>: that server subscribes to your channel, and the Inbox covers any gap']]);
}
async function run10(ctx) {
  await go(ctx, 'rp', 'lb', 'connect', '', 700);
  Net.flash('s2', 'ok');
  await step(ctx, 'The L4 load balancer picks the server with the <b>fewest connections</b>: server 2.', '', 2000);
  await go(ctx, 'lb', 's2', 'connect', '', 700);
  L.on = 's2'; L.c2++; paintL();
  await go(ctx, 's2', 'rd', 'SUBSCRIBE riya', '', 800);
  await step(ctx, 'Server 2 subscribes to <b>riya</b>. The socket now stays on server 2.');
  L.drop = true; L.on = ''; L.c2--; paintL();
  Net.flash('rp', 'bad');
  await step(ctx, 'Her Wi-Fi drops. Server 2 stops getting <b>heartbeats</b> (ping/pong) → closes the socket.', 'err');
  await go(ctx, 's2', 'rd', 'UNSUBSCRIBE riya', 'bad', 800);
  L.inb = [['riya-phone · msg5', 'new']]; paintL();
  await step(ctx, 'Meanwhile a message arrives for her: it\'s <b>saved in her Inbox</b>.', '', 2000);
  L.drop = false; L.c2 += 60000; paintL();
  await go(ctx, 'rp', 'lb', 'reconnect', '', 700);
  Net.flash('s3', 'ok');
  await step(ctx, 'She reconnects. Server 2 is busier now, so this time she lands on <b>server 3</b>. That\'s fine.', '', 2000);
  await go(ctx, 'lb', 's3', 'reconnect', '', 700);
  L.on = 's3'; L.c3++; paintL();
  await go(ctx, 's3', 'rd', 'SUBSCRIBE riya', '', 800);
  await go(ctx, 's3', 'db', 'Inbox for riya-phone?', '', 800);
  await go(ctx, 'db', 's3', 'msg5', 'ok', 700);
  L.inb = [['riya-phone · msg5', 'gone']]; paintL();
  await go(ctx, 's3', 'lb', 'msg5', 'ok', 600);
  await go(ctx, 'lb', 'rp', 'msg5', 'ok', 600);
  L.inb = []; paintL();
  say('Server 3 subscribes to riya and delivers what she missed from the <b>Inbox</b>. Nothing lost.', 'win');
}

// ================= 11: media (pre-signed URL) =================
let M;
function paintM() {
  Net.set('a', { body: M.aBub ? bubble(M.aBub, M.aTick) : tw([['photo.jpg · 2 MB', 'dim']]) });
  Net.set('s', { body: tw([['never touches the photo', 'amb']]) });
  Net.set('st', { body: table('files', M.files) });
  Net.set('rp', { body: M.rState ? tw([[M.rState, M.rState.indexOf('photo') >= 0 ? 'ok' : 'dim']]) : tw([['waiting', 'dim']]) });
}
function setup11() {
  M = { aBub: '', aTick: '', files: [], rState: '' };
  Net.node('a', { x: 110, y: 150, label: "Aman's phone", kind: 'client', w: 190 });
  Net.node('s', { x: 500, y: 150, label: 'Chat server', kind: 'proxy', w: 210 });
  Net.node('rp', { x: 890, y: 150, label: "Riya's phone", kind: 'client', w: 190 });
  Net.node('st', { x: 500, y: 430, label: 'S3 + CDN', sub: 'blob storage', kind: 'db', w: 260 });
  Net.link('a', 's', { cls: 'on' }); Net.link('s', 'rp', { cls: 'on' });
  Net.link('a', 'st'); Net.link('rp', 'st');
  paintM();
  panel([['Upload', 'Ask the chat server for an <b>upload URL</b> → upload straight to S3 (in chunks)'], ['Message', 'Only the <b>key</b> (and a tiny thumbnail) goes through the chat flow'], ['Download', 'Receiver asks for a <b>download URL</b> → downloads straight from S3 / CDN'], ['Remember', 'Pre-signed URL = a short-lived link signed by the server. The photo bytes never pass through the chat server']]);
}
async function run11(ctx) {
  await go(ctx, 'a', 's', 'I want to upload a photo');
  await go(ctx, 's', 'a', 'upload URL + key abc', 'ok');
  await step(ctx, '1. Aman asks for an <b>upload URL</b>. The server signs one (valid a few minutes).');
  for (let i = 1; i <= 3; i++) await go(ctx, 'a', 'st', 'chunk ' + i + '/3', '', 650);
  M.files = [['abc · photo', 'new']]; paintM();
  await go(ctx, 'st', 'a', '200 OK', 'ok', 600);
  await step(ctx, '2. His phone uploads the photo <b>straight to S3</b>, in chunks (that\'s the progress bar).');
  M.aBub = '📷 photo'; paintM();
  await go(ctx, 'a', 's', 'sendMessage key abc');
  M.aTick = '✓'; paintM();
  await go(ctx, 's', 'rp', 'newMessage key abc', 'ok');
  M.rState = 'blurred preview · key abc'; paintM();
  await step(ctx, '3. A normal message carries only the <b>key</b> (+ a tiny preview). Save, ✓, publish: all as before.');
  await go(ctx, 'rp', 's', 'download URL for abc?');
  await go(ctx, 's', 'rp', 'download URL', 'ok');
  await go(ctx, 'rp', 'st', 'GET', '', 700);
  await go(ctx, 'st', 'rp', 'photo', 'ok', 900);
  M.rState = 'photo shown ✓'; paintM();
  say('4. Riya asks for a <b>download URL</b> and fetches the photo <b>straight from S3 / CDN</b>.', 'win');
}

// ================= 12: big groups =================
let G;
function paintG() {
  Net.set('s1', { body: tw([['PUBLISH calls: ' + G.pub.toLocaleString('en-IN'), G.pub > 6 ? 'bad' : 'h'], ['rows written: ' + G.rows.toLocaleString('en-IN'), G.rows > 6 ? 'bad' : 'h']]) });
  Net.set('rd', { body: table('channels', G.ch.map(c => [c, ''])) });
  Net.set('db', { body: table(G.mode === 'chat' ? 'Message by chatId' : 'Inbox (one row per member)', G.dbRows) });
}
function setup12() {
  G = { pub: 0, rows: 0, ch: ['riya', 'ravi', 'neha', 'arun', 'meera', 'kabir'], mode: 'user', dbRows: [] };
  Net.node('a', { x: 100, y: 120, label: "Aman's phone", kind: 'client', w: 170, body: tw([['group "trip" · 6 people', 'dim']]) });
  Net.node('s1', { x: 100, y: 360, label: 'Chat server 1', kind: 'proxy', w: 190 });
  Net.node('rd', { x: 410, y: 250, label: 'Redis Pub/Sub', kind: 'lb', w: 190 });
  Net.node('m2', { x: 640, y: 100, label: 'Server 2', sub: 'riya, ravi', kind: 'proxy', w: 170 });
  Net.node('m3', { x: 640, y: 250, label: 'Server 3', sub: 'neha, arun', kind: 'proxy', w: 170 });
  Net.node('m4', { x: 640, y: 400, label: 'Server 4', sub: 'meera, kabir', kind: 'proxy', w: 170 });
  Net.node('db', { x: 868, y: 250, label: 'DynamoDB', kind: 'db', w: 250 });
  Net.link('a', 's1', { cls: 'on' }); Net.link('s1', 'rd');
  Net.link('rd', 'm2'); Net.link('rd', 'm3'); Net.link('rd', 'm4');
  Net.link('s1', 'db');
  paintG();
  panel([['Per user (fan-out on write)', '1 message × N members = N publishes + N Inbox rows. Fine for ~100 people'], ['Per chat (fan-out on read)', 'Channel <b>chatId</b>: 1 publish. Message stored once under chatId; each member keeps a "read up to" bookmark'], ['Remember', 'Small chats: partition by <b>user</b>. Huge groups / channels (Discord): partition by <b>chat</b>']]);
}
async function run12(ctx) {
  await step(ctx, 'Aman sends "hi" to a group of <b>6</b>, using one channel <b>per user</b>.', '', 2000);
  await go(ctx, 'a', 's1', 'sendMessage', '', 700);
  const who = ['riya', 'ravi', 'neha', 'arun', 'meera', 'kabir'], at = ['m2', 'm2', 'm3', 'm3', 'm4', 'm4'];
  for (let i = 0; i < 6; i++) {
    G.pub++; G.rows++; G.dbRows = who.slice(0, i + 1).map(w => [w + ' · msg1', 'new']).slice(-4); paintG();
    await go(ctx, 's1', 'rd', 'PUBLISH ' + who[i], '', 380);
    await go(ctx, 'rd', at[i], who[i], 'ok', 380);
  }
  await step(ctx, '6 people → <b>6 publishes + 6 Inbox rows</b> for one message.');
  G.pub = 100000; G.rows = 100000; G.dbRows = [['… 100,000 rows', 'new']]; paintG();
  Net.flash('s1', 'bad');
  await step(ctx, 'Now a group of <b>100,000</b>: every message = <b>100,000</b> publishes and writes. Too much.', 'err');
  G = { pub: 0, rows: 0, ch: ['chat:trip'], mode: 'chat', dbRows: [] }; paintG();
  await both([go(ctx, 'm2', 'rd', 'SUBSCRIBE chat:trip', '', 700), go(ctx, 'm3', 'rd', 'SUBSCRIBE chat:trip', '', 700), go(ctx, 'm4', 'rd', 'SUBSCRIBE chat:trip', '', 700)]);
  await step(ctx, 'Fix: one channel <b>per chat</b>. Every server holding a member subscribes to <b>chat:trip</b>.');
  await go(ctx, 'a', 's1', 'sendMessage', '', 700);
  G.rows = 1; G.dbRows = [['chat:trip · msg1 (once)', 'new']]; paintG();
  await go(ctx, 's1', 'db', 'save once', '', 700);
  G.pub = 1; paintG();
  await go(ctx, 's1', 'rd', 'PUBLISH chat:trip', '', 800);
  await both([go(ctx, 'rd', 'm2', 'msg1', 'ok', 800), go(ctx, 'rd', 'm3', 'msg1', 'ok', 800), go(ctx, 'rd', 'm4', 'msg1', 'ok', 800)]);
  say('<b>1 publish, 1 row</b>, whatever the group size. Members read new messages by chatId from their bookmark.', 'win');
}

// ================= 13: summary =================
const SUM_HEAD = ['topic', 'the flow in one line'];
const SUM = [
  ['Connection', 'WebSocket, ~500K per server → many servers behind an L4 load balancer'],
  ['Send', 'save Message + Inbox row per device → ✓ → PUBLISH recipient → push'],
  ['Ticks', 'device ack → delete its Inbox row → ✓✓ ; opened → read → blue'],
  ['Offline', 'nobody subscribed → publish dropped → Inbox delivers on reconnect'],
  ['Presence', 'subscribed = online ; last device leaves → LastSeen'],
  ['Durable vs not', 'messages + receipts saved first ; typing / online fire and forget'],
  ['Media', 'upload URL → straight to S3 → message carries the key → download URL'],
  ['Big groups', 'per-user fan-out is N copies → channel and storage per chatId']
];
function setup13() {
  Net.node('board', { x: 500, y: 280, label: 'WhatsApp on one page', kind: 'proxy', w: 920, body: sheet(SUM_HEAD, SUM, 0) });
  $('#final').classList.add('hidden');
}
async function run13(ctx) {
  say('Everything on one table.');
  for (let i = 1; i <= SUM.length; i++) { await wait(ctx, 900); Net.set('board', { body: sheet(SUM_HEAD, SUM, i) }); }
  say('<b>Redis routes, the database remembers, S3 holds the files.</b>', 'win');
}

startPage([
  { label: '1 Requirements', story: 'What WhatsApp must do, and the nouns and APIs that come out of it.', setup: setup1, run: run1, q: 'What are the three non-functional goals everything else must serve?', a: ['Fast (under 500 ms), never lose a message, billions of users.'] },
  { label: '2 Connection', story: 'Which connection type fits chat, and how many fit on one server.', setup: setup2, run: run2, q: 'Why WebSocket and not SSE?', a: ['Chat sends and receives all the time; SSE is server → client only.', 'One server holds ~500K sockets, so we need many servers.'] },
  { label: '3 Data model', story: 'The DynamoDB tables and their keys.', setup: setup3, run: run3, q: 'Which table makes "never lose a message" true?', a: ['Inbox: one row per device that still has to receive a message, deleted on ack, 30-day TTL.'] },
  { label: '4 Send + ticks', story: 'Aman and Riya are both online, on the same chat server.', setup: setup4, run: run4, q: 'When exactly does Aman see ✓, ✓✓ and blue?', a: ['✓ after the save.', '✓✓ when Riya\'s device acks.', 'Blue when she opens the chat.'] },
  { label: '5 Offline', story: 'Riya\'s phone is off when Aman sends.', setup: setup5, run: run5, q: 'Riya is offline. Where does the message wait, and who delivers it?', a: ['In her device\'s Inbox row.', 'When she connects, the server reads that Inbox and pushes it.'] },
  { label: '6 Redis Pub/Sub', story: 'Aman is on server 1, Riya on server 2.', setup: setup6, run: run6, q: 'Server 1 doesn\'t have Riya. How does "hi" reach server 2?', a: ['Server 2 subscribed to channel riya when she connected.', 'Server 1 publishes to riya; Redis hands it to server 2.'] },
  { label: '7 Presence', story: 'Is Riya online? And when was she last seen?', setup: setup7, run: run7, q: 'How does server 1 know if Riya is online?', a: ['PUBSUB NUMSUB riya: any subscriber = online.', 'When her last device leaves, LastSeen is written.'] },
  { label: '8 Many devices', story: 'Riya\'s phone is on server 2, her tablet on server 3.', setup: setup8, run: run8, q: 'How many publishes, and how many Inbox rows?', a: ['One publish to riya; Redis copies it to both servers.', 'One Inbox row per device.'] },
  { label: '9 Save or forget', story: 'Aman is offline while Riya types and reads.', setup: setup9, run: run9, q: 'Which signals must be saved, and which can be dropped?', a: ['Messages and receipts: saved first.', 'Typing and online: fire and forget.'] },
  { label: '10 Load balancer', story: 'Riya connects, drops, and reconnects.', setup: setup10, run: run10, q: 'Her reconnect lands on a different server. Does it matter?', a: ['No. The new server subscribes to riya and reads her Inbox.', 'The L4 LB only picks a server when the connection opens.'] },
  { label: '11 Media', story: 'Aman sends Riya a photo.', setup: setup11, run: run11, q: 'Does the photo go through the chat server?', a: ['No. Upload and download go straight to S3 / CDN with pre-signed URLs.', 'The message only carries the key.'] },
  { label: '12 Big groups', story: 'A group of 6, then a group of 100,000.', setup: setup12, run: run12, q: 'Why does per-user delivery break for a huge group?', a: ['N members = N publishes + N rows per message.', 'Per chat: one channel and one stored copy per chat.'] },
  { label: '13 Summary', story: 'All of it on one table.', setup: setup13, run: run13, q: 'In one line each: what do Redis, the database and S3 do?', a: ['Redis routes to the right servers.', 'The database remembers (Message, Inbox, LastSeen).', 'S3 holds the media.'] }
]);
