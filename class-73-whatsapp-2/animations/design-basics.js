Net.mount(580, 1.1);

const list = (items, n, cls) => '<div class="tw">' + items.map((t, i) => `<div class="${i < n ? (cls || '') : 'dim'}">${i < n ? esc(t) : '·'}</div>`).join('') + '</div>';
const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + rows.map(r => `<div class="${r[1] || ''}">${r[0]}</div>`).join('') + '</div>';

// ================= 1: requirements =================
const FUN = ['1:1 and group chats (up to 100 people)', 'Send and receive messages', 'Offline delivery (kept up to 30 days)', 'Many devices per user (phone, laptop…)', 'Ticks: sent ✓, delivered ✓✓, read ✓✓'];
const NFN = ['Fast: delivered in under 500 ms', 'Guaranteed: no message ever lost', 'Huge scale: billions of users', 'Store messages only as long as needed', 'Keeps working when a server dies'];
const OUT = ['Photos, videos, files', 'Voice and video calls', 'Sign-up and profiles', 'Spam and security'];
function setup1() {
  Net.node('f', { x: 205, y: 290, label: 'Functional', sub: 'what it does', kind: 'lb', w: 330, body: list(FUN, 0) });
  Net.node('n', { x: 565, y: 290, label: 'Non-functional', sub: 'how well it does it', kind: 'db', w: 330, body: list(NFN, 0) });
  Net.node('o', { x: 870, y: 290, label: 'Out of scope today', kind: 'proxy', w: 220, body: list(OUT, 0) });
  panel([['Functional', 'Features a user can see: chats, groups, offline, devices, ticks'], ['Non-functional', 'The quality bar: speed (< 500 ms), never lose a message, billions of users'], ['Scope', 'We pick a few features and do them well; media and calls are left out']]);
}
async function run1(ctx) {
  say('First, <b>what</b> must WhatsApp do?');
  for (let i = 1; i <= FUN.length; i++) { await wait(ctx, 800); Net.set('f', { body: list(FUN, i, 'ok') }); }
  await Net.beat(ctx, 1600);
  say('Then, <b>how well</b> must it do it?');
  for (let i = 1; i <= NFN.length; i++) { await wait(ctx, 800); Net.set('n', { body: list(NFN, i, 'h') }); }
  await Net.beat(ctx, 1600);
  say('And what we <b>leave out</b> today.');
  for (let i = 1; i <= OUT.length; i++) { await wait(ctx, 600); Net.set('o', { body: list(OUT, i, 'dim') }); }
  say('Everything later must serve these: <b>fast, never lose a message, huge scale</b>.', 'win');
}

