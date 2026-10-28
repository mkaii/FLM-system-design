Net.mount(590, 1.1);

const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + (rows.length ? rows.map(r => `<div class="${r[1] || ''}">${r[0]}</div>`).join('') : '<div class="dim">empty</div>') + '</div>';
const bubble = (text, ticks, blue, incoming) => `<div style="text-align:${incoming ? 'left' : 'right'}"><span class="bub ${incoming ? 'in' : ''}">${esc(text)}${ticks ? `<span class="tk ${blue ? 'blue' : ''}">${ticks}</span>` : ''}</span></div>`;
const SLOW = 3200;   // pause after each important moment

// ---------- what each box shows ----------
// Riya has two devices: her phone (on chat server 2) and her tablet (on chat server 3)
let W;
function fresh(o) {
  o = o || {};
  const phone = !!o.riyaOn, tab = o.tabletOn === undefined ? !!o.riyaOn : o.tabletOn;
  W = {
    presence: o.presence || '',
    aBub: '', aTick: '', aBlue: false,
    phone: { on: phone, got: false, note: '' },
    tab: { on: tab, got: false, note: '' },
    s1: { map: o.amanOn === false ? [] : ['aman → aman-phone'], subs: o.amanOn === false ? [] : ['aman'], note: '' },
    s2: { map: phone ? ['riya → riya-phone'] : [], subs: phone ? ['riya'] : [], note: '' },
    s3: { map: tab ? ['riya → riya-tablet'] : [], subs: tab ? ['riya'] : [], note: '' },
    hot: '', msg: [], inb: [], seen: o.seen ? [['riya · 10:42', '']] : []
  };
}
// Redis channels and who is subscribed, worked out from the servers' subscriptions
function channels() {
  const ch = {};
  [['s1', 'server 1'], ['s2', 'server 2'], ['s3', 'server 3']].forEach(s => W[s[0]].subs.forEach(u => { (ch[u] = ch[u] || []).push(s[1]); }));
  return Object.keys(ch).map(u => [u + ' → ' + ch[u].join(', '), W.hot === u ? 'hot' : '']);
}
const amanHTML = () => (W.presence ? tw([['Riya · ' + W.presence, W.presence === 'online' ? 'ok' : 'dim']]) : tw([['Riya', 'dim']])) + (W.aBub ? bubble(W.aBub, W.aTick, W.aBlue) : '');
const devHTML = d => (d.got ? bubble('hi', '', false, true) : '') + (d.note ? tw([[d.note, d.note.indexOf('opened') >= 0 ? 'ok' : 'dim']]) : (d.got ? '' : tw([[d.on ? 'connected' : 'switched off', d.on ? 'ok' : 'dim']])));
const srvHTML = s => table('map', s.map.map(x => [x, ''])) + '<div style="height:4px"></div>' + table('subscribed to', s.subs.map(x => [x, 'h'])) + (s.note ? tw([[s.note, 'amb']]) : '');
const dbHTML = () => '<div style="display:flex;gap:6px;align-items:flex-start"><div style="flex:1.5">' + table('Message', W.msg) + '</div><div style="flex:1.2">' + table('Inbox', W.inb) + '</div><div style="flex:.9">' + table('LastSeen', W.seen) + '</div></div>';
function paint() {
  Net.set('a', { body: amanHTML() });
  Net.set('rp', { body: devHTML(W.phone), state: W.phone.on ? '' : 'down', badge: W.phone.on ? '' : 'offline', badgeCls: 'bad' });
  Net.set('rt', { body: devHTML(W.tab), state: W.tab.on ? '' : 'down', badge: W.tab.on ? '' : 'offline', badgeCls: 'bad' });
  ['s1', 's2', 's3'].forEach(s => Net.set(s, { body: srvHTML(W[s]) }));
  Net.set('rd', { body: table('channel → subscribed servers', channels()) });
  Net.set('db', { body: dbHTML() });
  Net.linkSet('s2', 'rp', { cls: W.phone.on ? 'on' : '', dashed: !W.phone.on });
  Net.linkSet('s3', 'rt', { cls: W.tab.on ? 'on' : '', dashed: !W.tab.on });
}
function stage(o) {
  fresh(o);
  Net.node('a', { x: 95, y: 120, label: "Aman's phone", kind: 'client', w: 170, body: '' });
  Net.node('s1', { x: 300, y: 135, label: 'Chat server 1', kind: 'proxy', w: 195, body: '' });
  Net.node('rd', { x: 470, y: 330, label: 'Redis Pub/Sub', sub: 'routes, stores nothing', kind: 'lb', w: 240, body: '' });
  Net.node('s2', { x: 700, y: 120, label: 'Chat server 2', kind: 'proxy', w: 195, body: '' });
  Net.node('rp', { x: 905, y: 120, label: "Riya's phone", kind: 'client', w: 170, body: '' });
  Net.node('s3', { x: 715, y: 345, label: 'Chat server 3', kind: 'proxy', w: 170, body: '' });
  Net.node('rt', { x: 905, y: 345, label: "Riya's tablet", kind: 'client', w: 170, body: '' });
  Net.node('db', { x: 450, y: 525, label: 'DynamoDB', kind: 'db', w: 640, body: '' });
  Net.link('a', 's1', { cls: o.amanOn === false ? '' : 'on' });
  Net.link('s2', 'rp'); Net.link('s3', 'rt');
  Net.link('s1', 'rd'); Net.link('rd', 's2'); Net.link('rd', 's3');
  Net.link('s1', 'db'); Net.link('s2', 'db'); Net.link('s3', 'db');
  paint();
}
const step = (ctx, html, kind, ms) => { say(html, kind); return Net.beat(ctx, ms || SLOW); };
const hiRow = () => [['msg1 · aman → chat7 · "hi"', 'new']];

