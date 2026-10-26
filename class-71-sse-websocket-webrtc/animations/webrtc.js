Net.mount(600, 1.1);

// customer phone - home router - [STUN / app server / TURN] - mobile network gateway - rider phone
let W;
const kv2 = (k, v, cls) => `<div class="kv2 ${cls || ''}"><span>${k}</span><b>${v}</b></div>`;
const phoneHTML = k => kv2('my address', W[k].priv) + kv2('from outside', W[k].pub || '?', W[k].pub ? 'good' : '') + (W[k].peer ? kv2('other phone', W[k].peer, 'good') : '');
const routerHTML = k => kv2('public address', W[k].routerIp) + (W[k].note ? tw([[W[k].note, 'amb']]) : '');
const paint = () => {
  Net.set('cp', { body: phoneHTML('c') }); Net.set('rp', { body: phoneHTML('r') });
  Net.set('cr', { body: routerHTML('c') }); Net.set('rr', { body: routerHTML('r') });
};
function scene(o) {
  o = o || {};
  W = {
    c: { priv: '192.168.1.5', pub: o.pub ? '49.36.10.2:5000' : '', peer: o.peer ? '106.2.4.9:6100' : '', routerIp: '49.36.10.2', note: o.pub ? 'door 5000 = 192.168.1.5' : '' },
    r: { priv: '10.20.3.7', pub: o.pub ? '106.2.4.9:6100' : '', peer: o.peer ? '49.36.10.2:5000' : '', routerIp: '106.2.4.9', note: o.pub ? 'door 6100 = 10.20.3.7' : '' }
  };
  Net.node('cp', { x: 95, y: 420, label: 'Customer phone', sub: 'home Wi-Fi', kind: 'client', w: 175, body: '' });
  Net.node('cr', { x: 290, y: 420, label: 'Home Wi-Fi router', sub: 'address from Jio/Airtel', kind: 'proxy', w: 180, body: '' });
  Net.node('rr', { x: 710, y: 420, label: 'Mobile network', sub: o.strict ? 'college network: strict' : 'rider on 4G', kind: 'proxy', w: 180, body: '' });
  Net.node('rp', { x: 905, y: 420, label: 'Rider phone', sub: 'on 4G', kind: 'client', w: 175, body: '' });
  Net.link('cp', 'cr'); Net.link('rr', 'rp');
  if (!o.noHelpers) { addStun(); addSig(); }
  paint();
}
function addStun() {
  Net.node('stun', { x: 500, y: 85, label: 'STUN server', sub: '"what address do you see?"', kind: 'db', w: 220, body: '' });
  Net.link('cr', 'stun', { dashed: true }); Net.link('rr', 'stun', { dashed: true });
}
function addSig() {
  Net.node('sig', { x: 500, y: 250, label: 'Our app server', sub: 'passes messages (signaling)', kind: 'lb', w: 220, body: '' });
  Net.link('cr', 'sig', { dashed: true }); Net.link('rr', 'sig', { dashed: true });
}

// ================= 1: the problem =================
function setup1() {
  scene({ noHelpers: true });
  panel([['Private address', 'Your phone\'s address (<code>192.168.1.5</code>) only works <b>inside</b> your home Wi-Fi. The rider\'s (<code>10.20.3.7</code>) only works inside the mobile network'], ['Public address', 'Only the <b>router</b> has one (<code>49.36.10.2</code>), given by your internet provider. Everything your phone sends goes out through it'], ['The problem', 'Neither phone knows a usable address for the other one, or even for itself as seen from outside'], ['The two helpers', '<b>STUN server</b>: tells each phone its outside address. <b>Our app server</b>: passes those addresses between the phones']]);
}
async function run1(ctx) {
  say('You want to video call the rider. Your phone only knows its own address, <b>192.168.1.5</b>.');
  await Net.beat(ctx, 2000);
  say('Even if it knew the rider\'s <b>10.20.3.7</b>, sending there goes nowhere: that address only means something inside the rider\'s network.', 'err');
  await send('cp', 'cr', 'to 10.20.3.7', '', 600);
  Net.check(ctx);
  await lose('cr', 'rr', 'to 10.20.3.7');
  Net.check(ctx);
  await Net.beat(ctx, 2600);
  say('Two things are missing. First: each phone doesn\'t even know its own <b>outside</b> address.');
  await Net.beat(ctx, 2000);
  addStun();
  Net.set('stun', { body: tw([['job: tell each phone', 'amb'], ['its outside address', 'amb']]) });
  Net.flash('stun', 'ok');
  say('That\'s the <b>STUN server</b>\'s job (step 2).');
  await Net.beat(ctx, 2400);
  say('Second: the phones must <b>tell each other</b> those addresses.');
  await Net.beat(ctx, 1800);
  addSig();
  Net.set('sig', { body: tw([['job: pass the addresses', 'amb'], ['between the two phones', 'amb']]) });
  Net.flash('sig', 'ok');
  say('That\'s <b>our app server</b>\'s job (step 3). Then the phones can talk directly (step 4).', 'win');
}