// ================= 2: core entities =================
function setup2() {
  Net.node('u', { x: 150, y: 130, label: 'User', kind: 'client', w: 230, body: '' });
  Net.node('cl', { x: 150, y: 400, label: 'Client = a device', kind: 'client', w: 230, body: '' });
  Net.node('ch', { x: 500, y: 130, label: 'Chat', kind: 'lb', w: 220, body: '' });
  Net.node('cp', { x: 500, y: 400, label: 'ChatParticipant', kind: 'lb', w: 220, body: '' });
  Net.node('m', { x: 845, y: 130, label: 'Message', kind: 'db', w: 260, body: '' });
  Net.node('ib', { x: 845, y: 400, label: 'Inbox', kind: 'db', w: 260, body: '' });
  panel([['User', '<code>userId</code>, name, phone'], ['Client', 'A <b>device</b>: key <code>userId · clientId</code>, so all of a user\'s devices sit together. One user, a few clients (about 3–4)'], ['Chat', 'One row per chat: <code>chatId</code>, type (1:1 or group), name, createdBy, createdAt. No members here'], ['ChatParticipant', 'One row per <b>person in a chat</b>: key <code>chatId · userId</code> (+ joinedAt). Adding or removing someone = one row'], ['Message + Inbox', 'Message: <code>messageId</code>, chatId, <b>senderId</b>, text, sentAt, stored once. Inbox: key <code>clientId · messageId</code> + <code>expiresAt</code> (TTL): "this device still has to receive this message"']]);
}
async function run2(ctx) {
  say('A <b>User</b>: Aman.');
  Net.set('u', { body: tw([['userId · name', 'dim'], ['aman · Aman', 'h'], ['riya · Riya', 'h']]) }); Net.flash('u', 'ok');
  await Net.beat(ctx, 1600);
  Net.link('u', 'cl');
  Net.set('cl', { body: tw([['userId · clientId', 'dim'], ['aman · aman-phone', 'h'], ['aman · aman-laptop', 'h'], ['riya · riya-phone', 'h'], ['riya · riya-tablet', 'h']]) }); Net.flash('cl', 'ok');
  say('Aman uses WhatsApp on his phone and laptop, Riya on her phone and tablet. Each one is a <b>Client</b>, which really means a <b>device</b>.');
  await Net.beat(ctx, 2600);
  Net.set('ch', { body: tw([['chatId · type · createdBy', 'dim'], ['chat7 · 1:1 · aman', 'h']]) }); Net.flash('ch', 'ok');
  Net.link('ch', 'cp'); Net.link('u', 'cp');
  Net.set('cp', { body: tw([['chatId · userId', 'dim'], ['chat7 · aman', 'h'], ['chat7 · riya', 'h']]) });
  say('A <b>Chat</b> row holds only the chat\'s details. <b>Who</b> is in it lives in <b>ChatParticipant</b>: one row per person.');
  await Net.beat(ctx, 2400);
  Net.link('ch', 'm');
  Net.set('m', { body: tw([['messageId · chatId · senderId', 'dim'], ['msg1 · chat7 · aman', 'h'], ['text "hi" · sentAt 10:42', 'h']]) }); Net.flash('m', 'ok');
  say('Aman sends "hi": one <b>Message</b>, stored <b>once</b>.');
  await Net.beat(ctx, 2000);
  Net.link('m', 'ib'); Net.link('cl', 'ib');
  Net.set('ib', { body: tw([['clientId · messageId · expiresAt', 'dim'], ['riya-phone · msg1 · +30d', 'amb'], ['riya-tablet · msg1 · +30d', 'amb']]) }); Net.flash('ib', 'ok');
  say('And an <b>Inbox</b> row for <b>each of Riya\'s devices</b> that still has to receive it.', 'win');
}

