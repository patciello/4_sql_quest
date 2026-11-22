'use strict';
/* SQL Quest — motor da aplicação (roda 100% no navegador; sem Python/Node). */

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const ITEMS = [];
TRACKS.forEach(t => t.items.forEach(it => { it.track = t; ITEMS.push(it); }));
const PROJECT = TRACKS.find(t => t.id === 'proj');
const MAX_ROWS = 1000;
const EXAM_N = 20, EXAM_MIN = 30, EXAM_PASS = 65;

let SQLJS, cm, cur, exam = null, examTimer = null;
const drafts = {}, hintsShown = {}, openTracks = new Set();
let state = {completed: [], current: ITEMS[0].id, project: {}, exams: [], stats: {}};
/* progresso por usuário: o convidado mantém a chave original; quem tem conta usa 'sqlquest2:<id>' */
const STATE_KEY = 'sqlquest2' + (Auth.isGuest() ? '' : ':' + Auth.current().id);
try { Object.assign(state, JSON.parse(localStorage.getItem(STATE_KEY) || '{}')); } catch (e) {}
state.stats = Object.assign({attempts: {}, first: {}, days: {}}, state.stats || {});
if (!ITEMS.some(i => i.id === state.current)) state.current = ITEMS[0].id;
const attempt = id => { state.stats.attempts[id] = (state.stats.attempts[id] || 0) + 1; };
const save = () => { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {} };
// Painel flutuante "Amostra" (esquema + dados). Delegação no documento: o botão é estático e o painel sobrevive às trocas de lição.
const setAmostra = open => {
  const p = document.getElementById('amostraPanel'), b = document.getElementById('amostra');
  if (!p || !b) return;
  const hadFocus = p.contains(document.activeElement);       // foco estava dentro do painel?
  p.classList.toggle('hidden', !open); b.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('modal-open', open);         // trava a rolagem da página ao fundo
  if (open) document.getElementById('amostraClose').focus();  // leva o foco para dentro da janela
  else if (hadFocus) b.focus();                               // devolve o foco ao botão ao fechar
};
document.addEventListener('click', e => {
  const p = document.getElementById('amostraPanel'); if (!p) return;
  if (e.target.closest('#amostra')) return setAmostra(p.classList.contains('hidden'));
  // fecha no botão Fechar ou ao clicar no fundo escurecido (o próprio #amostraPanel é o fundo)
  if (e.target.closest('#amostraClose') || e.target === p) setAmostra(false);
});
document.addEventListener('keydown', e => {
  const p = document.getElementById('amostraPanel'); if (!p || p.classList.contains('hidden')) return;
  if (e.key === 'Escape') return setAmostra(false);
  if (e.key !== 'Tab') return;                                 // mantém o Tab dentro da janela
  const f = [...p.querySelectorAll('button')], first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
const isDone = id => state.completed.includes(id);

/* ───────── Sandbox SQLite (recriado a cada execução) ───────── */
function newDb(seed) {
  const db = new SQLJS.Database();
  db.exec('PRAGMA foreign_keys = ON;');
  if (seed) db.exec(seed);
  return db;
}

/* who: 'user' = estado do aluno | 'sol' = estado do gabarito */
function buildDb(item, who) {
  if (!item.project) return newDb(SEEDS[item.dataset || 'vazio']);
  const db = newDb('');
  const idx = PROJECT.items.indexOf(item);
  for (let i = 0; i < idx; i++) {
    const s = PROJECT.items[i];
    if (s.kind !== 'script') continue;
    const sql = who === 'sol' ? s.solution : state.project[s.id];
    if (sql) db.exec(sql);
  }
  return db;
}

function runOn(db, sql) {
  const t0 = performance.now();
  try {
    const st = db.prepare(sql), columns = st.getColumnNames(), rows = [];
    while (st.step()) { rows.push(st.get()); if (rows.length > MAX_ROWS) break; }
    st.free();
    return {ok: true, columns, rows: rows.slice(0, MAX_ROWS), truncated: rows.length > MAX_ROWS, ms: performance.now() - t0};
  } catch (e) { return {ok: false, error: String(e.message || e)}; }
}

const FORBID = /\b(attach|detach|pragma|vacuum|load_extension|reindex)\b/i;
const cleanSql = s => (s || '').trim().replace(/;+\s*$/, '').trim();
function guardQuery(sql) {
  sql = cleanSql(sql);
  if (!sql) return 'Escreva uma consulta antes de executar.';
  if (sql.includes(';')) return "Execute apenas uma instrução por vez (remova o ';' extra).";
  if (!/^(select|with)\b/i.test(sql)) return 'Neste exercício só são permitidas consultas SELECT.';
  if (FORBID.test(sql)) return 'Comando não permitido neste sandbox.';
  return null;
}
function guardScript(sql) {
  if (!(sql || '').trim()) return 'Escreva o seu script antes de executar.';
  if (FORBID.test(sql)) return 'Comando não permitido neste sandbox (PRAGMA/ATTACH/VACUUM).';
  return null;
}

/* ───────── Validador ───────── */
const norm = v => typeof v === 'number' ? Math.round(v * 100) / 100 : typeof v === 'string' ? v.trim() : v;
const key = r => JSON.stringify(r.map(norm));
function validate(user, exp, ordered) {
  if (user.columns.length !== exp.columns.length)
    return {pass: false, msg: `Número de colunas diferente: você retornou ${user.columns.length}, o esperado é ${exp.columns.length}.`, hint: 'Revise a lista de colunas no SELECT.'};
  if (user.columns.map(c => c.toLowerCase()).join() !== exp.columns.map(c => c.toLowerCase()).join())
    return {pass: false, msg: `Os nomes/ordem das colunas não batem com o esperado: ${exp.columns.join(', ')}.`, hint: 'Use alias (AS) para nomear colunas calculadas.'};
  if (user.rows.length !== exp.rows.length)
    return {pass: false, msg: `Quantidade de linhas incorreta: ${user.rows.length} (esperado ${exp.rows.length}).`,
      hint: `Você retornou ${user.rows.length > exp.rows.length ? 'mais' : 'menos'} linhas do que o necessário. Confira o WHERE/JOIN/GROUP BY (ou os dados inseridos/alterados).`};
  const u = user.rows.map(key), e = exp.rows.map(key);
  const sortedSame = [...u].sort().join('|') === [...e].sort().join('|');
  const same = ordered ? u.join('|') === e.join('|') : sortedSame;
  if (same) return {pass: true, msg: 'Resultado idêntico ao gabarito. Muito bem!'};
  return {pass: false, msg: 'O número de linhas está certo, mas os valores diferem do esperado.',
    hint: ordered && sortedSame ? 'O conteúdo está certo. Revise a ordenação (ORDER BY).' : 'Compare os valores da sua tabela com o enunciado.'};
}

/* ───────── Navegação ───────── */
function locked(item) {
  if (!item.project || item.kind === 'export') return false;
  const i = PROJECT.items.indexOf(item);
  return i > 0 && !isDone(PROJECT.items[i - 1].id);
}
const kindIcon = it => ic(it.kind === 'quiz' ? 'help' : it.kind === 'export' ? 'package' : 'code', 14);

function renderNav() {
  const total = ITEMS.length, done = ITEMS.filter(i => isDone(i.id)).length;
  $('barfill').style.transform = `scaleX(${done / total})`;
  $('pc').textContent = `${done}/${total} itens · ${Math.round(done / total * 100)}%`;
  const trackHtml = t => {
    const d = t.items.filter(i => isDone(i.id)).length;
    const open = openTracks.has(t.id) || (cur && cur.track === t);
    return `<details class="trk" data-t="${t.id}" ${open ? 'open' : ''}><summary><span title="${esc(t.title)}">${icoOf(t.icon)}<span class="tx">${esc(t.title)}</span></span><span class="n">${d}/${t.items.length}</span></summary>` +
      t.items.map(i => `<button class="nav ${cur && i.id === cur.id ? 'on' : ''} ${locked(i) ? 'lock' : ''}" data-id="${i.id}" title="${esc(i.title)}">${isDone(i.id) ? ic('check-circle', 14) : locked(i) ? ic('lock', 14) : kindIcon(i)}<span class="tx">${esc(i.title)}</span></button>`).join('') + '</details>';
  };
  $('nav').innerHTML = PHASES.map(p => {
    const items = phaseItems(p), d = items.filter(i => isDone(i.id)).length;
    const open = openTracks.has(p.id) || (cur && PHASE_OF[cur.track.id] === p);
    const inner = p.lanes ? p.lanes.map(l => `<div class="lane-t">${l.icon} ${esc(l.title)}</div>` + l.tracks.map(trackHtml).join('')).join('') : p.tracks.map(trackHtml).join('');
    return `<details class="ph" data-t="${p.id}" ${open ? 'open' : ''}><summary><span class="phn">${d === items.length ? ic('check', 13) : p.n}</span><span class="pht">${icoOf(p.icon)}<span class="tx">${esc(p.title)}</span></span><span class="n">${d}/${items.length}</span></summary>
      <div class="bar sm"><i style="width:${Math.round(d / items.length * 100)}%"></i></div>${inner}</details>`;
  }).join('');
  $('nav').querySelectorAll('button').forEach(b => b.onclick = () => go(b.dataset.id));
  $('nav').querySelectorAll('details').forEach(d => d.ontoggle = e => { if (e.target !== d) return; d.open ? openTracks.add(d.dataset.t) : openTracks.delete(d.dataset.t); });
}

function showLesson() { $('roadmapBtn').classList.remove('on'); $('lessonView').classList.remove('hidden'); $('panelView').classList.add('hidden'); }
function showPanel(html) { $('roadmapBtn').classList.toggle('on', !!(html && html.includes('class="kpis"'))); $('lessonView').classList.add('hidden'); $('panelView').classList.remove('hidden'); if (html !== undefined) $('panelView').innerHTML = html; window.scrollTo(0, 0); }

function tableHtml(cols, rows) {
  return `<div class="res"><table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>` +
    rows.map(r => '<tr>' + r.map(v => v === null ? '<td class="n">NULL</td>' : `<td>${esc(v)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
}

function renderSchema(item) {
  let tables = item.tables && item.tables.length ? item.tables : (item.track.tables || []);
  let schemaHtml = '', sampleHtml = '', found = 0;
  try {
    const db = buildDb(item, 'user');
    for (const t of tables) {
      const info = db.exec(`PRAGMA table_info(${t})`)[0];
      if (!info) continue;
      found++;
      const fks = {};
      (db.exec(`PRAGMA foreign_key_list(${t})`)[0]?.values || []).forEach(r => fks[r[3]] = r[2] + '.' + r[4]);
      schemaHtml += `<div class="tbl"><h4>${esc(t)}</h4>` + info.values.map(c =>
        `<div class="c"><span>${esc(c[1])}${c[5] ? ` <span class="pk">${ic('key', 12)}</span>` : ''}${fks[c[1]] ? ` <span class="fk">${ic('arrow-right', 12)} ${esc(fks[c[1]])}</span>` : ''}</span><span class="t">${esc(c[2])}</span></div>`).join('') + '</div>';
      const s = db.exec(`SELECT * FROM ${t} LIMIT 3`)[0];
      sampleHtml += `<p class="hint">${esc(t)}</p>` + (s ? tableHtml(s.columns, s.values) : '<p class="hint">(vazia)</p>');
    }
    db.close();
  } catch (e) { /* esquema indisponível */ }
  if (!found) { schemaHtml = '<p class="hint">As tabelas ainda não existem — você vai criá-las nesta etapa.</p>'; sampleHtml = '<p class="hint">Sem dados.</p>'; }
  $('schema').innerHTML = schemaHtml; $('sample').innerHTML = sampleHtml;
}

function go(id) {
  if (cur && cm && cur.kind !== 'quiz' && cur.kind !== 'export') drafts[cur.id] = cm.getValue();
  showLesson();
  state.current = id; save(); cur = ITEMS.find(i => i.id === id);
  setPassed(false);
  const i = ITEMS.indexOf(cur);
  const ph = PHASE_OF[cur.track.id];
  $('trk').innerHTML = `<a href="#" id="toMap">Roadmap</a> › Fase ${ph.n} · ${esc(ph.title)} › ${esc(cur.track.title)}`;
  $('toMap').onclick = e => { e.preventDefault(); renderDash(); };
  $('title').textContent = cur.title;
  setBadge();
  /* conceito: teoria do exercício; nos domínios da certificação, a revisão do domínio fica recolhida */
  let th = cur.theory || '';
  if (!th && cur.track.group === 'Certificação' && cur.track.intro)
    th = `<details class="s"><summary>Revisão do domínio${cur.track.note ? ' e diferenças Oracle × SQLite' : ''}</summary>${cur.track.intro}${cur.track.note ? `<div class="note">${cur.track.note}</div>` : ''}</details>`;
  $('theory').innerHTML = th; $('thead').classList.toggle('hidden', !th);
  $('challenge').innerHTML = cur.kind === 'quiz' ? 'Escolha a alternativa correta.' : cur.challenge;
  renderSchema(cur);
  renderLearn();
  $('hints').innerHTML = ''; $('solbox').innerHTML = ''; $('out').innerHTML = ''; hintsShown[id] = 0;
  const isCode = cur.kind === 'query' || cur.kind === 'script';
  $('codeBlock').classList.toggle('hidden', !isCode);
  $('quiz').classList.toggle('hidden', cur.kind !== 'quiz');
  $('exportBox').classList.toggle('hidden', cur.kind !== 'export');
  const lk = locked(cur);
  $('lockmsg').classList.toggle('hidden', !lk);
  $('run').disabled = lk;
  if (isCode) {
    cm.setValue(drafts[id] ?? (state.project[id] && cur.project ? state.project[id] : cur.starter || '')); cm.clearHistory();
    setTimeout(() => cm.refresh(), 0);
  }
  if (cur.kind === 'quiz') renderQuiz();
  if (cur.kind === 'export') renderExport();
  $('prev').disabled = i === 0; $('next').disabled = i === ITEMS.length - 1;
    renderNav(); window.scrollTo(0, 0);
}

/* Explicação detalhada (recolhida) + videoaula embutida do canal Curso em Vídeo */
function renderLearn() {
  const ex = EXPLAIN[cur.id] || cur.how;
  $('explain').innerHTML = ex ? `<details class="ex"><summary>${ic('brain', 18)} Explicação passo a passo</summary>${ex}</details>` : '';
  const vids = ITEM_VIDEO[cur.id] || TRACK_VIDEO[cur.track.id] || [];
  if (!vids.length) { $('video').innerHTML = ''; return; }
  const fileMode = location.protocol === 'file:';  // YouTube recusa embed sem origem (erro 153)
  $('video').innerHTML = `<div class="vid"><h3>${ic('film', 20)} Videoaula${vids.length > 1 ? 's' : ''}</h3>` +
    vids.map((entry, n) => {
      const [ref, label] = entry.split('|'), [id, st] = ref.split('@'), start = +st || 0;
      const [title, ch, date, min] = VMETA[id], link = `https://www.youtube.com/watch?v=${id}${start ? '&t=' + start + 's' : ''}`;
      const at = start ? ` · começa em ${Math.floor(start / 60)}:${String(start % 60).padStart(2, '0')}` : '';
      return `<div class="vcard"><div><b title="${esc(title)}">${esc(title)}</b>${label ? `<div class="hint">${ic('pin', 13)} ${esc(label)}${at}</div>` : ''}<div class="hint">${esc(ch)} · ${date.split('-').reverse().join('/')} · ${min} min</div></div>
        <div class="row"><button class="b sm vplay" data-id="${id}" data-start="${start}" data-k="${n}">${ic('play', 12)} ${fileMode ? 'Assistir em janela' : 'Assistir aqui'}</button><a href="${link}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ${ic('external', 13)}</a></div><div class="vframe" id="vf-${n}"></div></div>`;
    }).join('') +
    `${fileMode ? '<div class="hint">O YouTube não permite o player embutido em arquivo local; o vídeo abre em janela.</div>' : ''}</div>`;
  document.querySelectorAll('.vplay').forEach(b => b.onclick = () => {
    const id = b.dataset.id, start = +b.dataset.start || 0;
    if (fileMode) return window.open(`https://www.youtube.com/watch?v=${id}${start ? '&t=' + start + 's' : ''}`, 'ytquest', 'width=1000,height=640,noopener');
    $('vf-' + b.dataset.k).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}${start ? '?start=' + start : ''}" title="${esc(VMETA[id][0])}" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    b.disabled = true;
  });
}

function setBadge() {
  const d = isDone(cur.id);
  $('badge').innerHTML = d ? ic('check', 13) + ' Concluído' : 'Em andamento';
  $('badge').className = 'badge' + (d ? ' ok' : '');
}

function toast(msg) {
  $('toast').innerHTML = ic('check-circle', 18) + ' ' + esc(msg); $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2500);
}
function complete(item) {
  if (isDone(item.id)) return false;
  state.completed.push(item.id);
  const day = localISO(new Date());
  state.stats.days[day] = (state.stats.days[day] || 0) + 1;
  state.stats.first[item.id] = (state.stats.attempts[item.id] || 1) === 1;
  Store.recordCompletion(item.id, state.stats.first[item.id], item.project ? state.project[item.id] : null);
  save(); renderNav();
  if (cur === item) { setBadge(); }
  toast('Concluído');
  return true;
}