// ================= 12: the problem with many servers =================
function setup1() {
  stage({ riyaOn: true });
  W.s1.subs = []; W.s2.subs = []; W.s3.subs = []; paint();
  Net.set('rd', { state: 'down', body: tw([['(not added yet)', 'dim']]) });
  panel([['Why many servers', 'One server holds ~500,000 connections; billions of users need thousands of chat servers'], ['Where everyone is', 'The load balancer put Aman on server 1, Riya\'s <b>phone</b> on server 2 and her <b>tablet</b> on server 3'], ['The problem', 'Server 1\'s map only knows <b>its own</b> connections. Riya has two devices, on two other servers'], ['What we need', 'A way to say "deliver this to all of Riya\'s devices, wherever they are". That is <b>Redis Pub/Sub</b>']]);
}
async function run1(ctx) {
  await step(ctx, 'Millions of users, so <b>many chat servers</b>. Aman is on <b>server 1</b>. Riya\'s <b>phone</b> is on server 2, her <b>tablet</b> on server 3.');
  W.aBub = 'hi'; paint();
  await send('a', 's1', 'sendMessage "hi"', '', 800);
  Net.check(ctx);
  W.s1.note = 'riya in my map? no'; paint();
  Net.flash('s1', 'bad');
  await step(ctx, 'Server 1 looks for Riya in its map… <b>nothing</b>. Her two connections live on servers 2 and 3.', 'err');
  await both([lose('s1', 's2', 'to riya?'), lose('s1', 's3', 'to riya?')]);
  Net.check(ctx);
  await step(ctx, 'Server 1 has no line to either device, and doesn\'t even know <b>which</b> servers have them.', 'err');
  Net.set('rd', { state: '', body: tw([['a post office between servers', 'amb']]) });
  Net.flash('rd', 'ok');
  await step(ctx, 'Fix: a shared <b>Redis Pub/Sub</b> that every chat server talks to, a <b>post office between servers</b>.', 'win');
}