// ================= 3: which connection =================
let K;
const cnt = k => kv('requests made', K[k].req, K[k].req > 1 ? 'bad' : 'good') + kv('bytes sent up', '~' + K[k].bytes + ' B', K[k].bytes > 200 ? 'bad' : 'good');
function setup3() {
  K = { a: { req: 0, bytes: 0 }, b: { req: 0, bytes: 0 } };
  Net.group({ x: 16, y: 14, w: 968, h: 268, label: 'SSE + POST: listen on a stream, send with POST requests' });
  Net.group({ x: 16, y: 298, w: 968, h: 268, label: 'WebSocket: one connection, both ways' });
  Net.node('ap', { x: 180, y: 155, label: "Aman's phone", kind: 'client', w: 230, body: cnt('a') });
  Net.node('as', { x: 820, y: 155, label: 'Server', kind: 'db', w: 200, body: '' });
  Net.node('bp', { x: 180, y: 440, label: "Aman's phone", kind: 'client', w: 230, body: cnt('b') });
  Net.node('bs', { x: 820, y: 440, label: 'Server', kind: 'db', w: 200, body: '' });
  Net.link('ap', 'as'); Net.link('bp', 'bs');
  panel([['HTTP alone', 'Out: the server can\'t push messages to you'], ['SSE + POST', 'Works! Listen on a stream; every send, ack and "typing…" is a <b>separate HTTP request</b> with full headers (~800 bytes for "hi")'], ['WebSocket', 'One open connection per <b>device</b>; everything travels as tiny frames, both ways'], ['Costs', 'Keeping millions of connections open (memory, sticky server, heartbeats) is the <b>same</b> for SSE and WebSocket. The difference is the cost of each send'], ['Pick', 'Chat = lots of traffic in <b>both</b> directions → <b>WebSocket</b>']]);
}
async function run3(ctx) {
  say('Both phones open their connection once.');
  K.a.req++; K.b.req++;
  await both([send('ap', 'as', 'GET /events', '', 600), send('bp', 'bs', 'Upgrade: websocket', '', 600)]);
  Net.check(ctx);
  Net.linkSet('ap', 'as', { cls: 'on' }); Net.linkSet('bp', 'bs', { cls: 'on' });
  Net.set('ap', { body: cnt('a') }); Net.set('bp', { body: cnt('b') });
  await Net.beat(ctx, 1600);
  say('Aman types (2 "typing…" signals), sends "hi", and acks a message he received.');
  for (const m of ['typing…', 'typing…', '"hi"', 'ack']) {
    K.a.req++; K.a.bytes += 800; K.b.bytes += 20;
    await both([send('ap', 'as', 'POST ' + m + ' (~800 B)', 'bad', 650), send('bp', 'bs', m + ' (~20 B)', 'ok', 650)]);
    Net.check(ctx);
    Net.set('ap', { body: cnt('a') }); Net.set('bp', { body: cnt('b') });
  }
  say(`SSE + POST: <b>${K.a.req} requests</b>, ~${K.a.bytes} bytes. WebSocket: still <b>1 connection</b>, ~${K.b.bytes} bytes.`);
  await Net.beat(ctx, 2800);
  say('Both work; WebSocket is far cheaper when <b>both sides talk all the time</b>. So: one WebSocket per device.', 'win');
}

// ================= 4: APIs over the WebSocket =================
let LOGA, LOGR;
function setup4() {
  LOGA = []; LOGR = [];
  Net.node('a', { x: 150, y: 290, label: "Aman's phone", kind: 'client', w: 250, body: tw([['connected', 'ok']]) });
  Net.node('s', { x: 500, y: 290, label: 'Chat server', kind: 'db', w: 220, body: '' });
  Net.node('r', { x: 850, y: 290, label: "Riya's phone", kind: 'client', w: 250, body: tw([['connected', 'ok']]) });
  Net.link('a', 's', { cls: 'on' }); Net.link('s', 'r', { cls: 'on' });
  panel([['Not REST', 'No URLs per action: small <b>commands</b> sent as messages on the open WebSocket'], ['Phone → server', '<code>createChat</code>, <code>sendMessage</code>, <code>modifyChatParticipants</code>'], ['Server → phone', '<code>newMessage</code>, <code>chatUpdate</code>'], ['ack', 'The receiving phone answers every push with an <b>ack</b>, so the server knows it arrived (and stops retrying). The server turns it into ✓✓ for the sender'], ['Example', '<code>{ "type": "sendMessage", "chatId": 7, "text": "hi" }</code>']]);
}
const logA = (t, c) => { LOGA.push([t, c]); LOGA = LOGA.slice(-4); Net.set('a', { body: tw(LOGA) }); };
const logR = (t, c) => { LOGR.push([t, c]); LOGR = LOGR.slice(-4); Net.set('r', { body: tw(LOGR) }); };
async function run4(ctx) {
  say('Every action is a small <b>command</b> on the open WebSocket.');
  logA('↑ createChat [aman, riya]', 'h');
  await send('a', 's', 'createChat', '', 650);
  Net.check(ctx);
  await both([send('s', 'a', 'chatUpdate', 'ok', 650), send('s', 'r', 'chatUpdate', 'ok', 650)]);
  Net.check(ctx);
  logA('↓ chatUpdate: chat7 created', 'ok');
  logR('↓ chatUpdate: new chat7', 'ok');
  say('The server tells <b>both</b> phones about the new chat.');
  await Net.beat(ctx, 1600);
  logA('↑ sendMessage chat7 "hi"', 'h');
  await send('a', 's', 'sendMessage', '', 650);
  Net.check(ctx);
  await send('s', 'a', '✓ saved', 'ok', 550);
  Net.check(ctx);
  logA('↓ ✓ saved', 'ok');
  await send('s', 'r', 'newMessage', 'ok', 650);
  Net.check(ctx);
  logR('↓ newMessage "hi"', 'ok');
  await send('r', 's', 'ack', 'ok', 550);
  Net.check(ctx);
  logR('↑ ack', 'amb');
  await send('s', 'a', '✓✓ delivered', 'ok', 550);
  Net.check(ctx);
  logA('↓ ✓✓ delivered', 'ok');
  say('Riya\'s phone <b>acks</b> the push; the server passes it on to Aman as <b>✓✓</b>.');
  await Net.beat(ctx, 2000);
  logA('↑ modifyChatParticipants +Sara', 'h');
  await send('a', 's', 'modifyChatParticipants', '', 650);
  Net.check(ctx);
  await both([send('s', 'a', 'chatUpdate', 'ok', 650), send('s', 'r', 'chatUpdate', 'ok', 650)]);
  Net.check(ctx);
  logA('↓ chatUpdate: Sara added', 'ok');
  logR('↓ chatUpdate: Sara added', 'ok');
  say('Up: <b>createChat, sendMessage, modifyChatParticipants</b>. Down: <b>newMessage, chatUpdate</b>. Plus <b>ack</b>.', 'win');
}