/* ───────── Atalho Ctrl+Enter: executa; após acerto, avança ───────── */
const RUN_LABEL = ic('play', 14) + 'Executar e validar <kbd>Ctrl</kbd>+<kbd>Enter</kbd>';
const NEXT_LABEL = ic('arrow-right', 16) + 'Próximo exercício <kbd>Ctrl</kbd>+<kbd>Enter</kbd>';
let passedNow = false;
function setPassed(v) {
  passedNow = v;
  $('run').innerHTML = v && cur && ITEMS.indexOf(cur) < ITEMS.length - 1 ? NEXT_LABEL : RUN_LABEL;
  $('run').classList.toggle('p', true);
}
function goNext() { const i = ITEMS.indexOf(cur); if (i < ITEMS.length - 1) go(ITEMS[i + 1].id); }

/* ───────── Resultado paginado ───────── */
function showResult(res, size = 10, page = 1) {
  const pages = Math.max(1, Math.ceil(res.rows.length / size)); page = Math.min(page, pages);
  $('res').innerHTML = tableHtml(res.columns, res.rows.slice((page - 1) * size, page * size));
  $('pginfo').textContent = `${res.rows.length} linha(s) · ${res.columns.length} coluna(s) · página ${page}/${pages}`;
  $('pp').disabled = page <= 1; $('pn').disabled = page >= pages;
  $('pp').onclick = () => showResult(res, size, page - 1); $('pn').onclick = () => showResult(res, size, page + 1);
  $('size').onchange = e => showResult(res, +e.target.value, 1);
}
function showErr(msg) { $('out').innerHTML = `<div class="msg err"><b>${ic('alert', 16)} Erro de SQL</b><pre>${esc(msg)}</pre></div>`; }