// ================= 13: subscribe = online (presence) =================
function setup2() {
  stage({ riyaOn: false, amanOn: false });
  Net.linkSet('a', 's1', { dashed: true });
  panel([['Connect = subscribe', 'When a device connects, its chat server runs <code>SUBSCRIBE &lt;userId&gt;</code> (if it isn\'t subscribed already): "send me anything for this user"'], ['One channel per user', 'Channel <code>riya</code> has <b>one subscriber per server</b> holding one of her devices. Phone on server 2 + tablet on server 3 = 2 subscribers'], ['Online?', '<code>PUBSUB NUMSUB riya</code>: 1 or more = <b>online</b> (any device), 0 = offline'], ['Last seen', 'When her <b>last</b> device disconnects, nobody listens any more → write <b>LastSeen</b>: "last seen 10:42"']]);
}
async function run2(ctx) {
  await step(ctx, 'Aman opens WhatsApp. His phone connects to <b>server 1</b>.');
  await send('a', 's1', 'connect', '', 700);
  Net.check(ctx);
  Net.linkSet('a', 's1', { dashed: false, cls: 'on' });
  W.s1.map = ['aman → aman-phone']; paint();
  await send('s1', 'rd', 'SUBSCRIBE aman', '', 800);
  Net.check(ctx);
  W.s1.subs = ['aman']; W.hot = 'aman'; paint();
  await step(ctx, 'Server 1 adds him to its map and tells Redis <b>SUBSCRIBE aman</b>: "anything for Aman, send it to me".');
  W.hot = '';
  await step(ctx, 'Riya opens WhatsApp on her <b>phone</b>: it lands on server 2.', '', 2200);
  W.phone.on = true; paint();
  await send('rp', 's2', 'connect', '', 700);
  Net.check(ctx);
  W.s2.map = ['riya → riya-phone']; paint();
  await send('s2', 'rd', 'SUBSCRIBE riya', '', 800);
  Net.check(ctx);
  W.s2.subs = ['riya']; W.hot = 'riya'; paint();
  await step(ctx, 'Server 2: <b>SUBSCRIBE riya</b>.');
  await step(ctx, 'Her <b>tablet</b> is on too: it lands on server 3.', '', 2200);
  W.tab.on = true; paint();
  await send('rt', 's3', 'connect', '', 700);
  Net.check(ctx);
  W.s3.map = ['riya → riya-tablet']; paint();
  await send('s3', 'rd', 'SUBSCRIBE riya', '', 800);
  Net.check(ctx);
  W.s3.subs = ['riya']; paint();
  await step(ctx, 'Server 3 also subscribes to <b>riya</b>. The channel now has <b>two</b> subscribers: server 2 and server 3.');
  W.hot = '';
  await step(ctx, 'Aman opens his chat with Riya. Is she <b>online</b>?', '', 2200);
  await send('s1', 'rd', 'PUBSUB NUMSUB riya', '', 800);
  Net.check(ctx);
  W.hot = 'riya'; paint();
  await send('rd', 's1', '2 subscribers', 'ok', 700);
  Net.check(ctx);
  W.presence = 'online'; paint();
  await send('s1', 'a', 'riya: online', 'ok', 600);
  Net.check(ctx);
  await step(ctx, '2 servers listen on <b>riya</b> → she is connected → Aman sees <b>"online"</b>.', 'win');
  W.hot = '';
  await step(ctx, 'Riya closes the app on her <b>phone</b>. Her tablet is still on.', '', 2200);
  W.phone.on = false; W.s2.map = []; paint();
  await send('s2', 'rd', 'UNSUBSCRIBE riya', 'bad', 800);
  Net.check(ctx);
  W.s2.subs = []; paint();
  await send('s1', 'rd', 'PUBSUB NUMSUB riya', '', 700);
  Net.check(ctx);
  await send('rd', 's1', '1 subscriber', 'ok', 600);
  Net.check(ctx);
  await step(ctx, 'Server 2 unsubscribes, but server 3 still listens: 1 subscriber → Riya is <b>still online</b>.', 'win');
  await step(ctx, 'Now she switches the <b>tablet</b> off too.', '', 2200);
  W.tab.on = false; W.s3.map = []; paint();
  await both([send('s3', 'rd', 'UNSUBSCRIBE riya', 'bad', 800), send('s3', 'db', 'LastSeen riya = 10:42', '', 800)]);
  Net.check(ctx);
  W.s3.subs = []; W.seen = [['riya · 10:42', 'new']]; paint();
  await step(ctx, 'Her <b>last</b> device is gone: channel <b>riya</b> has no subscriber, and server 3 saves <b>last seen 10:42</b>.');
  await send('s1', 'rd', 'PUBSUB NUMSUB riya', '', 700);
  Net.check(ctx);
  await send('rd', 's1', '0 subscribers', 'bad', 600);
  Net.check(ctx);
  await send('s1', 'db', 'LastSeen riya?', '', 700);
  Net.check(ctx);
  await send('db', 's1', '10:42', 'ok', 600);
  Net.check(ctx);
  W.presence = 'last seen 10:42'; paint();
  await send('s1', 'a', 'last seen 10:42', 'ok', 600);
  Net.check(ctx);
  await step(ctx, 'Nobody listens on <b>riya</b> → offline → Aman sees <b>"last seen 10:42"</b>. That is presence.', 'win');
}

