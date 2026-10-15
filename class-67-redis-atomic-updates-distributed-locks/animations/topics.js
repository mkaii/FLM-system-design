const $ = s => document.querySelector(s);
Net.mount(600, 1.1);
const say = (html, kind) => Net.say(html, kind);
const send = (a, b, label, cls, dur) => Net.send(a, b, { label, cls: cls || '', dur: dur || 850 });
const wait = (ctx, ms) => Net.wait(ctx, ms);
const both = list => Promise.all(list);
const badge = (id, text, good) => Net.set(id, { badge: text, badgeCls: good === undefined ? '' : (good ? 'ok' : 'bad') });
const down = (id, text) => Net.set(id, { state: 'down', badge: text, badgeCls: 'bad' });
const up = id => Net.set(id, { state: '', badge: '' });
const kv = (k, v, cls) => `<div class="kv ${cls || ''}"><span>${k}</span><b>${v}</b></div>`;
const big = (n, cap, cls) => `<div class="big ${cls || ''}">${n}</div><div class="cap">${cap}</div>`;

// the panel under the stage: [who, command, meaning]
function setRows(rows) {
  let h = '<table class="ct"><tr><th>who</th><th>command</th><th>meaning</th></tr>';
  rows.forEach(r => { h += `<tr><td class="t">${r[0]}</td><td class="c"><code>${r[1].replace(/</g, '&lt;')}</code></td><td class="m">${r[2]}</td></tr>`; });
  $('#code').innerHTML = h + '</table>';
  $('#final').classList.remove('hidden');
}

// counts seconds on a timer, fast: calls paint(s) for 0, by, 2*by ... up to 'to'
async function clock(ctx, from, to, by, paint) {
  for (let s = from; s <= to; s += by) { paint(s); await wait(ctx, 420); }
}

// ================= Part 2: read, add, write =================
let LIKES;
const paintLikes = cls => Net.set('rd', { body: big(LIKES, 'post:42:likes', cls) });
const mem = (id, html) => Net.set(id, { body: `<div class="mem">${html || '&nbsp;'}</div>` });
function likesStage(sub) {
  LIKES = 10;
  Net.group({ x: 268, y: 60, w: 280, h: 480, label: 'like-service' });
  Net.node('ua', { x: 110, y: 175, label: 'User A', sub: 'taps Like', kind: 'client', w: 150 });
  Net.node('ub', { x: 110, y: 425, label: 'User B', sub: 'taps Like', kind: 'client', w: 150 });
  Net.node('ta', { x: 408, y: 175, label: 'request A', sub, kind: 'server', w: 230 });
  Net.node('tb', { x: 408, y: 425, label: 'request B', sub, kind: 'server', w: 230 });
  Net.node('rd', { x: 790, y: 300, label: 'Redis', sub: 'one command at a time', kind: 'lb', w: 230 });
  Net.link('ua', 'ta'); Net.link('ub', 'tb'); Net.link('ta', 'rd'); Net.link('tb', 'rd');
  mem('ta'); mem('tb'); paintLikes();
}
// ---- 4: add in Java
function setup4() {
  likesStage('adds 1 in Java');
  setRows([
    ['request A, B', 'GET post:42:likes', 'Read the number into Java'],
    ['Java', 'likes = likes + 1', 'Add 1 in the app'],
    ['request A, B', 'SET post:42:likes 11', 'Write the new number back']
  ]);
}
async function run4(ctx) {
  say('Two people like post 42 <b>at the same moment</b>. Each request reads, adds 1 in Java, writes back.');
  await both([send('ua', 'ta', 'like'), send('ub', 'tb', 'like')]);
  Net.check(ctx);
  await Net.beat(ctx, 1200);
  await send('ta', 'rd', 'GET');
  Net.check(ctx);
  await send('rd', 'ta', '10', 'ok');
  Net.check(ctx);
  mem('ta', 'read <b>10</b>');
  say('Request A reads <b>10</b>.');
  await Net.beat(ctx, 1400);
  await send('tb', 'rd', 'GET');
  Net.check(ctx);
  await send('rd', 'tb', '10', 'ok');
  Net.check(ctx);
  mem('tb', 'read <b>10</b>');
  say('Request B reads <b>10</b> too: A has not written yet.');
  await Net.beat(ctx, 1800);
  mem('ta', 'read 10 &rarr; <b>11</b>');
  mem('tb', 'read 10 &rarr; <b>11</b>');
  say('Both add 1 <b>in Java</b>: both get 11.');
  await Net.beat(ctx, 1800);
  await send('ta', 'rd', 'SET 11');
  Net.check(ctx);
  LIKES = 11; paintLikes();
  await send('tb', 'rd', 'SET 11');
  Net.check(ctx);
  LIKES = 11; paintLikes('bad');
  Net.flash('rd', 'bad');
  say('Two likes, but the count is <b>11</b>, not 12. Each command was atomic; the <b>pair</b> GET + SET was not.', 'err');
}
// ---- 5: add in Redis
function setup5() {
  likesStage('asks Redis to add 1');
  setRows([['request A, B', 'INCR post:42:likes', 'Redis reads, adds 1 and saves, in one command. Replies with the new number']]);
}
async function run5(ctx) {
  say('Same two likes. This time each request sends <b>one</b> command: INCR.');
  await both([send('ua', 'ta', 'like'), send('ub', 'tb', 'like')]);
  Net.check(ctx);
  await Net.beat(ctx, 1200);
  await both([send('ta', 'rd', 'INCR'), send('tb', 'rd', 'INCR', '', 1050)]);
  Net.check(ctx);
  say('Both arrive. Redis runs them <b>one after the other</b>: nothing can slip in.');
  await Net.beat(ctx, 1400);
  LIKES = 11; paintLikes(); Net.flash('rd', 'ok');
  await send('rd', 'ta', '11', 'ok');
  Net.check(ctx);
  mem('ta', 'Redis says <b>11</b>');
  await wait(ctx, 500);
  LIKES = 12; paintLikes('good'); Net.flash('rd', 'ok');
  await send('rd', 'tb', '12', 'ok');
  Net.check(ctx);
  mem('tb', 'Redis says <b>12</b>');
  say('<b>12.</b> Do the read and the update <b>inside Redis</b>, in one command.', 'win');
}