function finish(v, user, sql, label) {
  setPassed(v.pass);
  Store.recordAttempt(cur.id, v.pass, sql);
  if (v.pass) {
    if (cur.project) state.project[cur.id] = sql;
    complete(cur); save();
  }
  $('out').innerHTML = `<div class="msg ${v.pass ? 'ok' : 'fail'}">${ic(v.pass ? 'check-circle' : 'search', 18)} <b>${esc(v.msg)}</b>${v.hint ? `<small>${ic('lightbulb', 13)} ${esc(v.hint)}</small>` : ''}</div>` +
    `<div class="pg"><span>${esc(label)}</span><select id="size" title="Linhas por página"><option>5</option><option selected>10</option><option>25</option><option>50</option></select>
     <button class="b sm" id="pp" aria-label="Página anterior">${ic('arrow-left', 14)}</button><button class="b sm" id="pn" aria-label="Próxima página">${ic('arrow-right', 14)}</button><span id="pginfo"></span></div>
     <div id="res"></div>`;
  showResult(user);
}

/* ───────── Execução de exercícios ───────── */
function execute() {
  if (!cur || locked(cur)) return;
  if (passedNow) return goNext();
  attempt(cur.id);
  const sql = cm.getValue();
  if (cur.kind === 'query') execQuery(sql);
  else if (cur.kind === 'script') execScript(sql);
}