// ================= 2: STUN =================
function setup2() {
  scene();
  Net.set('stun', { body: tw([['', 'dim']]) });
  panel([['Who owns the public address', 'The <b>router</b>, given by the internet provider. The phone never sees it'], ['What the router does', 'Every message going out gets its "from" field <b>replaced</b>: <code>192.168.1.5</code> → <code>49.36.10.2:5000</code>. It notes "door 5000 = 192.168.1.5" so replies find their way back'], ['What STUN does', 'Nothing clever: it reads the "from" field it received and sends it back. Now the phone knows its outside address']]);
}
async function run2(ctx) {
  say('The customer\'s phone asks the STUN server: "what address do you see me at?"');
  await send('cp', 'cr', 'from: 192.168.1.5', '', 700);
  Net.check(ctx);
  W.c.note = 'from 192.168.1.5 → 49.36.10.2:5000'; paint();
  Net.flash('cr', 'ok');
  say('On the way out, the <b>router replaces the "from" field</b> with its own public address and a door number.');
  await Net.beat(ctx, 2400);
  await send('cr', 'stun', 'from: 49.36.10.2:5000', '', 700);
  Net.check(ctx);
  Net.set('stun', { body: tw([['received from:', 'dim'], ['49.36.10.2:5000', 'h']]) });
  say('The STUN server just <b>reads the "from" field</b>: 49.36.10.2:5000.');
  await Net.beat(ctx, 2000);
  await send('stun', 'cr', 'you are 49.36.10.2:5000', 'ok', 700);
  Net.check(ctx);
  W.c.note = 'door 5000 = 192.168.1.5'; paint();
  await send('cr', 'cp', 'you are 49.36.10.2:5000', 'ok', 600);
  Net.check(ctx);
  W.c.pub = '49.36.10.2:5000'; paint();
  say('The reply comes back to door 5000, and the router passes it to the phone. The phone now knows its <b>outside address</b>.');
  await Net.beat(ctx, 2400);
  say('The rider\'s phone does the same.');
  await send('rp', 'rr', 'from: 10.20.3.7', '', 550);
  Net.check(ctx);
  await send('rr', 'stun', 'from: 106.2.4.9:6100', '', 550);
  Net.check(ctx);
  W.r.note = 'door 6100 = 10.20.3.7'; paint();
  Net.set('stun', { body: tw([['received from:', 'dim'], ['106.2.4.9:6100', 'h']]) });
  await send('stun', 'rr', 'you are 106.2.4.9:6100', 'ok', 550);
  Net.check(ctx);
  await send('rr', 'rp', 'you are 106.2.4.9:6100', 'ok', 500);
  Net.check(ctx);
  W.r.pub = '106.2.4.9:6100'; paint();
  say('Both phones now know their outside address. STUN gave out nothing; it only <b>reported</b> what it saw.', 'win');
}