// ================= 5: data model in DynamoDB =================
let MAIN, GSI, MSG, INB;
const paint5 = () => {
  Net.set('cp', { body: table('chatId · userId', MAIN) });
  Net.set('gsi', { body: table('userId · chatId', GSI) });
  Net.set('msg', { body: table('messageId · chatId · senderId · text', MSG) });
  Net.set('inb', { body: table('clientId · messageId · expiresAt', INB) });
};
function setup5() {
  MAIN = [['chat7 · aman'], ['chat7 · riya'], ['chat9 · aman'], ['chat9 · sara']];   // chatId · userId
  GSI = [['aman · chat7'], ['aman · chat9'], ['riya · chat7'], ['sara · chat9']];
  MSG = []; INB = [];
  Net.node('cp', { x: 200, y: 140, label: 'ChatParticipant', sub: 'sorted by chatId', kind: 'lb', w: 260, body: '' });
  Net.node('gsi', { x: 200, y: 425, label: 'Its GSI (a re-sorted copy)', sub: 'sorted by userId', kind: 'lb', w: 260, body: '' });
  Net.node('sv', { x: 500, y: 290, label: 'Chat server', kind: 'client', w: 180, body: '' });
  Net.node('msg', { x: 800, y: 140, label: 'Message', kind: 'db', w: 330, body: '' });
  Net.node('inb', { x: 800, y: 425, label: 'Inbox', sub: 'one row per device', kind: 'db', w: 330, body: '' });
  ['cp', 'gsi', 'msg', 'inb'].forEach(n => Net.link('sv', n));
  paint5();
  panel([['GSI', 'Global Secondary Index: DynamoDB keeps a <b>copy</b> of the table sorted by another key, on its own machines, synced shortly after each write. Unlike a SQL secondary index (which points back to the primary key), there\'s no second lookup'], ['Two questions', '"Who is in chat7?" → main table (<code>chatId · userId</code>). "Which chats is Aman in?" → GSI (<code>userId · chatId</code>)'], ['One transaction', 'Message + its Inbox rows are written together: all or nothing. DynamoDB allows <b>max 100 items</b> per transaction, so big groups go in batches (PostgreSQL has no such count limit)'], ['Why DynamoDB', 'Only simple key lookups, ~100K writes/sec, built-in TTL for the 30-day expiry, and it shards itself. PostgreSQL would need sharding by hand; MongoDB would also work (you run the sharding)']]);
}
async function run5(ctx) {
  say('Aman opens the app: "which chats am I in?" The main table is sorted by <b>chat</b>, so that would mean scanning everything…');
  await Net.beat(ctx, 2200);
  await send('sv', 'gsi', 'aman?', '', 650);
  Net.check(ctx);
  GSI[0][1] = 'hot'; GSI[1][1] = 'hot'; paint5();
  await send('gsi', 'sv', 'chat7, chat9', 'ok', 650);
  Net.check(ctx);
  say('…so we ask the <b>GSI</b>: the same rows, kept sorted by <b>userId</b>. Aman\'s rows sit together.');
  await Net.beat(ctx, 2600);
  GSI.forEach(r => { r[1] = ''; }); paint5();
  say('Aman sends "hi" in chat7. Who must get it?');
  await send('sv', 'cp', 'chat7?', '', 650);
  Net.check(ctx);
  MAIN[0][1] = 'hot'; MAIN[1][1] = 'hot'; paint5();
  await send('cp', 'sv', 'aman, riya', 'ok', 650);
  Net.check(ctx);
  say('The main table is sorted by <b>chatId</b>: chat7\'s rows sit together. Besides Aman, that\'s <b>Riya</b>, and the Client table gives her devices: phone and tablet.');
  await Net.beat(ctx, 2600);
  MAIN.forEach(r => { r[1] = ''; }); paint5();
  say('The message and one inbox row per Riya device go in <b>one transaction</b>.');
  await both([send('sv', 'msg', 'msg1', '', 650), send('sv', 'inb', 'inbox rows', '', 650)]);
  Net.check(ctx);
  MSG = [['msg1 · chat7 · aman · "hi"', 'new']];
  INB = [['riya-phone · msg1 · +30d', 'new'], ['riya-tablet · msg1 · +30d', 'new']];
  paint5();
  say('3 items: 1 message + 2 inbox rows (Riya has 2 devices). Both written, or neither.');
  await Net.beat(ctx, 2400);
  say('A 100-person group: 1 message + 100+ inbox rows = <b>over DynamoDB\'s 100-item limit</b> → written in batches.', 'win');
}