function execQuery(sql) {
  const g = guardQuery(sql); if (g) return showErr(g);
  const dbU = buildDb(cur, 'user'); const user = runOn(dbU, cleanSql(sql)); dbU.close();
  if (!user.ok) return showErr(user.error);
  const dbE = buildDb(cur, 'sol'); const exp = runOn(dbE, cur.solution); dbE.close();
  if (!exp.ok) return showErr('Erro interno no gabarito: ' + exp.error);
  finish(validate(user, exp, cur.ordered), user, cleanSql(sql), 'Resultado da sua consulta');
}

function execScript(sql) {
  const g = guardScript(sql); if (g) return showErr(g);
  const dbU = buildDb(cur, 'user');
  try { dbU.exec(sql); } catch (e) { dbU.close(); return showErr(String(e.message || e)); }
  const user = runOn(dbU, cur.check); dbU.close();
  if (!user.ok) return showErr('Seu script não criou o que a verificação espera: ' + user.error);
  const dbE = buildDb(cur, 'sol');
  dbE.exec(cur.solution); const exp = runOn(dbE, cur.check); dbE.close();
  if (!exp.ok) return showErr('Erro interno no gabarito: ' + exp.error);
  let v = validate(user, exp, true);
  if (v.pass && cur.mustFail) {
    for (const probe of cur.mustFail) {
      const db = buildDb(cur, 'user'); db.exec(sql);
      let rejected = false;
      try { db.exec(probe); } catch (e) { rejected = true; }
      db.close();
      if (!rejected) { v = {pass: false, msg: 'A estrutura confere, mas as constraints não protegem os dados: um comando inválido foi aceito.', hint: 'Este comando deveria falhar: ' + probe}; break; }
    }
  }
  finish(v, user, sql, 'Estado do banco após o seu script (consulta de verificação)');
}