// ================= 14: send + single tick =================
function setup3() {
  stage({ riyaOn: true });
  W.presence = 'online'; paint();
  panel([['Order', '1. Find the recipient\'s <b>devices</b> (Client table). 2. <b>Save</b> Message + one Inbox row per device. 3. <b>✓</b> to Aman. 4. <code>PUBLISH riya</code> once. 5. Every subscribed server pushes to the devices it holds'], ['✓ single grey tick', '"The server has it, safely saved." It does <b>not</b> mean Riya got it'], ['One publish, many servers', 'Server 1 publishes <b>once</b> to <code>riya</code>; Redis copies it to <b>every</b> subscriber (server 2 and server 3)'], ['Each server\'s map', '<code>riya → [her devices on this server]</code>: server 2 pushes to the phone, server 3 to the tablet']]);
}
async function run3(ctx) {
  await step(ctx, 'Aman (server 1) sends "hi". Riya\'s phone is on server 2, her tablet on server 3.', '', 2400);
  W.aBub = 'hi'; paint();
  await send('a', 's1', 'sendMessage "hi"', '', 800);
  Net.check(ctx);
  await send('s1', 'db', 'chat7 members? their devices?', '', 800);
  Net.check(ctx);
  await send('db', 's1', 'riya → phone, tablet', 'ok', 700);
  Net.check(ctx);
  await step(ctx, 'Server 1 looks up the recipients: <b>Riya</b>, with <b>two devices</b>: phone and tablet.');
  await send('s1', 'db', 'save', '', 700);
  Net.check(ctx);
  W.msg = hiRow(); W.inb = [['riya-phone · msg1', 'new'], ['riya-tablet · msg1', 'new']]; paint();
  await step(ctx, '<b>Save first</b>: the message once, and <b>one Inbox row per device</b>.');
  await send('s1', 'a', '✓ saved', 'ok', 700);
  Net.check(ctx);
  W.aTick = '✓'; paint();
  await step(ctx, '<b>✓ Single grey tick</b>: "the server has it". No device has it yet.', 'win');
  await send('s1', 'rd', 'PUBLISH riya "hi"', '', 900);
  Net.check(ctx);
  W.hot = 'riya'; paint();
  await step(ctx, 'Server 1 <b>publishes once</b> to channel <b>riya</b>. It doesn\'t need to know where her devices are.');
  await both([send('rd', 's2', '"hi" for riya', 'ok', 900), send('rd', 's3', '"hi" for riya', 'ok', 900)]);
  Net.check(ctx);
  W.s2.note = 'riya → riya-phone'; W.s3.note = 'riya → riya-tablet'; paint();
  await step(ctx, 'Redis hands a copy to <b>every</b> subscriber of riya: server 2 <b>and</b> server 3. Each checks its own map.');
  await both([send('s2', 'rp', 'newMessage "hi"', 'ok', 800), send('s3', 'rt', 'newMessage "hi"', 'ok', 800)]);
  Net.check(ctx);
  W.phone.got = true; W.tab.got = true; W.phone.note = '(not opened yet)'; W.tab.note = '(not opened yet)';
  W.s2.note = ''; W.s3.note = ''; W.hot = ''; paint();
  await step(ctx, 'Both devices get "hi". Aman still sees <b>✓</b>: no device has told him yet.', 'win');
}

