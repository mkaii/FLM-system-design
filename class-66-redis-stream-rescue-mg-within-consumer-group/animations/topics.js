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

// ================= Part 1: rescuing a stuck entry =================
const JOBS = ['read order 502', 'send the email', 'XACK (done)'];
function worker(id, state) {
  // state: array of '', 'doing', 'done', 'x' for the three jobs
  const sub = id === 'e2' ? '<div class="sub">rescue job: every 30 s</div>' : '';
  Net.set(id, { body: '<div class="ck">' + JOBS.map((j, i) => `<div class="${state[i] || ''}">${j}</div>`).join('') + sub + '</div>' });
}
let R;   // what Redis holds in part 1
function paintR(hot) {
  Net.set('rd', { body: kv('stream orders', R.entry || 'empty', hot === 'entry' ? 'chg' : '')
    + kv('pending', R.pend || 'none', hot === 'pend' ? 'chg' : (R.stuck ? 'bad' : '')) });
}
let MAIL = 0;
const paintIn = cls => Net.set('in', { body: big(MAIL, MAIL === 1 ? 'email received' : 'emails received', cls) });
function rescueStage() {
  R = { entry: '', pend: '', stuck: false };
  MAIL = 0;
  Net.node('ord', { x: 115, y: 300, label: 'order-service', sub: 'producer', kind: 'client', w: 170 });
  Net.node('rd', { x: 385, y: 300, label: 'Redis', sub: 'stream + pending list', kind: 'lb', w: 270 });
  Net.node('e1', { x: 655, y: 150, label: 'email-1', sub: 'group email', kind: 'server', w: 220 });
  Net.node('e2', { x: 655, y: 455, label: 'email-2', sub: 'group email', kind: 'server', w: 220 });
  Net.node('in', { x: 888, y: 300, label: 'Aman\'s inbox', kind: 'db', w: 160 });
  ['ord|rd', 'rd|e1', 'rd|e2', 'e1|in', 'e2|in'].forEach(p => { const [a, b] = p.split('|'); Net.link(a, b); });
  paintR(); worker('e1', []); worker('e2', []); paintIn();
}
// order 502 arrives and is handed to email-1
async function handOut(ctx) {
  say('Order 502 is placed.');
  await send('ord', 'rd', '502');
  Net.check(ctx);
  R.entry = '502'; paintR('entry');
  await Net.beat(ctx, 1600);
  say('Redis hands it to <b>email-1</b> and notes who has it.');
  await send('rd', 'e1', '502', 'ok');
  Net.check(ctx);
  R.pend = '502 &rarr; email-1'; paintR('pend');
  worker('e1', ['done']);
  await Net.beat(ctx, 1600);
}
// the stuck clock, then email-2's rescue job takes it over and does the work
async function rescue(ctx) {
  say('Redis does <b>nothing</b> by itself. The entry just waits on the pending list.');
  R.stuck = true;
  await clock(ctx, 0, 60, 15, s => { R.pend = `502 &rarr; email-1 · ${s} s`; paintR(); });
  await Net.beat(ctx, 1200);
  say('email-2\'s rescue job runs: "anything stuck over <b>60 s</b>? I\'ll take it."');
  await send('e2', 'rd', 'XCLAIM');
  Net.check(ctx);
  R.stuck = false; R.pend = '502 &rarr; email-2'; paintR('pend');
  await send('rd', 'e2', '502', 'ok');
  Net.check(ctx);
  worker('e2', ['done', 'doing']);
  await Net.beat(ctx, 1400);
  await send('e2', 'in', 'email', 'ok');
  Net.check(ctx);
  MAIL++; worker('e2', ['done', 'done', 'doing']);
  await send('e2', 'rd', 'XACK', 'ok');
  Net.check(ctx);
  R.pend = ''; paintR('pend'); worker('e2', ['done', 'done', 'done']);
}
const RESCUE_ROWS = [
  ['email-2', 'XPENDING orders email', 'What is pending, with whom, for how long'],
  ['email-2', 'XCLAIM orders email email-2 60000 <id>', 'Take it over, only if stuck 60 s or more'],
  ['email-2', 'XACK orders email <id>', 'Done: remove it from the pending list']
];