/* ───────── Quiz ───────── */
function renderQuiz() {
  $('quiz').innerHTML = `<div class="qtext">${cur.q}</div>` +
    cur.options.map((o, i) => `<label class="opt" data-i="${i}"><input type="radio" name="q" value="${i}"><span>${o}</span></label>`).join('') +
    '<div class="row"><button class="b p" id="qans">Responder</button></div><div id="qfb"></div>';
  $('qans').onclick = () => {
    const sel = document.querySelector('input[name=q]:checked');
    if (!sel) { $('qfb').innerHTML = '<div class="hint">Selecione uma alternativa.</div>'; return; }
    attempt(cur.id);
    const pick = +sel.value, ok = pick === cur.answer;
    Store.recordAttempt(cur.id, ok, null);
    document.querySelectorAll('#quiz .opt').forEach(l => { l.classList.remove('right', 'wrong'); if (+l.dataset.i === cur.answer) l.classList.add('right'); else if (+l.dataset.i === pick) l.classList.add('wrong'); });
    $('qfb').innerHTML = `<div class="msg ${ok ? 'ok' : 'fail'}">${ok ? ic('check-circle', 18) + ' <b>Correto!</b>' : ic('search', 18) + ' <b>Não foi dessa vez.</b>'}</div><div class="expl">${cur.explain}</div>`;
    if (ok) complete(cur);
    setPassed(ok);
    if (ok && ITEMS.indexOf(cur) < ITEMS.length - 1) $('qfb').insertAdjacentHTML('beforeend', '<div class="hint">Pressione <kbd>Ctrl</kbd>+<kbd>Enter</kbd> para ir ao próximo exercício.</div>');
  };
  document.querySelectorAll('input[name=q]').forEach(r => r.onchange = () => setPassed(false));
}

/* ───────── Simulado de certificação ───────── */
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function startExam() {
  const pool = ITEMS.filter(i => i.kind === 'quiz' && i.track.group === 'Certificação');
  const picked = shuffle(pool).slice(0, Math.min(EXAM_N, pool.length));
  exam = {qs: picked.map(q => ({q, order: shuffle(q.options.map((_, i) => i))})), i: 0, ans: {}, endAt: Date.now() + EXAM_MIN * 60000, done: false};
  clearInterval(examTimer);
  examTimer = setInterval(() => {
    if (!exam || exam.done) return clearInterval(examTimer);
    const left = Math.max(0, exam.endAt - Date.now()), el = $('tim');
    if (el) { el.textContent = `${String(Math.floor(left / 60000)).padStart(2, '0')}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`; el.classList.toggle('low', left < 300000); }
    if (left <= 0) finishExam();
  }, 1000);
  renderExam();
}

function renderExam() {
  if (exam.done) return renderExamResult();
  const e = exam, q = e.qs[e.i], answered = Object.keys(e.ans).length;
  showPanel(`<header><div><h2>Questão <mark class="mk">${e.i + 1}</mark> de ${e.qs.length}</h2><p class="lede">Simulado · ${e.qs.length} questões · mínimo ${EXAM_PASS}% (referência didática)</p></div><div class="tim" id="tim">--:--</div></header>
    <div class="qnav">${e.qs.map((_, i) => `<button data-i="${i}" class="${e.ans[i] !== undefined ? 'a' : ''} ${i === e.i ? 'c' : ''}">${i + 1}</button>`).join('')}</div>
    <div class="qtext">${q.q.q}</div><div class="hint">${esc(q.q.track.title)}</div>
    ${q.order.map(oi => `<label class="opt"><input type="radio" name="eq" value="${oi}" ${e.ans[e.i] === oi ? 'checked' : ''}><span>${q.q.options[oi]}</span></label>`).join('')}
    <div class="row" style="margin-top:16px;justify-content:space-between">
      <div class="row"><button class="b" id="eprev" ${e.i === 0 ? 'disabled' : ''}>${ic('arrow-left')}Anterior</button><button class="b" id="enext" ${e.i === e.qs.length - 1 ? 'disabled' : ''}>Próxima${ic('arrow-right')}</button></div>
      <div class="row"><span class="hint" id="acount">${answered}/${e.qs.length} respondidas</span><button class="b p" id="efinish">Finalizar simulado</button><button class="b" id="eexit">Sair</button></div></div>`);
  document.querySelectorAll('input[name=eq]').forEach(r => r.onchange = () => { e.ans[e.i] = +r.value; document.querySelectorAll('.qnav button')[e.i].classList.add('a'); $('acount').textContent = `${Object.keys(e.ans).length}/${e.qs.length} respondidas`; });
  document.querySelectorAll('.qnav button').forEach(b => b.onclick = () => { e.i = +b.dataset.i; renderExam(); });
  $('eprev').onclick = () => { e.i--; renderExam(); };
  $('enext').onclick = () => { e.i++; renderExam(); };
  $('efinish').onclick = () => { const miss = e.qs.length - Object.keys(e.ans).length; if (!miss || confirm(`Há ${miss} questão(ões) sem resposta. Finalizar mesmo assim?`)) finishExam(); };
  $('eexit').onclick = () => { if (confirm('Sair do simulado? O progresso dele será perdido.')) { clearInterval(examTimer); exam = null; renderDash(); } };
}