// ================= 3: signaling =================
function setup3() {
  scene({ pub: true });
  Net.set('sig', { body: tw([['', 'dim']]) });
  panel([['Signaling', 'The phones swap two things through <b>our app server</b> (often over a WebSocket): the call details (offer / answer) and their outside addresses'], ['Offer', '"I want a video call. I can do these video and audio formats. Reach me at 49.36.10.2:5000"'], ['Answer', '"Accepted. I support these too. Reach me at 106.2.4.9:6100"'], ['Not video', 'These are tiny text messages. No video goes through our server']]);
}
async function run3(ctx) {
  say('Now the phones <b>swap addresses</b> through our app server.');
  await send('cp', 'cr', 'offer', '', 450);
  Net.check(ctx);
  await send('cr', 'sig', 'offer + 49.36.10.2:5000', '', 650);
  Net.check(ctx);
  Net.set('sig', { body: tw([['passing the offer to the rider', 'amb']]) });
  await send('sig', 'rr', 'offer', '', 600);
  Net.check(ctx);
  await send('rr', 'rp', 'offer', '', 450);
  Net.check(ctx);
  W.r.peer = '49.36.10.2:5000'; paint();
  say('The rider\'s phone now knows: the customer is at <b>49.36.10.2:5000</b>.');
  await Net.beat(ctx, 2000);
  await send('rp', 'rr', 'answer', 'ok', 450);
  Net.check(ctx);
  await send('rr', 'sig', 'answer + 106.2.4.9:6100', 'ok', 650);
  Net.check(ctx);
  Net.set('sig', { body: tw([['passing the answer back', 'amb']]) });
  await send('sig', 'cr', 'answer', 'ok', 600);
  Net.check(ctx);
  await send('cr', 'cp', 'answer', 'ok', 450);
  Net.check(ctx);
  W.c.peer = '106.2.4.9:6100'; paint();
  Net.set('sig', { body: tw([['introduction done', 'ok']]) });
  say('Each phone knows where to reach the other. Our server\'s job is <b>done</b>.', 'win');
}

// ================= 4: the direct call =================
function setup4() {
  scene({ pub: true, peer: true });
  Net.link('cr', 'rr');
  panel([['Direct', 'Each phone sends to the other\'s <b>outside</b> address. Each router checks its note ("door 6100 = 10.20.3.7") and passes it to the right phone'], ['Servers', 'STUN and our app server are no longer involved: video goes phone → router → router → phone'], ['Runs on', 'UDP: a late video frame is skipped, not waited for'], ['Used for', 'Google Meet, WhatsApp and Discord calls, screen sharing']]);
}
async function run4(ctx) {
  say('The customer\'s phone sends video to the rider\'s <b>outside</b> address: 106.2.4.9:6100.');
  await send('cp', 'cr', '🎥', 'ok', 450);
  Net.check(ctx);
  await send('cr', 'rr', 'to 106.2.4.9:6100', 'ok', 700);
  Net.check(ctx);
  Net.flash('rr', 'ok');
  say('It arrives at the rider\'s network on <b>door 6100</b>. The note says "door 6100 = 10.20.3.7"…');
  await Net.beat(ctx, 2000);
  await send('rr', 'rp', '🎥', 'ok', 450);
  Net.check(ctx);
  say('…so it\'s passed to the rider\'s phone. The same happens in the other direction.');
  Net.linkSet('cr', 'rr', { cls: 'on' });
  for (let i = 0; i < 3; i++) {
    await both([send('cp', 'cr', '🎥', 'ok', 300), send('rp', 'rr', '🎥', 'ok', 300)]);
    Net.check(ctx);
    await both([send('cr', 'rr', '🎥', 'ok', 450), send('rr', 'cr', '🎥', 'ok', 450)]);
    Net.check(ctx);
    await both([send('rr', 'rp', '🎥', 'ok', 300), send('cr', 'cp', '🎥', 'ok', 300)]);
    Net.check(ctx);
  }
  Net.set('cp', { body: phoneHTML('c') + tw([['in a call 🎥', 'ok']]) });
  Net.set('rp', { body: phoneHTML('r') + tw([['in a call 🎥', 'ok']]) });
  say('Video flows <b>directly</b> between the two phones. No server carries it.', 'win');
}

// ================= 5: TURN, when direct is blocked =================
function setup5() {
  scene({ pub: true, peer: true, strict: true });
  Net.node('turn', { x: 500, y: 545, label: 'TURN server', sub: 'relay, backup only', kind: 'db', w: 220, body: '' });
  Net.link('cr', 'rr', { dashed: true });
  Net.link('cr', 'turn', { dashed: true }); Net.link('rr', 'turn', { dashed: true });
  panel([['When', 'Some networks (strict office or college Wi-Fi) don\'t let anything from outside in, even with the address'], ['TURN', 'A relay server: both phones send their video to it, and it passes it on'], ['Cost', 'Slower (a detour), and the company pays for all that video traffic, so it is only the backup'], ['How often', 'Most calls connect directly; a smaller share needs TURN']]);
}
async function run5(ctx) {
  say('This time the rider is on a <b>strict college network</b>. The phones try the direct route…');
  await send('cp', 'cr', '🎥', 'ok', 400);
  Net.check(ctx);
  await lose('cr', 'rr', 'to 106.2.4.9:6100');
  Net.check(ctx);
  Net.flash('rr', 'bad');
  say('…and the college network <b>blocks</b> it.', 'err');
  await Net.beat(ctx, 2000);
  say('Backup plan: both phones send their video to the <b>TURN</b> relay, which passes it along.');
  Net.linkSet('cr', 'turn', { dashed: false, cls: 'on' }); Net.linkSet('rr', 'turn', { dashed: false, cls: 'on' });
  for (let i = 0; i < 3; i++) {
    await both([send('cr', 'turn', '🎥', 'ok', 450), send('rr', 'turn', '🎥', 'ok', 450)]);
    Net.check(ctx);
    await both([send('turn', 'rr', '🎥', 'ok', 450), send('turn', 'cr', '🎥', 'ok', 450)]);
    Net.check(ctx);
  }
  Net.set('turn', { body: tw([['relaying video both ways', 'amb']]) });
  say('The call works, through a middleman. Slower and costlier, so <b>only when direct fails</b>.', 'win');
}

