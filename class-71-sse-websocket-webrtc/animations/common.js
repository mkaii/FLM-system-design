// shared helpers for the three class 71 pages
const $ = s => document.querySelector(s);
const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const say = (html, kind) => Net.say(html, kind);
const send = (a, b, label, cls, dur) => Net.send(a, b, { label, cls: cls || '', dur: dur || 750 });
// a packet that never arrives: it travels slowly to the middle, then a red ✗ "lost" mark stays there for a moment
async function lose(a, b, label) {
  await Net.send(a, b, { label, cls: 'bad', dur: 1800, stopAt: 0.5 });
  let A, B;
  try { A = Net.get(a); B = Net.get(b); } catch (e) { return; }   // the step was switched meanwhile
  const layer = document.querySelector('.net-layer');
  if (!layer) return;
  const x = document.createElement('div');
  x.className = 'lost';
  x.innerHTML = '&#10007; ' + esc(label) + ' lost';
  x.style.left = (A.x + B.x) / 2 + 'px';
  x.style.top = (A.y + B.y) / 2 + 'px';
  layer.appendChild(x);
  setTimeout(function () { x.classList.add('fade'); }, 2200);
  setTimeout(function () { x.remove(); }, 3000);
}
const wait = (ctx, ms) => Net.wait(ctx, ms);
const both = l => Promise.all(l);
const tw = lines => '<div class="tw">' + lines.map(l => `<div class="${l[1] || ''}">${esc(l[0])}</div>`).join('') + '</div>';
const kv = (k, v, cls) => `<div class="kv ${cls || ''}"><span>${k}</span><b>${v}</b></div>`;
function panel(rows) {
  $('#code').innerHTML = '<table class="ct">' + rows.map(r => `<tr class="${r[0] === 'Used for' ? 'use' : ''}"><td class="k">${r[0]}</td><td class="v">${r[1]}</td></tr>`).join('') + '</table>';
  $('#final').classList.remove('hidden');
}
// "think first" question before each step, answer after it
function startPage(steps) {
  let open = false;
  const paint = (i, o) => { open = o; $('#ansList').innerHTML = steps[i].a.map(t => `<li>${t}</li>`).join(''); $('#ansList').classList.toggle('hidden', !o); $('#bAns').textContent = o ? 'Hide answer' : 'Show answer'; };
  document.addEventListener('net:step', e => {
    const i = e.detail.i;
    if (e.detail.state === 'select') $('#story').innerHTML += `<span class="q"><b>Think first:</b> ${steps[i].q}</span>`;
    paint(i, e.detail.state === 'done');
  });
  $('#bAns').onclick = () => { const b = document.querySelector('[data-s].on'); paint(b ? +b.dataset.s : 0, !open); };
  Net.scenarios(steps.map(s => ({ label: s.label, story: '<b>Use case:</b> ' + s.story, setup: s.setup, run: s.run })), '');
}
// theme switch: mono (default) or neon
(function () {
  const link = document.getElementById('themeCss'), b = document.getElementById('bTheme');
  const paint = () => { b.textContent = link.getAttribute('href') === 'mono.css' ? 'theme: mono' : 'theme: neon'; };
  b.onclick = () => {
    const next = link.getAttribute('href') === 'mono.css' ? 'fancy.css' : 'mono.css';
    link.setAttribute('href', next);
    try { localStorage.setItem('redisTheme', next === 'mono.css' ? 'mono' : 'neon'); } catch (e) {}
    paint();
  };
  paint();
})();