function finishExam() {
  clearInterval(examTimer);
  if (!exam || exam.done) return;
  exam.done = true;
  const c = exam.qs.filter((x, i) => exam.ans[i] === x.q.answer).length;
  state.exams.unshift({d: new Date().toISOString().slice(0, 10), c, t: exam.qs.length}); state.exams = state.exams.slice(0, 10);
  Store.recordExam(c, exam.qs.length, Math.round((Date.now() - (exam.endAt - EXAM_MIN * 60000)) / 1000));
  save(); renderNav(); renderExamResult();
}

function renderExamResult() {
  const e = exam, c = e.qs.filter((x, i) => e.ans[i] === x.q.answer).length, t = e.qs.length, pct = Math.round(c / t * 100), pass = pct >= EXAM_PASS;
  const dom = {};
  e.qs.forEach((x, i) => { const d = x.q.track.title; dom[d] = dom[d] || {c: 0, t: 0}; dom[d].t++; if (e.ans[i] === x.q.answer) dom[d].c++; });
  showPanel(`<header><div><h2>${pass ? 'Aprovado no <mark class="mk">simulado</mark>' : 'Continue <mark class="mk">treinando</mark>'}</h2><p class="lede">Resultado do simulado</p></div></header>
    <div class="score ${pass ? 'ok' : 'fail'}">${pct}% <span style="font-size:18px;color:var(--muted)">(${c}/${t})</span></div>
    <div class="hint">Nota mínima do simulado: ${EXAM_PASS}% (referência didática — não é a nota oficial do exame).</div>
    <h3>Desempenho por domínio</h3>
    <div class="dom">${Object.entries(dom).map(([d, v]) => `<div>${esc(d)}<div class="bar"><i style="width:${v.c / v.t * 100}%"></i></div></div><div>${v.c}/${v.t}</div>`).join('')}</div>
    <h3>Revisão</h3>
    ${e.qs.map((x, i) => { const ok = e.ans[i] === x.q.answer, your = e.ans[i];
      return `<details class="s" ${ok ? '' : 'open'}><summary>${ic(ok ? 'check-circle' : 'x-circle', 16)} ${i + 1}. ${esc(x.q.title)}</summary><div class="qtext">${x.q.q}</div>
      <div class="hint">Sua resposta: ${your === undefined ? '<i>em branco</i>' : x.q.options[your]}</div><div class="hint">Correta: ${x.q.options[x.q.answer]}</div><div class="expl">${x.q.explain}</div></details>`; }).join('')}
    <div class="row" style="margin-top:20px"><button class="b p" id="again">Novo simulado</button><button class="b" id="back">Voltar ao roadmap</button></div>`);
  $('again').onclick = startExam; $('back').onclick = () => { exam = null; renderDash(); };
}

/* ───────── Projeto: exportação para um PC com Python/SQLite ───────── */
function replayUser() {
  const db = newDb('');
  for (const s of PROJECT.items) if (s.kind === 'script' && state.project[s.id]) db.exec(state.project[s.id]);
  return db;
}
const withSemi = s => { s = s.trim(); return s.endsWith(';') ? s : s + ';'; };