// ================= Part 3: one lock per seat =================
let SEAT, LOCK;
function paintDb(cls) {
  Net.set('db', { body: kv('seat A1', SEAT.length ? SEAT.join(' + ') : 'free', cls || '') });
}
function paintLock(cls) { Net.set('rd', { body: kv('lock:A1', LOCK || 'none', cls || '') }); }
function seatStage(withRedis) {
  SEAT = []; LOCK = '';
  Net.node('ua', { x: 95, y: 160, label: 'Aman', sub: 'books A1', kind: 'client', w: 140 });
  Net.node('ub', { x: 95, y: 440, label: 'Riya', sub: 'books A1', kind: 'client', w: 140 });
  Net.node('r1', { x: 345, y: 160, label: 'booking replica 1', kind: 'server', w: 230 });
  Net.node('r2', { x: 345, y: 440, label: 'booking replica 2', kind: 'server', w: 230 });
  Net.node('db', { x: 735, y: withRedis ? 120 : 300, label: 'Database', sub: 'bookings', kind: 'db', w: 250 });
  Net.link('ua', 'r1'); Net.link('ub', 'r2'); Net.link('r1', 'db'); Net.link('r2', 'db');
  if (withRedis) {
    Net.node('rd', { x: 735, y: 470, label: 'Redis', sub: 'one key per seat', kind: 'lb', w: 250 });
    Net.link('r1', 'rd'); Net.link('r2', 'rd');
    paintLock();
  }
  mem('r1'); mem('r2'); paintDb();
}
// ---- 6: a Java lock in each replica
function setup6() {
  seatStage(false);
  mem('r1', 'Java lock for A1: <b>free</b>');
  mem('r2', 'Java lock for A1: <b>free</b>');
  setRows([['each replica', 'lock = locks.get("A1"); lock.lock()', 'A lock object in that replica\'s own memory']]);
}
async function run6(ctx) {
  say('Aman and Riya book seat A1 at the same moment. Their requests land on <b>different replicas</b>.');
  await both([send('ua', 'r1', 'A1'), send('ub', 'r2', 'A1')]);
  Net.check(ctx);
  await Net.beat(ctx, 1200);
  mem('r1', 'Java lock for A1: <b>mine</b>');
  mem('r2', 'Java lock for A1: <b>mine</b>');
  Net.flash('r1', 'ok'); Net.flash('r2', 'ok');
  say('Each replica locks <b>its own</b> lock object. Neither can see the other\'s.');
  await Net.beat(ctx, 2200);
  await both([send('r1', 'db', 'book A1'), send('r2', 'db', 'book A1', '', 1000)]);
  Net.check(ctx);
  SEAT = ['Aman', 'Riya']; paintDb('bad'); Net.flash('db', 'bad');
  say('Seat A1 is <b>sold twice</b>. A lock in memory only works inside one replica.', 'err');
}
// ---- 7: one lock in Redis
function setup7() {
  seatStage(true);
  setRows([
    ['replica', 'SET lock:A1 aman NX PX 30000', 'Create the lock only if nobody has it (NX). It deletes itself after 30 s (PX)'],
    ['replica', 'release: delete only if it still says aman', 'Give the lock back when done']
  ]);
}
async function run7(ctx) {
  say('Same race. Now the lock is <b>one key in Redis</b> that every replica asks for.');
  await both([send('ua', 'r1', 'A1'), send('ub', 'r2', 'A1')]);
  Net.check(ctx);
  await both([send('r1', 'rd', 'SET NX'), send('r2', 'rd', 'SET NX', '', 1050)]);
  Net.check(ctx);
  LOCK = 'aman'; paintLock('chg');
  say('Redis runs Aman\'s command first. The key now exists…');
  await Net.beat(ctx, 1400);
  await both([send('rd', 'r1', 'OK', 'ok'), send('rd', 'r2', 'nil', 'bad')]);
  Net.check(ctx);
  mem('r1', 'lock: <b>got it</b>');
  mem('r2', 'lock: <b>taken</b>');
  say('…so Riya\'s gets <b>nil</b>: "someone has it".');
  await Net.beat(ctx, 1600);
  await send('r2', 'ub', 'not available', 'bad');
  Net.check(ctx);
  await send('r1', 'db', 'book A1');
  Net.check(ctx);
  SEAT = ['Aman']; paintDb('good');
  await send('r1', 'rd', 'release');
  Net.check(ctx);
  LOCK = ''; paintLock();
  mem('r1', 'booked, lock released');
  say('<b>Sold once.</b> One key in Redis = one lock for every replica.', 'win');
}
// ---- 8: the lock expires while replica 1 is slow
function setup8() {
  seatStage(true);
  setRows([
    ['Redis', '(30 s pass)', 'The PX timer ends: Redis deletes lock:A1 by itself'],
    ['replica 2', 'SET lock:A1 riya NX PX 30000', 'The key is gone, so this succeeds'],
    ['replica 1', 'DEL lock:A1', 'DEL looks at the name only, not who owns it']
  ]);
}
async function run8(ctx) {
  await send('ua', 'r1', 'A1');
  Net.check(ctx);
  await send('r1', 'rd', 'SET NX');
  Net.check(ctx);
  LOCK = 'aman'; paintLock('chg'); mem('r1', 'lock: <b>got it</b> · working…');
  badge('r1', 'slow…');
  say('Aman\'s replica takes the lock, but its work is <b>slow</b> today.');
  await Net.beat(ctx, 1600);
  await clock(ctx, 0, 30, 10, s => { LOCK = `aman · ${s} s`; paintLock(); });
  LOCK = ''; paintLock('bad');
  say('<b>30 s.</b> The timer ends and Redis deletes the lock. Replica 1 is still working.', 'err');
  await Net.beat(ctx, 2000);
  await send('ub', 'r2', 'A1');
  Net.check(ctx);
  await send('r2', 'rd', 'SET NX');
  Net.check(ctx);
  LOCK = 'riya'; paintLock('chg');
  await send('rd', 'r2', 'OK', 'ok');
  Net.check(ctx);
  mem('r2', 'lock: <b>got it</b> · working…');
  say('Riya\'s replica asks: the key is gone, so it <b>gets the lock</b>.');
  await Net.beat(ctx, 2000);
  await send('r1', 'db', 'book A1');
  Net.check(ctx);
  SEAT = ['Aman']; paintDb();
  await send('r1', 'rd', 'DEL', 'bad');
  Net.check(ctx);
  LOCK = ''; paintLock('bad'); Net.flash('rd', 'bad'); badge('r1', '');
  mem('r1', 'booked, deleted <b>lock:A1</b>');
  say('Replica 1 finishes and deletes "its" lock. But that key was <b>Riya\'s</b>.', 'err');
  await Net.beat(ctx, 2200);
  await send('r2', 'db', 'book A1');
  Net.check(ctx);
  SEAT = ['Aman', 'Riya']; paintDb('bad'); Net.flash('db', 'bad');
  say('Riya\'s replica books A1 too: <b>sold twice</b>. Two holes: the lock ran out, and the wrong lock was deleted.', 'err');
}
// ---- 9: the two guards
function setup9() {
  seatStage(true);
  setRows([
    ['replica 1', 'delete lock:A1 only if it says aman', 'Guard 1: never delete someone else\'s lock (a small Lua script does check + delete as one step)'],
    ['each replica', 'UPDATE seats SET status=\'BOOKED\' WHERE id=\'A1\' AND status=\'FREE\'', 'Guard 2: the database books it only if it is still free. 0 rows updated = already taken']
  ]);
}
async function run9(ctx) {
  say('Same slow replica, same expired lock. Riya\'s replica now holds the lock.');
  LOCK = 'riya'; paintLock();
  mem('r1', 'working… (its lock expired)'); badge('r1', 'slow…');
  mem('r2', 'lock: <b>got it</b> · working…');
  await Net.beat(ctx, 2200);
  await send('r1', 'db', 'book A1 if free');
  Net.check(ctx);
  SEAT = ['Aman']; paintDb('good'); badge('r1', '');
  say('Replica 1 books A1. The seat was free, so the database accepts it.');
  await Net.beat(ctx, 1800);
  await send('r1', 'rd', 'delete if aman');
  Net.check(ctx);
  paintLock('chg');
  mem('r1', 'lock says riya: <b>left alone</b>');
  say('<b>Guard 1:</b> the lock says <b>riya</b>, not aman, so replica 1 leaves it alone.', 'win');
  await Net.beat(ctx, 2200);
  await send('r2', 'db', 'book A1 if free');
  Net.check(ctx);
  await send('db', 'r2', '0 rows', 'bad');
  Net.check(ctx);
  mem('r2', 'database: <b>already taken</b>');
  Net.flash('db', 'ok');
  say('<b>Guard 2:</b> the database says 0 rows: A1 is no longer free. Riya is told "not available".', 'win');
  await send('r2', 'ub', 'not available', 'bad');
  Net.check(ctx);
  say('<b>Sold once.</b> The Redis lock stops most clashes early; the database check is the final word.', 'win');
}