// ================= 6: summary =================
const SUM = [
  ['Private address', 'Works only inside your own network', '192.168.1.5'],
  ['Public address', 'The router\'s, from the internet provider', '49.36.10.2'],
  ['Router', 'Rewrites "from" on the way out, remembers which door = which phone', 'door 5000 = 192.168.1.5'],
  ['STUN', 'Tells a phone the "from" it saw', '"you are 49.36.10.2:5000"'],
  ['Signaling (our server)', 'Passes offer, answer and addresses between the phones', 'small text messages'],
  ['Direct call', 'Video goes phone → router → router → phone', 'most calls'],
  ['TURN', 'Relays the video when direct is blocked', 'backup only']
];
const sumHTML = n => '<table class="sheet"><tr><th></th><th>job</th><th>example</th></tr>' + SUM.map((r, i) => `<tr class="${i < n ? '' : 'hide'}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('') + '</table>';
function setup6() {
  Net.node('board', { x: 500, y: 300, label: 'WebRTC in one table', kind: 'proxy', w: 900, body: sumHTML(0) });
  $('#final').classList.add('hidden');
}
async function run6(ctx) {
  say('Everything on this page.');
  for (let i = 1; i <= SUM.length; i++) { await wait(ctx, 700); Net.set('board', { body: sumHTML(i) }); }
  say('<b>STUN</b>: what\'s my outside address? <b>Signaling</b>: swap addresses. <b>Direct</b>: talk. <b>TURN</b>: middleman if blocked.', 'win');
}

startPage([
  { label: '1 The problem', story: 'You want to video call your rider.', setup: setup1, run: run1, q: 'Your phone is 192.168.1.5 on home Wi-Fi. Can the rider\'s phone send video to that address?', a: ['No. 192.168.1.5 only means something inside your home Wi-Fi.', 'Only the router has a public address, and the phone doesn\'t even know it.'] },
  { label: '2 STUN', story: 'Each phone finds out its outside address.', setup: setup2, run: run2, q: 'Who gives the phone its public address: the STUN server?', a: ['No. The router already has it, from the internet provider.', 'The router rewrites the "from" field of everything going out.', 'STUN just reads that "from" field and sends it back.'] },
  { label: '3 Signaling', story: 'The two phones swap addresses.', setup: setup3, run: run3, q: 'Each phone knows its own outside address. How does it learn the other\'s?', a: ['Through our app server: offer (with my address) one way, answer (with yours) the other way.', 'Tiny text messages; no video goes through our server.'] },
  { label: '4 Direct call', story: 'The video call starts.', setup: setup4, run: run4, q: 'Video arrives at the rider\'s network on door 6100. How does it reach the rider\'s phone?', a: ['The router noted "door 6100 = 10.20.3.7" when the phone sent its STUN request.', 'So it passes the video to that phone. No server in the middle.'] },
  { label: '5 TURN', story: 'The rider is on a strict college network.', setup: setup5, run: run5, q: 'The college network blocks anything from outside. How can the call still work?', a: ['Both phones send to a TURN relay, which passes the video along.', 'Slower and costlier, so it\'s only the backup.'] },
  { label: '6 Summary', story: 'All of WebRTC on one table.', setup: setup6, run: run6, q: 'In one line each: STUN, signaling, TURN?', a: ['STUN: what\'s my outside address.', 'Signaling: swap addresses and call details.', 'TURN: middleman when direct is blocked.'] }
]);