// ---- 1: crash before the email is sent
function setup1() { rescueStage(); setRows(RESCUE_ROWS); }
async function run1(ctx) {
  await handOut(ctx);
  worker('e1', ['done', 'x']);
  down('e1', 'crashed');
  say('email-1 <b>crashes before sending</b> the email. No XACK.', 'err');
  await Net.beat(ctx, 2000);
  await rescue(ctx);
  paintIn('good');
  say('<b>Sent once.</b> The rescue was right: email-1 never sent it.', 'win');
}

// ---- 2: crash after the email is sent, before XACK
function setup2() { rescueStage(); setRows(RESCUE_ROWS); }
async function run2(ctx) {
  await handOut(ctx);
  worker('e1', ['done', 'doing']);
  await send('e1', 'in', 'email', 'ok');
  Net.check(ctx);
  MAIL++; paintIn();
  worker('e1', ['done', 'done', 'x']);
  down('e1', 'crashed');
  say('email-1 <b>sends the email</b>, then crashes <b>before XACK</b>.', 'err');
  await Net.beat(ctx, 2200);
  await rescue(ctx);
  paintIn('bad');
  say('<b>Sent twice.</b> Redis only knew "no XACK". It cannot know the email already went out.', 'err');
  await Net.beat(ctx, 2600);
  say('No waiting time fixes this. Make the work <b>safe to repeat</b>: "email for 502 already sent? then skip".', 'win');
}

// ---- 3: alive but slow
function setup3() { rescueStage(); setRows(RESCUE_ROWS); }
async function run3(ctx) {
  await handOut(ctx);
  worker('e1', ['done', 'doing']);
  badge('e1', 'slow…');
  say('email-1 is <b>alive</b>, but the email server is slow today. It is still waiting at "send".');
  await Net.beat(ctx, 2000);
  await rescue(ctx);
  say('email-2 thought email-1 was dead and sent it.');
  await Net.beat(ctx, 1800);
  say('Now the email server finally answers email-1\'s call…');
  await send('e1', 'in', 'email', 'bad');
  Net.check(ctx);
  MAIL++; paintIn('bad');
  worker('e1', ['done', 'done', 'done']);
  badge('e1', '');
  say('<b>Sent twice.</b> Redis cannot tell <b>slow</b> from <b>dead</b>. The 60 s must be longer than the slowest send.', 'err');
}

// ================= summary step for each page =================
const SUM = {
  rescue: [
    ['Rescue', 'A worker took an entry and never sent XACK', 'Another copy claims entries stuck over 60 s'],
    ['Repeats', 'The worker may have done the work before crashing', 'Make the work safe to repeat'],
    ['Slow vs dead', 'Redis cannot tell them apart', 'The 60 s must be longer than the slowest normal job']
  ],
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
  rescue: [
    ['1 Crash before send', U('Two copies of email-service. One takes an order and crashes.'), setup1, run1,
      'email-1 took order 502 and crashed before sending the email. Who sends it?',
      ['Nobody, until someone asks. Redis never reassigns on its own.', 'email-2\'s rescue job claims entries stuck over 60 s (XCLAIM), sends the email and XACKs.']],
    ['2 Crash after send', U('The email goes out, then the copy crashes before XACK.'), setup2, run2,
      'email-1 sent the email, then crashed before XACK. What does the customer get?',
      ['Two emails. Redis only sees "no XACK".', 'Fix: make the work safe to repeat, for example remember which orders were already emailed.']],
    ['3 Slow, not dead', U('The email server is slow today.'), setup3, run3,
      'email-1 is not dead, just slow. What happens after 60 s?',
      ['email-2 takes it over and sends it, then email-1 finishes and sends it too.', 'Set the stuck time longer than the slowest normal send.']]
  ],
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