startPage([
  { label: '1 Requirements', story: 'Designing WhatsApp from scratch.', setup: setup1, run: run1, q: 'Before drawing any boxes, what must the system do, and how well?', a: ['Functional: chats and groups (≤100), send/receive, offline delivery (30 days), many devices, ticks.', 'Non-functional: under 500 ms, never lose a message, billions of users.', 'Out of scope today: media, calls, profiles, spam.'] },
  { label: '2 Core entities', story: 'Aman (phone + laptop) chats with Riya (phone + tablet).', setup: setup2, run: run2, q: 'Aman has a phone and a laptop. Is that one "client" or two?', a: ['Two. In this design a client is a device.', 'One user → many clients; one message → one Inbox row per device.'] },
  { label: '3 Which connection', story: 'Aman types, sends "hi", and acks a message.', setup: setup3, run: run3, q: 'SSE + POST could also deliver chat messages. Why pick WebSocket?', a: ['SSE + POST works, but every send, ack and "typing…" is a full HTTP request.', 'WebSocket sends them as tiny frames on one open connection.', 'Keeping connections open costs the same either way; chat\'s two-way traffic makes WebSocket cheaper.'] },
  { label: '4 APIs', story: 'Aman creates a chat with Riya, says hi, and adds Sara.', setup: setup4, run: run4, q: 'With one open WebSocket, how does the phone say "create a chat" vs "send a message"?', a: ['Each is a small command with a type: createChat, sendMessage, modifyChatParticipants.', 'The server pushes newMessage and chatUpdate; the phone acks each one.'] },
  { label: '5 Data model', story: 'Aman opens the app, then sends "hi" in chat7.', setup: setup5, run: run5, q: 'ChatParticipant is keyed by chatId. How do we quickly find all of Aman\'s chats?', a: ['A GSI: DynamoDB keeps a copy of the table sorted by userId.', 'Message + Inbox rows are written in one transaction (max 100 items in DynamoDB).', 'DynamoDB: simple key lookups at huge scale, TTL, shards itself.'] }
]);