// ================= 15: double tick =================
function setup4() {
  stage({ riyaOn: true });
  W.presence = 'online'; W.aBub = 'hi'; W.aTick = '✓';
  W.phone.got = true; W.tab.got = true; W.phone.note = '(not opened yet)'; W.tab.note = '(not opened yet)';
  W.msg = [['msg1 · aman → chat7 · "hi"', '']]; W.inb = [['riya-phone · msg1', ''], ['riya-tablet · msg1', '']];
  paint();
  panel([['Each device acks', 'The phone acks to server 2, the tablet to server 3, each on its own WebSocket'], ['Each Inbox row', 'Each ack deletes <b>that device\'s</b> Inbox row only'], ['Receipt', 'The first ack makes its server <b>publish</b> "delivered msg1" to channel <code>aman</code> → server 1 → Aman'], ['✓✓ grey', '"Delivered to Riya" (any of her devices). Later acks don\'t change Aman\'s ticks']]);
}
async function run4(ctx) {
  await step(ctx, 'Both of Riya\'s devices have "hi". Each must say <b>"got it"</b>.', '', 2400);
  await send('rp', 's2', 'ack msg1', 'ok', 800);
  Net.check(ctx);
  await send('s2', 'db', 'delete phone row', '', 800);
  Net.check(ctx);
  W.inb = [['riya-phone · msg1', 'gone'], ['riya-tablet · msg1', '']]; paint();
  await step(ctx, 'The <b>phone</b> acks first → server 2 deletes <b>the phone\'s</b> Inbox row only.');
  W.inb = [['riya-tablet · msg1', '']]; paint();
  await send('s2', 'rd', 'PUBLISH aman "delivered msg1"', '', 900);
  Net.check(ctx);
  W.hot = 'aman'; paint();
  await step(ctx, 'Aman is on server 1, not server 2, so server 2 <b>publishes</b> a receipt to channel <b>aman</b>.');
  await send('rd', 's1', 'delivered msg1', 'ok', 900);
  Net.check(ctx);
  await send('s1', 'a', '✓✓', 'ok', 700);
  Net.check(ctx);
  W.aTick = '✓✓'; W.hot = ''; paint();
  await step(ctx, 'Server 1 tells Aman\'s phone: <b>✓✓ two grey ticks</b>, "delivered to Riya".', 'win');
  await send('rt', 's3', 'ack msg1', 'ok', 800);
  Net.check(ctx);
  await send('s3', 'db', 'delete tablet row', '', 800);
  Net.check(ctx);
  W.inb = [['riya-tablet · msg1', 'gone']]; paint();
  await step(ctx, 'The <b>tablet</b> acks too → server 3 deletes the tablet\'s row. Aman already has ✓✓, so nothing changes for him.');
  W.inb = []; paint();
  await step(ctx, 'Both rows gone: "hi" has reached <b>every</b> one of Riya\'s devices.', 'win');
}

// ================= 16: blue ticks =================
function setup5() {
  stage({ riyaOn: true });
  W.presence = 'online'; W.aBub = 'hi'; W.aTick = '✓✓';
  W.phone.got = true; W.tab.got = true; W.phone.note = '(not opened yet)'; W.tab.note = '(not opened yet)';
  W.msg = [['msg1 · aman → chat7 · "hi"', '']];
  paint();
  panel([['Read', 'Riya opens the chat on her <b>phone</b>; the app sends <b>read msg1</b>'], ['To Aman', 'Server 2 → <code>PUBLISH aman</code> → server 1 → Aman: <b>✓✓ blue</b>'], ['To her own tablet', 'Server 2 also publishes to <code>riya</code>, so her tablet marks the chat read too (no unread badge there)'], ['Groups', '✓✓ only when <b>every</b> member has it; blue only when every member has read it']]);
}
async function run5(ctx) {
  await step(ctx, 'Aman sees ✓✓ grey. Riya hasn\'t <b>opened</b> the chat yet, on either device.', '', 2400);
  W.phone.note = 'chat opened 👀'; paint();
  Net.flash('rp', 'ok');
  await step(ctx, 'Riya <b>opens</b> the chat on her <b>phone</b>.');
  await send('rp', 's2', 'read msg1', 'ok', 800);
  Net.check(ctx);
  await step(ctx, 'Her phone sends a <b>read</b> receipt to server 2.');
  await both([send('s2', 'rd', 'PUBLISH aman "read msg1"', '', 900), send('s2', 'rd', 'PUBLISH riya "read msg1"', '', 900)]);
  Net.check(ctx);
  W.hot = 'aman'; paint();
  await step(ctx, 'Server 2 publishes it twice: to <b>aman</b> (for his ticks) and to <b>riya</b> (to sync her other devices).');
  await both([send('rd', 's1', 'read msg1', 'ok', 900), send('rd', 's3', 'read msg1', 'ok', 900)]);
  Net.check(ctx);
  await both([send('s1', 'a', 'blue ✓✓', 'ok', 700), send('s3', 'rt', 'mark read', 'ok', 700)]);
  Net.check(ctx);
  W.aBlue = true; W.tab.note = 'marked read ✓'; W.hot = ''; paint();
  await step(ctx, 'Aman sees <b>✓✓ blue</b>, and her tablet marks the chat as read too.', 'win');
}

