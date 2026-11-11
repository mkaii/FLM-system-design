Net.mount(690, 1.1);

// ---------- small helpers ----------
const table = (head, rows) => '<div class="tb"><div>' + head + '</div>' + (rows.length ? rows.map(r => `<div class="${r[1] || ''}">${esc(r[0])}</div>`).join('') : '<div class="dim">empty</div>') + '</div>';
const side = list => '<div style="display:flex;gap:6px;align-items:flex-start;margin-top:4px">' + list.map(t => `<div style="flex:1">${t}</div>`).join('') + '</div>';
const SLOW = 2600;
const step = (ctx, html, kind, ms) => { say(html, kind); return Net.beat(ctx, ms || SLOW); };
async function go(ctx, a, b, label, cls, dur) { await send(a, b, label, cls, dur || 850); Net.check(ctx); }
const sheet = (head, rows, n) => '<table class="sheet"><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr>' + rows.map((r, i) => `<tr class="${i < n ? '' : 'hide'}">` + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('') + '</table>';

// ---------------------------------------------------------------
// The cluster: 3 brokers (servers). Each partition has a leader and copies.
// K.parts: [{ name, leader, reps:[broker ids], isr:[...], logs:{ brokerId: [{o, t, cls}] }, hw }]
// A broker shows a partition only once it has created its folder (logs[b] exists).
// ---------------------------------------------------------------
let K;
const BX = { 1: [600, 118], 2: [838, 345], 3: [600, 572] };

function cluster(o) {
  o = o || {};
  K = {
    b: { 1: { up: true, ctrl: 'standby' }, 2: { up: true, ctrl: 'active' }, 3: { up: true, ctrl: 'standby' } },
    showCtrl: !!o.ctrl, showMeta: o.meta !== false, roles: o.roles !== false,
    metaOn: { 1: true, 2: true, 3: true },
    parts: [], prod: o.prod || null, cons: o.cons || null, note: {}
  };
  [1, 2, 3].forEach(i => Net.node('b' + i, { x: BX[i][0], y: BX[i][1], label: 'Broker ' + i + ' · kafka' + i, kind: 'proxy', w: 300 }));
  Net.link('b1', 'b2'); Net.link('b2', 'b3'); Net.link('b1', 'b3');
  if (K.prod) Net.node('p', { x: 150, y: 140, label: K.prod.label || 'Producer', kind: 'client', w: 210 });
  if (K.cons) Net.node('c', { x: 150, y: 520, label: K.cons.label || 'Consumer', kind: 'client', w: 210 });
}

// a partition fully replicated on its brokers, with the same messages everywhere
function part(name, leader, reps, msgs) {
  const logs = {};
  reps.forEach(b => { logs[b] = (msgs || []).map((t, i) => ({ o: i, t, cls: '' })); });
  K.parts.push({ name, leader, reps: reps.slice(), isr: reps.slice(), logs, hw: (msgs || []).length });
}
const P = name => K.parts.find(p => p.name === name);

function append(pn, b, t) { const p = P(pn); const o = p.logs[b].length; p.logs[b].push({ o, t, cls: 'new' }); return o; }
function copy(pn, from, to) {
  const p = P(pn), have = (p.logs[to] || []).length;
  p.logs[to] = p.logs[from].filter(m => m.cls !== 'gone').map((m, i) => ({ o: m.o, t: m.t, cls: i >= have ? 'new' : '' }));
}
function settle() { K.parts.forEach(p => Object.values(p.logs).forEach(l => l.forEach(m => { if (m.cls === 'new') m.cls = ''; }))); }
const metaText = () => K.parts.map(p => `${p.name}→b${p.leader} isr ${p.isr.join('')}`).join(' · ');

function paint() {
  [1, 2, 3].forEach(i => {
    const B = K.b[i];
    let body = '';
    const info = [];
    if (K.showCtrl) info.push([B.ctrl === 'active' ? 'controller · ACTIVE' : 'controller · standby', B.ctrl === 'active' ? 'amb' : 'dim']);
    if (K.showMeta && K.metaOn[i] && K.parts.length) info.push(['meta: ' + metaText(), 'dim']);
    if (K.note[i]) info.push([K.note[i], 'amb']);
    if (info.length) body += tw(info).replace('<div class="tw">', '<div class="tw" style="font-size:10.5px;padding:3px 8px;min-height:0">');
    const mine = K.parts.filter(p => p.logs[i]);
    if (mine.length) {
      body += side(mine.map(p => {
        const lead = p.leader === i;
        const head = K.roles ? `${p.name} · ${lead ? 'LEADER' : 'copy'}` : p.name;
        const rows = p.logs[i].map(m => [`${m.o}  ${m.t}${lead && m.o >= p.hw && m.cls !== 'gone' ? '  ⏳' : ''}`, m.cls || (lead && m.o >= p.hw ? 'dim' : '')]);
        return table(head, rows);
      }));
    } else if (!K.showCtrl) body += tw([['no partitions', 'dim']]);
    Net.set('b' + i, { body, state: B.up ? '' : 'down', badge: B.up ? '' : 'DOWN', badgeCls: 'bad' });
  });
  if (K.prod) Net.set('p', { body: tw(K.prod.lines.map(l => [l[0], l[1] || ''])) });
  if (K.cons) Net.set('c', { body: tw(K.cons.lines.length ? K.cons.lines.map(l => [l[0], l[1] || '']) : [['nothing read yet', 'dim']]) });
}
const prodLines = l => { K.prod.lines = l; paint(); };
const consAdd = (t, cls) => { K.cons.lines.push([t, cls || 'ok']); paint(); };

// ================= 1: brokers, topics, partitions =================
function setup1() {
  cluster({ meta: false, roles: false, prod: { label: 'Topic football', lines: [['just a name (logical)', 'dim']] }, cons: { label: 'Topic cricket', lines: [['just a name (logical)', 'dim']] } });
  Net.set('p', { kind: 'lb' }); Net.set('c', { kind: 'lb' });
  paint();
  panel([['Broker', 'A Kafka <b>server</b>. In production, a separate machine'], ['Topic', 'Only a <b>name</b>. Nothing is stored "in a topic"'], ['Partition', 'The real thing: an append-only log = a <b>folder on a broker\'s disk</b> (football-0, football-1)'], ['Remember', 'A broker holds <b>partitions of many topics</b>. A topic is spread across brokers']]);
}
async function run1(ctx) {
  await step(ctx, 'Kafka runs on <b>3 servers</b>, called <b>brokers</b>. Right now they hold nothing.');
  K.parts.push({ name: 'football-0', leader: 1, reps: [1], isr: [1], logs: {}, hw: 0 });
  K.parts.push({ name: 'football-1', leader: 2, reps: [2], isr: [2], logs: {}, hw: 0 });
  await both([go(ctx, 'p', 'b1', 'football-0'), go(ctx, 'p', 'b2', 'football-1')]);
  P('football-0').logs[1] = []; P('football-1').logs[2] = []; paint();
  await step(ctx, 'Topic <b>football</b> with 2 partitions: each partition becomes a <b>folder</b> on some broker.');
  K.parts.push({ name: 'cricket-0', leader: 3, reps: [3], isr: [3], logs: {}, hw: 0 });
  K.parts.push({ name: 'cricket-1', leader: 1, reps: [1], isr: [1], logs: {}, hw: 0 });
  await both([go(ctx, 'c', 'b3', 'cricket-0'), go(ctx, 'c', 'b1', 'cricket-1')]);
  P('cricket-0').logs[3] = []; P('cricket-1').logs[1] = []; paint();
  Net.flash('b1', 'ok');
  await step(ctx, 'Topic <b>cricket</b> too. Broker 1 now holds <b>football-0 and cricket-1</b>: partitions of different topics.');
  say('The topic is just a name. <b>Partitions are what live on brokers.</b>', 'win');
}

// ================= 2: replication factor =================
function setup2() {
  cluster({ meta: false, prod: { label: 'Producer', lines: [['sends m1 events → P0', 'dim']] } });
  part('P0', 1, [1], ['m1 kick-off', 'm1 goal']);
  part('P1', 2, [2], ['m2 kick-off']);
  paint();
  panel([['Replication factor', 'How many copies of each partition exist <b>in total</b>, original included'], ['RF 1', 'One copy. Its broker dies → that partition is gone'], ['RF 3', 'Leader + 2 copies, always on <b>different</b> brokers. RF can\'t be more than the number of brokers'], ['Remember', 'RF 3 survives <b>2</b> broker deaths. Copies exist only for failures and safety; they are not extra partitions']]);
}
async function run2(ctx) {
  await step(ctx, '<b>RF 1</b>: P0 lives only on broker 1, P1 only on broker 2.');
  K.b[1].up = false; paint();
  Net.flash('b1', 'bad');
  await step(ctx, 'Broker 1 dies. P0 had <b>no other copy</b>.', 'err');
  await lose('p', 'b1', 'm1 corner');
  await step(ctx, 'Nobody can write to or read P0. If the disk is gone, its messages are <b>lost forever</b>.', 'err');
  K.b[1].up = true; paint();
  await step(ctx, 'Now set <b>RF 3</b>: every partition gets 2 more copies, on the <b>other</b> brokers.', '', 1800);
  const p0 = P('P0'), p1 = P('P1');
  p0.reps = [1, 2, 3]; p1.reps = [2, 3, 1];
  await both([go(ctx, 'b1', 'b2', 'copy P0'), go(ctx, 'b1', 'b3', 'copy P0'), go(ctx, 'b2', 'b3', 'copy P1')]);
  copy('P0', 1, 2); copy('P0', 1, 3); copy('P1', 2, 3); paint();
  await go(ctx, 'b2', 'b1', 'copy P1');
  copy('P1', 2, 1); p0.isr = [1, 2, 3]; p1.isr = [2, 3, 1]; paint();
  await step(ctx, 'Each partition: one <b>LEADER</b> + 2 <b>copies</b>, never two on the same broker.');
  settle();
  K.b[1].up = false; p0.leader = 2; p0.isr = [2, 3]; p1.isr = [2, 3]; paint();
  Net.flash('b1', 'bad'); Net.flash('b2', 'ok');
  say('Broker 1 dies again → broker 2\'s copy of P0 becomes the <b>leader</b>. <b>Nothing lost.</b>', 'win');
}

// ================= 3: the controller =================
function setup3() {
  cluster({ ctrl: true, prod: null });
  part('P0', 1, [1, 2, 3]);
  part('P1', 2, [2, 3, 1]);
  paint();
  panel([['Controller', 'The cluster\'s <b>manager</b>: who is alive, where partitions go, who leads, ISR'], ['Active vs standby', '3 controllers, <b>one active</b>. Standbys keep a copy of the metadata, ready to take over'], ['Metadata log', 'Written by the active controller (KRaft). Before Kafka 4: stored in <b>ZooKeeper</b>'], ['Remember', 'Every broker keeps the metadata <b>in memory</b>, so <b>any</b> broker can answer "who leads P0?". Leader of a partition ≠ controller']]);
}
async function run3(ctx) {
  Net.flash('b2', 'ok');
  await step(ctx, 'Each broker also runs a <b>controller</b>. Only <b>one</b> is active: broker 2.');
  await both([go(ctx, 'b1', 'b2', '♥ heartbeat', 'muted'), go(ctx, 'b3', 'b2', '♥ heartbeat', 'muted')]);
  await step(ctx, 'Brokers send <b>heartbeats</b> to it, so it knows who is alive.');
  K.note[2] = 'decides: P0 → leader b1 · P1 → leader b2'; paint();
  await step(ctx, 'It decides <b>who leads which partition</b> and writes that into the <b>metadata log</b>.');
  K.note[2] = '';
  await both([go(ctx, 'b2', 'b1', 'metadata', 'amber'), go(ctx, 'b2', 'b3', 'metadata', 'amber')]);
  paint();
  await step(ctx, 'Every broker copies the metadata into memory. Now <b>any</b> broker can answer "who leads P0?".');
  Net.flash('b1', 'ok');
  say('Broker 1 <b>leads P0</b> but is <b>not</b> the controller. The two roles are unrelated.', 'win');
}

// ================= 4: creating a topic =================
function setup4() {
  cluster({ ctrl: true, prod: { label: 'Admin laptop', lines: [['create topic football', 'dim'], ['2 partitions · RF 3', 'dim']] } });
  K.metaOn = { 1: false, 2: false, 3: false };
  paint();
  panel([['Who you talk to', 'Any broker (the bootstrap server). It <b>forwards</b> the request'], ['Who decides', 'The <b>active controller</b>: spreads leaders and copies across brokers'], ['Where it is recorded', 'The <b>metadata log</b>; every broker copies it'], ['Remember', 'Admin → any broker → active controller → metadata → each broker creates <b>its own folders</b>']]);
}
async function run4(ctx) {
  await go(ctx, 'p', 'b1', 'create football · 2 parts · RF 3');
  await step(ctx, 'The admin talks to <b>any broker</b>, here broker 1. Brokers don\'t decide this themselves.');
  await go(ctx, 'b1', 'b2', 'forward to controller', 'amber');
  part('P0', 1, [1, 2, 3]); part('P1', 2, [2, 3, 1]);
  K.parts.forEach(p => { p.logs = {}; });
  K.metaOn[2] = true; paint();
  Net.flash('b2', 'ok');
  await step(ctx, 'The <b>active controller</b> makes the plan: P0 led by b1, P1 led by b2, copies on the others. Saved in the metadata log.');
  await both([go(ctx, 'b2', 'b1', 'metadata', 'amber'), go(ctx, 'b2', 'b3', 'metadata', 'amber')]);
  K.metaOn = { 1: true, 2: true, 3: true }; paint();
  await step(ctx, 'Every broker learns the plan.');
  K.parts.forEach(p => p.reps.forEach(b => { p.logs[b] = []; }));
  paint();
  [1, 2, 3].forEach(i => Net.flash('b' + i, 'ok'));
  await step(ctx, 'Each broker creates <b>its own folders</b> for the partitions it holds: leader or copy.');
  await go(ctx, 'b1', 'p', 'created ✓', 'ok');
  say('Topic ready: <b>2 partitions × 3 copies</b> spread over 3 brokers.', 'win');
}

// ================= 5: write and read (happy path) =================
function setup5() {
  cluster({ prod: { label: 'Producer', lines: [['acks = all', 'amb'], ['map: (empty)', 'dim']] }, cons: { label: 'Consumer', lines: [] } });
  part('P0', 1, [1, 2, 3], ['m1 kick-off']);
  part('P1', 2, [2, 3, 1], ['m2 kick-off']);
  paint();
  panel([['Find the leader', 'Ask <b>any</b> broker for metadata once, cache it'], ['Write', 'Only to the partition\'s <b>leader</b>. Followers <b>pull</b> copies from it'], ['High watermark', 'Last offset that <b>all in-sync copies</b> have. ⏳ = written on the leader, not copied yet'], ['Remember', 'Consumers read from the leader, <b>only up to the high watermark</b>: they never see a message that could vanish']]);
}
async function run5(ctx) {
  await go(ctx, 'p', 'b3', 'where is football?');
  await step(ctx, 'The producer asks <b>any broker</b> from its bootstrap list (here broker 3, not even a leader).', '', 1800);
  await go(ctx, 'b3', 'p', 'P0→b1 · P1→b2', 'amber');
  prodLines([['acks = all', 'amb'], ['map: P0→b1 · P1→b2', 'h']]);
  await step(ctx, 'Broker 3 answers from its in-memory metadata. The producer <b>caches</b> the map.');
  prodLines([['acks = all', 'amb'], ['map: P0→b1 · P1→b2', 'h'], ['hash(m1) % 2 = 0 → P0 → b1', 'ok']]);
  await step(ctx, '<b>m1:goal</b>: hash(m1) % 2 = 0 → partition P0 → its leader is <b>broker 1</b>.', '', 2000);
  await go(ctx, 'p', 'b1', 'm1 goal');
  append('P0', 1, 'm1 goal'); paint();
  await step(ctx, 'The leader appends it at offset 1. ⏳ = only on the leader so far, so consumers can\'t see it yet.');
  await both([go(ctx, 'b2', 'b1', 'fetch', 'muted', 600), go(ctx, 'b3', 'b1', 'fetch', 'muted', 600)]);
  await both([go(ctx, 'b1', 'b2', 'offset 1', 'teal'), go(ctx, 'b1', 'b3', 'offset 1', 'teal')]);
  copy('P0', 1, 2); copy('P0', 1, 3); paint();
  await step(ctx, 'The followers <b>pull</b> from the leader and append the same message.');
  P('P0').hw = 2; settle(); paint();
  await go(ctx, 'b1', 'p', 'OK (acks=all)', 'ok');
  await step(ctx, 'All in-sync copies have it → the <b>high watermark</b> moves → the producer gets <b>OK</b>.', 'win');
  await go(ctx, 'c', 'b1', 'read P0 from offset 1');
  await go(ctx, 'b1', 'c', 'm1 goal', 'ok');
  consAdd('P0 · offset 1 · m1 goal');
  say('The consumer reads from the <b>leader</b> and gets it. Copies are only standing by.', 'win');
}

// ================= 6: acks 0 / 1 / all =================
function setup6() {
  cluster({ ctrl: true, prod: { label: 'Producer', lines: [['map: P0→b1', 'dim']] } });
  part('P0', 1, [1, 2, 3], []);
  paint();
  panel([['Set where', '<b>acks</b> is a <b>producer</b> setting (each producer picks its own). Copying always happens; acks only decides <b>when the producer hears OK</b>'], ['acks = 0', 'Never waits. Fastest. A lost message goes unnoticed'], ['acks = 1', 'OK when the <b>leader</b> wrote it. Lost if the leader dies before any copy'], ['acks = all', 'OK when <b>every in-sync copy</b> wrote it. Safest (default in modern Kafka)']]);
}
async function run6(ctx) {
  const p0 = P('P0');
  prodLines([['acks = 0', 'amb']]);
  await go(ctx, 'p', 'b1', 'm1 corner');
  append('P0', 1, 'm1 corner'); paint();
  await step(ctx, '<b>acks=0</b>: fire and forget. No reply at all. If it had been lost, the producer would never know.');
  await both([go(ctx, 'b1', 'b2', 'copy', 'teal', 600), go(ctx, 'b1', 'b3', 'copy', 'teal', 600)]);
  copy('P0', 1, 2); copy('P0', 1, 3); p0.hw = 1; settle(); paint();

  prodLines([['acks = 1', 'amb']]);
  await go(ctx, 'p', 'b1', 'm1 goal');
  append('P0', 1, 'm1 goal'); paint();
  await go(ctx, 'b1', 'p', 'OK', 'ok');
  await step(ctx, '<b>acks=1</b>: OK as soon as the <b>leader</b> wrote it. The copies are still being made.');
  await both([go(ctx, 'b1', 'b2', 'copy', 'teal', 600), go(ctx, 'b1', 'b3', 'copy', 'teal', 600)]);
  copy('P0', 1, 2); copy('P0', 1, 3); p0.hw = 2; settle(); paint();

  prodLines([['acks = all', 'amb']]);
  await go(ctx, 'p', 'b1', 'm1 penalty');
  append('P0', 1, 'm1 penalty'); paint();
  await both([go(ctx, 'b1', 'b2', 'copy', 'teal', 700), go(ctx, 'b1', 'b3', 'copy', 'teal', 700)]);
  copy('P0', 1, 2); copy('P0', 1, 3); p0.hw = 3; settle(); paint();
  await go(ctx, 'b1', 'p', 'OK', 'ok');
  await step(ctx, '<b>acks=all</b>: OK only after <b>every in-sync copy</b> has it.', 'win');

  prodLines([['acks = 1', 'amb']]);
  await step(ctx, 'Now the danger with <b>acks=1</b>…', '', 1500);
  await go(ctx, 'p', 'b1', 'm1 red-card');
  append('P0', 1, 'm1 red-card'); paint();
  await go(ctx, 'b1', 'p', 'OK', 'ok');
  prodLines([['acks = 1', 'amb'], ['red-card: OK ✓ (thinks it is safe)', 'ok']]);
  K.b[1].up = false; paint();
  Net.flash('b1', 'bad');
  await step(ctx, 'Broker 1 crashes <b>before</b> any follower copied red-card.', 'err');
  p0.leader = 2; p0.isr = [2, 3]; K.note[2] = 'new leader of P0 (picked by controller)'; paint();
  Net.flash('b2', 'ok');
  await step(ctx, 'The controller makes broker 2 the leader. Its log has <b>no red-card</b>.', 'err');
  p0.logs[1][p0.logs[1].length - 1].cls = 'gone'; K.note[2] = ''; paint();
  prodLines([['acks = 1', 'amb'], ['red-card: got OK… but it is LOST', 'bad']]);
  say('The producer got OK, yet the message is <b>lost</b>. With <b>acks=all</b> this can\'t happen.', 'err');
}

// ================= 7: a leader broker dies =================
function setup7() {
  cluster({ ctrl: true, prod: { label: 'Producer', lines: [['acks = all', 'amb'], ['map: P0→b1 · P1→b2', 'h']] }, cons: { label: 'Consumer', lines: [['reading P0 from b1', 'dim']] } });
  part('P0', 1, [1, 2, 3], ['m1 kick-off', 'm1 goal']);
  part('P1', 2, [2, 3, 1], ['m2 kick-off']);
  paint();
  panel([['ISR', 'In-sync replicas: copies that are up to date. A dead or slow broker drops out'], ['Failover', 'Controller misses heartbeats → picks a <b>new leader from the ISR</b> → metadata updated'], ['Clients', 'Their next request to the dead broker fails → they ask any broker for fresh metadata → continue with the new leader'], ['Remember', 'No data lost: the new leader already had every committed message. The old broker comes back as a <b>copy</b> and catches up']]);
}
async function run7(ctx) {
  const p0 = P('P0'), p1 = P('P1');
  K.b[1].up = false; paint();
  Net.flash('b1', 'bad');
  await step(ctx, 'Broker 1, the <b>leader of P0</b>, crashes.', 'err');
  await go(ctx, 'b3', 'b2', '♥ heartbeat', 'muted', 700);
  await step(ctx, 'The active controller (broker 2) gets heartbeats from broker 3, but <b>none from broker 1</b>.', '', 2000);
  p0.leader = 2; p0.isr = [2, 3]; p1.isr = [2, 3]; K.note[2] = 'b1 dead → new leader of P0 = b2'; paint();
  Net.flash('b2', 'ok');
  await go(ctx, 'b2', 'b3', 'metadata', 'amber');
  await step(ctx, 'It picks a new leader <b>from the ISR</b> (broker 2) and updates the metadata. The ISR shrinks to 2,3.');
  K.note[2] = '';
  await lose('p', 'b1', 'm1 corner');
  await step(ctx, 'The producer still sends to broker 1 → <b>fails</b>.', 'err', 1800);
  await go(ctx, 'p', 'b3', 'who leads P0 now?');
  await go(ctx, 'b3', 'p', 'P0→b2', 'amber');
  prodLines([['acks = all', 'amb'], ['map: P0→b2 · P1→b2', 'h']]);
  await step(ctx, 'It asks any broker again and gets the new map.', '', 1800);
  await go(ctx, 'p', 'b2', 'm1 corner');
  append('P0', 2, 'm1 corner'); paint();
  await go(ctx, 'b2', 'b3', 'copy', 'teal', 700);
  copy('P0', 2, 3); p0.hw = 3; settle(); paint();
  await go(ctx, 'b2', 'p', 'OK', 'ok');
  await go(ctx, 'c', 'b2', 'read P0 from offset 2');
  await go(ctx, 'b2', 'c', 'm1 corner', 'ok');
  consAdd('P0 · offset 2 · m1 corner');
  await step(ctx, 'Writes and reads continue on broker 2. <b>Nothing lost.</b>', 'win');
  K.b[1].up = true; paint();
  await go(ctx, 'b1', 'b2', 'fetch what I missed', 'muted');
  await go(ctx, 'b2', 'b1', 'offset 2', 'teal');
  copy('P0', 2, 1); p0.isr = [2, 3, 1]; p1.isr = [2, 3, 1]; paint();
  say('Broker 1 returns as a <b>copy</b>, catches up, and rejoins the ISR.', 'win');
}

// ================= 8: the active controller dies =================
function setup8() {
  cluster({ ctrl: true });
  part('P0', 1, [1, 2, 3]);
  part('P1', 2, [2, 3, 1]);
  paint();
  panel([['Majority', 'Controllers vote (Raft). A new active one needs <b>2 of 3</b> votes'], ['Why odd numbers', '3 survives 1 failure, 5 survives 2. With 2 of 3 dead, no majority → no controller'], ['Remember', 'Controller dies → standbys elect a new one in seconds. It then also fixes partitions the dead broker was leading']]);
}
async function run8(ctx) {
  K.b[2].up = false; K.b[2].ctrl = 'standby'; paint();
  Net.flash('b2', 'bad');
  await step(ctx, 'Broker 2, the <b>active controller</b>, crashes.', 'err');
  await go(ctx, 'b1', 'b3', 'vote for me?', 'amber');
  await go(ctx, 'b3', 'b1', 'yes', 'ok');
  K.b[1].ctrl = 'active'; paint();
  Net.flash('b1', 'ok');
  await step(ctx, 'The 2 standbys vote. Broker 1 gets <b>2 of 3</b> votes (majority) → <b>new active controller</b>.', 'win');
  const p1 = P('P1');
  p1.leader = 3; p1.isr = [3, 1]; P('P0').isr = [1, 3]; K.note[1] = 'b2 dead → P1 leader = b3'; paint();
  await go(ctx, 'b1', 'b3', 'metadata', 'amber');
  K.note[1] = ''; paint();
  Net.flash('b3', 'ok');
  say('Its first job: broker 2 also <b>led P1</b>, so P1 gets a new leader (broker 3).', 'win');
}

// ================= 9: min.insync.replicas =================
function setup9() {
  cluster({ prod: { label: 'Producer', lines: [['acks = all', 'amb'], ['topic: min.insync.replicas = 2', 'h']] }, cons: { label: 'Consumer', lines: [['reading P0 from b1', 'dim']] } });
  part('P0', 1, [1, 2, 3], ['m1 kick-off']);
  paint();
  panel([['Set where', '<b>min.insync.replicas</b> is a <b>topic</b> setting (or a broker default)'], ['With acks=all', 'A write needs at least that many in-sync copies, otherwise it is <b>refused</b>'], ['acks=1 meanwhile', 'Accepted by the leader, but consumers can\'t see it until enough copies catch up'], ['Remember', 'RF 3 + min.insync 2 + acks=all: survives 1 broker down <b>without losing or refusing</b> anything']]);
}
async function run9(ctx) {
  const p0 = P('P0');
  K.b[3].up = false; p0.isr = [1, 2]; paint();
  Net.flash('b3', 'bad');
  await step(ctx, 'Broker 3 dies. ISR = 1,2 → <b>2 in-sync copies</b>, enough for min 2.', 'err');
  await go(ctx, 'p', 'b1', 'm1 goal');
  append('P0', 1, 'm1 goal'); paint();
  await go(ctx, 'b1', 'b2', 'copy', 'teal', 700);
  copy('P0', 1, 2); p0.hw = 2; settle(); paint();
  await go(ctx, 'b1', 'p', 'OK', 'ok');
  await step(ctx, 'Write accepted: leader + 1 copy = 2. ✓', 'win');
  K.b[2].up = false; p0.isr = [1]; paint();
  Net.flash('b2', 'bad');
  await step(ctx, 'Broker 2 dies too. ISR = 1 → <b>only the leader</b> is left.', 'err');
  await go(ctx, 'p', 'b1', 'm1 red-card');
  await go(ctx, 'b1', 'p', 'NOT_ENOUGH_REPLICAS', 'bad');
  prodLines([['acks = all', 'amb'], ['topic: min.insync.replicas = 2', 'h'], ['red-card refused ✗', 'bad']]);
  await step(ctx, 'acks=all write <b>refused</b>: Kafka won\'t keep just one copy. Safety over availability.', 'err');
  prodLines([['acks = 1', 'amb'], ['topic: min.insync.replicas = 2', 'h']]);
  await go(ctx, 'p', 'b1', 'm1 yellow-card');
  append('P0', 1, 'm1 yellow-card'); paint();
  await go(ctx, 'b1', 'p', 'OK', 'ok');
  await go(ctx, 'c', 'b1', 'anything new?');
  await go(ctx, 'b1', 'c', 'nothing', 'muted');
  await step(ctx, 'With <b>acks=1</b> the leader says OK, but the consumer sees <b>nothing</b> (⏳: above the high watermark).');
  K.b[2].up = true; paint();
  await go(ctx, 'b2', 'b1', 'fetch', 'muted', 600);
  await go(ctx, 'b1', 'b2', 'offset 2', 'teal');
  copy('P0', 1, 2); p0.isr = [1, 2]; p0.hw = 3; settle(); paint();
  await go(ctx, 'b1', 'c', 'm1 yellow-card', 'ok');
  consAdd('P0 · offset 2 · m1 yellow-card');
  say('Broker 2 is back and copies it → high watermark moves → the consumer finally gets it.', 'win');
}

// ================= 10: summary =================
const SUM_HEAD = ['', 'one line'];
const SUM = [
  ['Broker', 'a Kafka server; holds partitions of many topics'],
  ['Topic / partition', 'topic = a name; partition = a log folder on a broker'],
  ['Replication factor', 'copies per partition, original included, on different brokers'],
  ['Leader / copy', 'all reads and writes go to the leader; copies pull from it'],
  ['Controller', '1 active of 3; decides leaders, keeps the metadata, handles failures'],
  ['acks (producer)', '0 = no wait · 1 = leader wrote · all = every in-sync copy wrote'],
  ['ISR + min.insync', 'up-to-date copies; acks=all is refused below the minimum'],
  ['Failures', 'leader dies → new leader from ISR; controller dies → new one by vote']
];
function setup10() {
  Net.node('board', { x: 500, y: 300, label: 'Kafka replication on one page', kind: 'proxy', w: 900, body: sheet(SUM_HEAD, SUM, 0) });
  $('#final').classList.add('hidden');
}
async function run10(ctx) {
  say('Everything on one table.');
  for (let i = 1; i <= SUM.length; i++) { await wait(ctx, 900); Net.set('board', { body: sheet(SUM_HEAD, SUM, i) }); }
  say('<b>Copies keep the data safe; the controller keeps the cluster running.</b>', 'win');
}

startPage([
  { label: '1 Brokers + partitions', story: 'Two topics, football and cricket, on 3 brokers.', setup: setup1, run: run1, q: 'Where does a topic actually live?', a: ['Nowhere: a topic is a name.', 'Its partitions are folders on brokers, and a broker can hold partitions of many topics.'] },
  { label: '2 Replication factor', story: 'Topic football, 2 partitions, first with RF 1, then RF 3.', setup: setup2, run: run2, q: 'With RF 1, what happens to P0 when its broker dies?', a: ['It is unavailable, and lost if the disk is gone.', 'With RF 3 a copy on another broker becomes the leader.'] },
  { label: '3 Controller', story: '3 brokers, each also running a controller.', setup: setup3, run: run3, q: 'How can any broker know who leads P0?', a: ['The active controller writes the metadata log.', 'Every broker copies it into memory.'] },
  { label: '4 Create a topic', story: 'An admin creates football: 2 partitions, RF 3.', setup: setup4, run: run4, q: 'Who decides which broker gets which partition?', a: ['The active controller. The broker you talk to only forwards the request.'] },
  { label: '5 Write + read', story: 'The producer sends m1:goal with acks=all; a consumer reads it.', setup: setup5, run: run5, q: 'Which broker does the producer talk to first, and which one gets the message?', a: ['First any broker (bootstrap) for metadata.', 'Then the leader of the partition, directly.', 'Followers pull the copy; the consumer reads up to the high watermark.'] },
  { label: '6 acks 0 / 1 / all', story: 'Same message sent with each acks value, then a crash.', setup: setup6, run: run6, q: 'When can a producer get OK and still lose the message?', a: ['acks=1: the leader dies before any copy has it.', 'acks=all waits for every in-sync copy, so this can\'t happen.'] },
  { label: '7 Leader dies', story: 'Broker 1 leads P0 and crashes mid-match.', setup: setup7, run: run7, q: 'Who picks the new leader, and how do clients find it?', a: ['The active controller picks it from the ISR.', 'Clients fail once, ask any broker for fresh metadata, and continue.'] },
  { label: '8 Controller dies', story: 'Broker 2, the active controller, crashes.', setup: setup8, run: run8, q: 'Why do we run 3 controllers and not 2?', a: ['A new controller needs a majority vote.', '3 survives one failure; 2 would not.'] },
  { label: '9 min.insync.replicas', story: 'RF 3, min.insync.replicas 2, brokers fail one by one.', setup: setup9, run: run9, q: 'Two of three brokers are down. Does an acks=all write succeed?', a: ['No: NOT_ENOUGH_REPLICAS.', 'acks=1 is accepted but stays invisible until copies catch up.'] },
  { label: '10 Summary', story: 'All of it on one table.', setup: setup10, run: run10, q: 'In one line: what does replication buy us, and what does it cost?', a: ['Survive broker failures without losing data.', 'Costs extra disk and, with acks=all, a little extra latency.'] }
]);