// ================= summary step for each page =================
const SUM = {
  atomic: [
    ['One command', 'Redis runs one command at a time', 'Each command is safe on its own'],
    ['Two commands', 'GET then SET: another request can slip in between', 'The update is lost (11 instead of 12)'],
    ['Fix', 'Read and update in one step', 'Do it in Redis: INCR']
  ],
  lock: [
    ['Java lock', 'Lives in one replica only', 'Two replicas both "hold" it'],
    ['Redis lock', 'One key per seat: SET lock:A1 &lt;me&gt; NX PX 30000', 'Exactly one replica gets it'],
    ['Guard 1', 'The lock can expire and go to someone else', 'Delete only your own lock'],
    ['Guard 2', 'Two replicas may still both try to book', 'The database books only if the seat is still free']
  ]
};
let SUMK;
const sumHTML = n => '<table class="sheet"><tr><th></th><th>problem</th><th>answer</th></tr>' + SUM[SUMK].map((r, i) => `<tr class="${i < n ? '' : 'hide'}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('') + '</table>';
function setupSum() {
  Net.node('board', { x: 500, y: 300, label: 'Summary', kind: 'proxy', w: 860, body: sumHTML(0) });
  $('#final').classList.add('hidden');
}
async function runSum(ctx) {
  say('Everything on this page in one table.');
  for (let i = 1; i <= SUM[SUMK].length; i++) { await wait(ctx, 700); Net.set('board', { body: sumHTML(i) }); }
  say('Assume things crash or run late, and make sure the work still happens <b>once</b>.', 'win');
}

const U = t => `<b>Use case:</b> ${t}`;
// [label, story, setup, run, question, answer bullets]
const TOPICS = {
  atomic: [
    ['1 Add in Java', U('Two people like the same post at the same moment.'), setup4, run4,
      'Redis runs one command at a time. Can two likes still turn 10 into 11?',
      ['Yes, if each request does GET, adds in Java, then SET.', 'The other request\'s GET slips in between the two commands.']],
    ['2 Add in Redis (INCR)', U('The same two likes, counted correctly.'), setup5, run5,
      'How do you make two likes always give 12?',
      ['INCR: Redis reads, adds and saves in one command.', 'Rule: do the read and the update inside Redis.']]
  ],
  lock: [
    ['1 Java lock', U('Movie booking runs as two replicas. Two people pick seat A1.'), setup6, run6,
      'Each replica locks seat A1 with its own Java lock. Is the seat safe?',
      ['No. Each lock lives in one replica\'s memory.', 'Two replicas both "hold the lock", so the seat is sold twice.']],
    ['2 Redis lock', U('The seat lock moves into Redis.'), setup7, run7,
      'Both replicas send SET lock:A1 … NX at the same moment. Who wins?',
      ['Exactly one: Redis runs them one after the other, and NX fails once the key exists.', 'The loser answers "not available" at once instead of waiting.']],
    ['3 Lock runs out', U('A replica is slower than the lock\'s 30 s.'), setup8, run8,
      'The lock lasts 30 s, but replica 1 takes 40 s. What can go wrong?',
      ['The lock expires, replica 2 takes it, so two replicas work on A1.', 'Replica 1 then deletes the key by name, which is now replica 2\'s lock.']],
    ['4 Two guards', U('The same slow replica, made safe.'), setup9, run9,
      'What two checks make the slow case safe?',
      ['Delete the lock only if it still holds your own value.', 'Let the database book the seat only if it is still free.']]
  ]
};

let QA = [], ansOpen = false;
function paintAnswer(i, open) {
  ansOpen = open;
  $('#ansList').innerHTML = QA[i].a.map(t => `<li>${t}</li>`).join('');
  $('#ansList').classList.toggle('hidden', !open);
  $('#bAns').textContent = open ? 'Hide answer' : 'Show answer';
}
document.addEventListener('net:step', e => {
  const i = e.detail.i;
  if (e.detail.state === 'select') $('#story').innerHTML += `<span class="q"><b>Think first:</b> ${QA[i].q}</span>`;
  paintAnswer(i, e.detail.state === 'done');
});
$('#bAns').onclick = () => { const b = document.querySelector('[data-s].on'); paintAnswer(b ? +b.dataset.s : 0, !ansOpen); };

// each page calls this with its topic
function startTopic(key) {
  SUMK = key;
  const list = TOPICS[key].map(t => ({ label: t[0], story: t[1], setup: t[2], run: t[3] }));
  QA = TOPICS[key].map(t => ({ q: t[4], a: t[5] }));
  list.push({ label: 'Summary', story: U('Everything on this page.'), setup: setupSum, run: runSum });
  QA.push({ q: 'What is the one rule behind this page?', a: SUM[key].map(r => `<b>${r[0]}:</b> ${r[2]}`) });
  Net.scenarios(list, '');
}