// ================= 17: Riya offline on both devices =================
function setup6() {
  stage({ riyaOn: false, seen: true });
  W.presence = 'last seen 10:42'; paint();
  panel([['Nobody subscribed', 'Both of Riya\'s devices are off, so channel <code>riya</code> has no subscriber. Redis <b>drops</b> the publish'], ['Not lost', 'Saved first: one Inbox row per device waits. Aman stays on <b>✓</b>'], ['Tablet comes back', 'It connects (to any server) → that server subscribes to <code>riya</code>, reads <b>the tablet\'s</b> Inbox, delivers → ack → ✓✓ for Aman'], ['Phone still off', 'Its own Inbox row keeps waiting until the phone connects (or the 30-day TTL)']]);
}
async function run6(ctx) {
  await step(ctx, 'Both of Riya\'s devices are <b>off</b> (last seen 10:42). Aman sends "hi".', '', 2400);
  W.aBub = 'hi'; paint();
  await send('a', 's1', 'sendMessage "hi"', '', 800);
  Net.check(ctx);
  await send('s1', 'db', 'devices? save', '', 800);
  Net.check(ctx);
  W.msg = hiRow(); W.inb = [['riya-phone · msg1', 'new'], ['riya-tablet · msg1', 'new']]; paint();
  await send('s1', 'a', '✓ saved', 'ok', 700);
  Net.check(ctx);
  W.aTick = '✓'; paint();
  await step(ctx, 'Saved, with an Inbox row for <b>each</b> device, so Aman gets <b>✓</b>.');
  await send('s1', 'rd', 'PUBLISH riya "hi"', '', 900);
  Net.check(ctx);
  await both([lose('rd', 's2', 'nobody'), lose('rd', 's3', 'nobody')]);
  Net.check(ctx);
  await step(ctx, 'Server 1 publishes to <b>riya</b>, but <b>no server is subscribed</b>. Redis drops it.', 'err');
  await step(ctx, 'Lost? <b>No</b>: both Inbox rows are waiting. Aman stays on <b>✓</b>.', 'win');
  await step(ctx, 'An hour later, Riya switches on her <b>tablet</b>. It lands on server 3.', '', 2200);
  W.tab.on = true; paint();
  await send('rt', 's3', 'connect', '', 700);
  Net.check(ctx);
  W.s3.map = ['riya → riya-tablet']; paint();
  await send('s3', 'rd', 'SUBSCRIBE riya', '', 800);
  Net.check(ctx);
  W.s3.subs = ['riya']; W.hot = 'riya'; paint();
  await step(ctx, 'Server 3 <b>subscribes</b> to riya (she\'s online again)…');
  await send('s3', 'db', 'inbox for riya-tablet?', '', 800);
  Net.check(ctx);
  await send('db', 's3', 'msg1', 'ok', 700);
  Net.check(ctx);
  await send('s3', 'rt', 'newMessage "hi"', 'ok', 800);
  Net.check(ctx);
  W.tab.got = true; W.hot = ''; paint();
  await step(ctx, '…reads <b>the tablet\'s</b> Inbox: "hi" was waiting. Delivered.');
  await send('rt', 's3', 'ack msg1', 'ok', 700);
  Net.check(ctx);
  W.inb = [['riya-phone · msg1', 'amb']]; paint();
  await send('s3', 'rd', 'PUBLISH aman "delivered msg1"', '', 900);
  Net.check(ctx);
  await send('rd', 's1', 'delivered msg1', 'ok', 800);
  Net.check(ctx);
  await send('s1', 'a', '✓✓', 'ok', 700);
  Net.check(ctx);
  W.aTick = '✓✓'; W.presence = 'online'; paint();
  await step(ctx, 'Ack → the tablet\'s row is deleted → receipt to <b>aman</b> → Aman sees <b>✓✓</b>. The <b>phone\'s</b> row still waits for the phone.', 'win');
}