function buildFiles() {
  const stamp = new Date().toISOString().slice(0, 10);
  let schema = `-- BiblioTech — esquema e carga de dados\n-- Gerado pelo SQL Quest em ${stamp} a partir do SQL aprovado em cada etapa.\n\nPRAGMA foreign_keys = ON;\n\n`;
  let queries = `-- BiblioTech — consultas de negócio e relatórios (aprovadas no SQL Quest)\n\n`;
  PROJECT.items.forEach((s, i) => {
    const sql = state.project[s.id]; if (!sql) return;
    const header = `-- Etapa ${i + 1}: ${s.title.replace(/^\d+\.\s*/, '')}\n`;
    if (s.kind === 'script') schema += header + withSemi(sql) + '\n\n';
    else if (s.kind === 'query') queries += header + withSemi(cleanSql(sql)) + '\n\n';
  });
  const db = replayUser(); const bytes = db.export(); db.close();
  const py = [
    '"""Executa o projeto BiblioTech: (re)cria o banco e roda as consultas.',
    'Uso:   python executar.py            (usa bibliotech.db)',
    '       python executar.py --rebuild  (recria o banco a partir de schema_e_dados.sql)"""',
    'import pathlib',
    'import sqlite3',
    'import sys',
    '',
    'HERE = pathlib.Path(__file__).resolve().parent',
    'DB = HERE / "bibliotech.db"',
    '',
    '',
    'def rebuild():',
    '    if DB.exists():',
    '        DB.unlink()',
    '    con = sqlite3.connect(DB)',
    '    con.executescript((HERE / "schema_e_dados.sql").read_text(encoding="utf-8"))',
    '    con.commit()',
    '    con.close()',
    '    print("Banco recriado:", DB.name)',
    '',
    '',
    'def statements(text):',
    '    buf = ""',
    '    for line in text.splitlines(keepends=True):',
    '        buf += line',
    '        if sqlite3.complete_statement(buf):',
    '            yield buf.strip()',
    '            buf = ""',
    '',
    '',
    'def main():',
    '    if "--rebuild" in sys.argv or not DB.exists():',
    '        rebuild()',
    '    con = sqlite3.connect(DB)',
    '    con.execute("PRAGMA foreign_keys = ON")',
    '    for stmt in statements((HERE / "consultas.sql").read_text(encoding="utf-8")):',
    '        title = stmt.splitlines()[0] if stmt.startswith("--") else "Consulta"',
    '        print("\\n" + title)',
    '        cur = con.execute(stmt)',
    '        cols = [d[0] for d in cur.description]',
    '        rows = cur.fetchall()',
    '        widths = [max([len(c)] + [len(str(r[i])) for r in rows]) for i, c in enumerate(cols)]',
    '        print("  ".join(c.ljust(w) for c, w in zip(cols, widths)))',
    '        print("  ".join("-" * w for w in widths))',
    '        for r in rows:',
    '            print("  ".join(str(v).ljust(w) for v, w in zip(r, widths)))',
    '    con.close()',
    '',
    '',
    'if __name__ == "__main__":',
    '    main()',
    ''
  ].join('\n');
  const readme = `# BiblioTech — projeto de banco de dados (SQLite)

Gerado pelo SQL Quest em ${stamp}.

## Conteúdo
- \`bibliotech.db\` — banco SQLite real, com o esquema, os dados e as alterações que você construiu.
- \`schema_e_dados.sql\` — DDL (tabelas, constraints, view, índices) e DML (carga, update, delete), na ordem das etapas.
- \`consultas.sql\` — consultas de negócio e relatórios aprovados.
- \`executar.py\` — recria o banco (opcional) e executa as consultas imprimindo as tabelas.

## Como usar (em um computador com Python 3 — o módulo sqlite3 já vem incluso)
    python executar.py              # roda as consultas sobre bibliotech.db
    python executar.py --rebuild    # recria o banco a partir de schema_e_dados.sql

## Sem Python
- Linha de comando: \`sqlite3 bibliotech.db < consultas.sql\`  (ou \`sqlite3 novo.db < schema_e_dados.sql\` para recriar)
- Interface gráfica: abra \`bibliotech.db\` no DB Browser for SQLite, DBeaver ou VS Code (extensão SQLite).

## Observações
- As chaves estrangeiras precisam de \`PRAGMA foreign_keys = ON;\` a cada conexão (já incluído nos scripts).
- A etapa 12 usa a data fixa 2025-06-30 como "hoje" para o resultado ser reproduzível.
`;
  return {schema, queries, bytes, py, readme};
}

function dl(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], {type: type || 'application/octet-stream'}));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function renderExport() {
  const steps = PROJECT.items.filter(i => i.kind !== 'export'), done = steps.filter(i => isDone(i.id)).length;
  $('exportBox').innerHTML = `<div class="pkg"><b>Etapas concluídas: ${done}/${steps.length}</b>${done < steps.length ? '<br><span class="hint">Você pode exportar agora, mas o pacote só terá o que já foi aprovado.</span>' : ''}</div>
    <div class="pkg">O pacote contém: <code>bibliotech.db</code> (banco SQLite real) · <code>schema_e_dados.sql</code> · <code>consultas.sql</code> · <code>executar.py</code> · <code>README.md</code></div>
    <div class="row"><button class="b p" id="dzip">${ic('download', 16)} Baixar pacote (.zip)</button></div>
    <details class="s"><summary>Baixar arquivos separados</summary><div class="row">
      <button class="b sm" id="ddb">bibliotech.db</button><button class="b sm" id="dschema">schema_e_dados.sql</button>
      <button class="b sm" id="dq">consultas.sql</button><button class="b sm" id="dpy">executar.py</button></div></details>
    <div id="expmsg"></div>`;
  const mark = () => { complete(cur); $('expmsg').innerHTML = '<div class="msg ok">' + ic('check-circle', 18) + ' Arquivos gerados. Copie-os para um computador com Python (ou SQLite) e siga o README.md.</div>'; };
  const need = () => { if (!Object.keys(state.project).length) { $('expmsg').innerHTML = '<div class="msg fail">Conclua ao menos a etapa 1 antes de exportar.</div>'; return null; } return buildFiles(); };
  $('dzip').onclick = async () => {
    const f = need(); if (!f) return;
    if (typeof JSZip === 'undefined') { $('expmsg').innerHTML = '<div class="msg fail">Não foi possível carregar o gerador de .zip (sem internet?). Use "Baixar arquivos separados".</div>'; return; }
    const z = new JSZip();
    z.file('bibliotech.db', f.bytes); z.file('schema_e_dados.sql', f.schema); z.file('consultas.sql', f.queries); z.file('executar.py', f.py); z.file('README.md', f.readme);
    dl('bibliotech-projeto.zip', await z.generateAsync({type: 'blob'}), 'application/zip'); mark();
  };
  $('ddb').onclick = () => { const f = need(); if (f) { dl('bibliotech.db', f.bytes); mark(); } };
  $('dschema').onclick = () => { const f = need(); if (f) { dl('schema_e_dados.sql', f.schema, 'text/plain'); mark(); } };
  $('dq').onclick = () => { const f = need(); if (f) { dl('consultas.sql', f.queries, 'text/plain'); mark(); } };
  $('dpy').onclick = () => { const f = need(); if (f) { dl('executar.py', f.py, 'text/plain'); mark(); } };
}