// ================= 18: summary =================
const SUM = [
  ['Online', 'A device connects → its server runs SUBSCRIBE <userId>', 'Any subscriber = online'],
  ['Last seen', 'Her last device disconnects → no subscriber → write LastSeen', 'Show "last seen 10:42"'],
  ['✓', 'Saved: Message + one Inbox row per device', 'Server → sender directly'],
  ['Delivery', 'PUBLISH <userId> once → Redis copies to every subscribed server', 'Each pushes to the devices it holds'],
  ['✓✓ grey', 'A recipient device acked (its own Inbox row deleted)', 'PUBLISH <sender> → sender\'s server'],
  ['✓✓ blue', 'Recipient opened the chat', 'PUBLISH <sender>, and PUBLISH <recipient> to sync her devices'],
  ['Offline', 'No subscriber → dropped; Inbox rows wait per device', 'Delivered when each device connects']
];
const sumHTML = n => '<table class="sheet"><tr><th></th><th>happens when</th><th>how it travels</th></tr>' + SUM.map((r, i) => `<tr class="${i < n ? '' : 'hide'}"><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('') + '</table>';
function setup7() {
  Net.node('board', { x: 500, y: 295, label: 'Redis Pub/Sub in WhatsApp', kind: 'proxy', w: 920, body: sumHTML(0) });
  $('#final').classList.add('hidden');
}
async function run7(ctx) {
  say('Everything on one table.');
  for (let i = 1; i <= SUM.length; i++) { await wait(ctx, 900); Net.set('board', { body: sumHTML(i) }); }
  say('<b>Redis Pub/Sub routes, the database remembers.</b> Redis finds every server holding the user\'s devices; the per-device Inbox makes sure nothing is lost.', 'win');
}

startPage([
  { label: '12 Many servers', story: 'Aman is on server 1; Riya\'s phone is on server 2, her tablet on server 3.', setup: setup1, run: run1, q: 'Aman\'s message reaches server 1, but Riya\'s devices are on servers 2 and 3. How does it get to them?', a: ['Server 1\'s map only has its own connections.', 'A shared Redis Pub/Sub acts as a post office between the chat servers.'] },
  { label: '13 Online / last seen', story: 'Riya connects on phone and tablet, then switches them off one by one.', setup: setup2, run: run2, q: 'Riya\'s phone goes offline but her tablet is still on. Is she online?', a: ['Yes. Each server holding one of her devices subscribes to channel riya.', 'Online = at least one subscriber. Only when the last device leaves is she offline.', 'Then LastSeen is written: "last seen 10:42".'] },
  { label: '14 Send + ✓', story: 'Aman sends "hi"; Riya\'s two devices are on two other servers.', setup: setup3, run: run3, q: 'How many times does server 1 publish, and how many servers receive it?', a: ['Once, to channel riya.', 'Redis copies it to every subscriber: server 2 (phone) and server 3 (tablet).', '✓ already came earlier, right after the save.'] },
  { label: '15 ✓✓ delivered', story: 'Riya\'s phone and tablet both received "hi".', setup: setup4, run: run4, q: 'Both devices ack. When does Aman see ✓✓?', a: ['On the first ack: its server publishes "delivered" to channel aman.', 'Each ack deletes only that device\'s Inbox row.'] },
  { label: '16 Blue ✓✓', story: 'Riya opens the chat on her phone.', setup: setup5, run: run5, q: 'Riya reads it on her phone. How do Aman and her tablet find out?', a: ['Server 2 publishes "read" to aman (blue ticks) and to riya (her tablet marks it read).'] },
  { label: '17 Riya offline', story: 'Both of Riya\'s devices are off when Aman sends.', setup: setup6, run: run6, q: 'Nobody is subscribed to riya. Is the message lost?', a: ['Redis drops the publish, but one Inbox row per device is saved.', 'Each device gets it when it connects; the first one gives Aman ✓✓.'] },
  { label: '18 Summary', story: 'All of it on one table.', setup: setup7, run: run7, q: 'In one line: what does Redis Pub/Sub do, and what does the database do?', a: ['Redis Pub/Sub routes to every server holding the user\'s devices, fast.', 'The database (Message, per-device Inbox, LastSeen) makes sure nothing is lost.'] }
]);