/* ───────── Autoteste dos gabaritos (roda no navegador) ───────── */
function selfTest() {
  const lines = []; let okN = 0, badN = 0;
  const rec = (ok, name, why) => { ok ? okN++ : badN++; lines.push(`<li class="${ok ? 'o' : 'f'}">${ic(ok ? 'check' : 'x', 14)} ${esc(name)}${why ? ' — ' + esc(why) : ''}</li>`); };
  for (const it of ITEMS) {
    const name = `${it.track.title} › ${it.title}`;
    try {
      if (it.kind === 'quiz') { rec(Array.isArray(it.options) && it.options.length >= 2 && it.answer >= 0 && it.answer < it.options.length && !!it.explain, name, 'quiz inválido'); continue; }
      if (it.kind === 'export') { rec(true, name); continue; }
      const db = buildDb(it, 'sol');
      if (it.kind === 'query') {
        const r = runOn(db, it.solution); db.close();
        rec(r.ok && r.rows.length > 0, name, r.ok ? 'gabarito retornou 0 linhas' : r.error);
      } else {
        db.exec(it.solution);
        const r = runOn(db, it.check); db.close();
        let why = r.ok ? (r.rows.length ? '' : 'verificação retornou 0 linhas') : r.error;
        if (!why && it.mustFail) for (const p of it.mustFail) {
          const d2 = buildDb(it, 'sol'); d2.exec(it.solution);
          let rej = false; try { d2.exec(p); } catch (e) { rej = true; } d2.close();
          if (!rej) { why = 'o gabarito aceita um comando que deveria ser rejeitado: ' + p; break; }
        }
        rec(!why, name, why);
      }
    } catch (e) { rec(false, name, String(e.message || e)); }
  }
  showPanel(`<header><div><h2>${badN ? `${badN} falha(s)` : 'Todos os <mark class="mk">gabaritos</mark> funcionam'}</h2><p class="lede">Autoteste</p></div></header>
    <p class="hint">Cada gabarito é executado no SQLite do navegador (projeto: em sequência). ${okN} ok · ${badN} com problema.</p>
    <ul class="test">${lines.join('')}</ul><div class="row"><button class="b" id="back">Voltar</button></div>`);
  $('back').onclick = renderDash;
}

/* ───────── Init ───────── */
if (typeof initSqlJs === 'undefined') {
  $('load').innerHTML = 'Não foi possível carregar o SQLite (verifique a conexão com a internet) e recarregue a página.';
} else {
  initSqlJs({locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}`}).then(SQL => {
    SQLJS = SQL;
    Store.init(SQL, Auth.current());               // histórico em SQL (db/schema.js)
    Auth.onChange(() => location.reload());        // trocou de usuário: recarrega com o progresso dele
    renderAccount(); hydrateIcons(document);
    cm =CodeMirror.fromTextArea($('editor'), {mode: 'text/x-sql', theme: 'material-darker', lineNumbers: true, matchBrackets: true,
      autoCloseBrackets: true, indentWithTabs: false, tabSize: 2, indentUnit: 2, lineWrapping: true,
      extraKeys: {'Ctrl-Enter': execute, 'Cmd-Enter': execute, Tab: c => c.execCommand('insertSoftTab')}});
    $('run').onclick = execute;
    cm.on('change', () => { if (passedNow) setPassed(false); });
    document.addEventListener('keydown', e => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter' || e.defaultPrevented) return;
      if (!$('panelView').classList.contains('hidden') || !cur) return;  // simulado/autoteste: ignora
      e.preventDefault();
      if (passedNow) goNext();
      else if (cur.kind === 'quiz') $('qans').click();
      else if (cur.kind === 'query' || cur.kind === 'script') execute();
    });
    $('hint').onclick = () => {
      const hs = cur.hints || []; if (!hs.length) { $('hints').innerHTML = '<div class="hint">Sem dicas para este item.</div>'; return; }
      const n = hintsShown[cur.id] = Math.min((hintsShown[cur.id] || 0) + 1, hs.length);
      $('hints').innerHTML = hs.slice(0, n).map(h => `<div class="hint">${ic('lightbulb', 13)} ${esc(h)}</div>`).join('');
    };
    $('sol').onclick = () => $('solbox').innerHTML = `<div class="sol">${esc(cur.solution)}</div>`;
    $('prev').onclick = () => go(ITEMS[ITEMS.indexOf(cur) - 1].id);
    $('next').onclick = () => go(ITEMS[ITEMS.indexOf(cur) + 1].id);
    $('examBtn').onclick = startExam;
    $('labBtn').onclick = renderLab;
    $('exportBtn').onclick = () => go(PROJECT.items[PROJECT.items.length - 1].id);
    $('roadmapBtn').onclick = renderDash; $('home').onclick = renderDash;
    $('reset').onclick = () => { if (confirm('Reiniciar todo o progresso (lições e projeto)?')) { state.completed = []; state.project = {}; state.stats = {attempts: {}, first: {}, days: {}}; for (const k in drafts) delete drafts[k]; Store.resetProgress(); save(); renderNav(); renderDash(); } };
    renderNav(); renderDash();   // tela inicial = roadmap
    const goto = new URLSearchParams(location.search).get('go');   // atalhos do PWA (?go=lab | ?go=exam)
    if (goto === 'lab') renderLab(); else if (goto === 'exam') startExam();
    $('load').remove();
  }).catch(e => { $('load').innerHTML = 'Falha ao iniciar o SQLite. Verifique a internet e recarregue.<br>' + esc(e); });
}
