/* ═══════════ Dashboard do roadmap (tela inicial) + auditoria de conteúdo ═══════════ */

const localISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') + 'min' : ''}` : `${m}min`;
const pctOf = (a, b) => b ? Math.round(a / b * 100) : 0;

function streakDays() {
  const days = state.stats.days, d = new Date();
  if (!days[localISO(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days[localISO(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function dashMetrics() {
  const done = ITEMS.filter(i => isDone(i.id));
  const att = state.stats.attempts, withAtt = done.filter(i => att[i.id]);
  const firstOk = withAtt.filter(i => state.stats.first[i.id]).length;
  const remaining = ITEMS.filter(i => !isDone(i.id)).reduce((s, i) => s + itemMin(i), 0);
  const certTracks = PHASES[PHASES.length - 1].lanes[0].tracks, certItems = certTracks.flatMap(t => t.items);
  const certPct = pctOf(certItems.filter(i => isDone(i.id)).length, certItems.length);
  const best = state.exams.length ? Math.max(...state.exams.map(e => Math.round(e.c / e.t * 100))) : null;
  return {done: done.length, total: ITEMS.length, pct: pctOf(done.length, ITEMS.length),
    acc: withAtt.length ? pctOf(firstOk, withAtt.length) : null, streak: streakDays(), remaining,
    certPct, best, readiness: best === null ? certPct : Math.round((certPct + best) / 2),
    next: ITEMS.find(i => !isDone(i.id) && !locked(i))};
}

const ring = (p, size = 64) => `<div class="ring" style="--p:${p};--s:${size}px"><span>${p}%</span></div>`;
const chip = (it, n) => `<button class="chip ${isDone(it.id) ? 'done' : locked(it) ? 'lock' : (cur && cur.id === it.id ? 'cur' : 'todo')}" data-id="${it.id}" title="${esc(it.title)}">${isDone(it.id) ? '✓' : it.kind === 'quiz' ? '?' : n}</button>`;

function trackRow(t) {
  const d = t.items.filter(i => isDone(i.id)).length;
  return `<div class="trow"><div class="tname"><span>${t.icon} ${esc(t.title)}</span><span class="n">${d}/${t.items.length}</span></div>
    <div class="bar sm"><i style="width:${pctOf(d, t.items.length)}%"></i></div>
    <div class="chips">${t.items.map((it, k) => chip(it, k + 1)).join('')}</div></div>`;
}

function phaseStats(items) {
  const q = items.filter(i => i.kind === 'quiz').length, e = items.length - q;
  const min = items.reduce((s, i) => s + (isDone(i.id) ? 0 : itemMin(i)), 0);
  return `<span>❓ ${q} questões</span><span>⌨️ ${e} práticos</span><span>⏱ ${min ? '~' + fmtMin(min) + ' restantes' : 'concluída'}</span>`;
}

function renderDash() {
  const m = dashMetrics();
  const activeIdx = PHASES.findIndex(p => phaseItems(p).some(i => !isDone(i.id)));
  const days = [...Array(14)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - (13 - k)); return {k: localISO(d), d: d.getDate(), n: state.stats.days[localISO(d)] || 0}; });
  const maxDay = Math.max(1, ...days.map(x => x.n));

  const phasesHtml = PHASES.map((p, idx) => {
    const items = phaseItems(p), d = items.filter(i => isDone(i.id)).length, pc = pctOf(d, items.length);
    const status = pc === 100 ? 'done' : idx === activeIdx ? 'active' : 'next';
    let body;
    if (p.final) {
      const certTracks = p.lanes[0].tracks, projTracks = p.lanes[1].tracks;
      body = `<div class="lanes">
        <div class="lane cert"><h4>${p.lanes[0].icon} ${esc(p.lanes[0].title)}</h4>
          <div class="gauge"><div><b>${m.readiness}%</b><small>prontidão</small></div><div class="hint">${m.best === null ? 'Faça um simulado para completar o indicador.' : `Melhor simulado: <b>${m.best}%</b> · conteúdo: ${m.certPct}%`}</div></div>
          <div class="doms">${certTracks.map(t => { const dd = t.items.filter(i => isDone(i.id)).length; return `<div class="dom-row"><span>${t.icon} ${esc(t.title)}</span><div class="bar sm"><i style="width:${pctOf(dd, t.items.length)}%"></i></div><span class="n">${dd}/${t.items.length}</span></div>`; }).join('')}</div>
          <div class="row" style="margin-top:10px"><button class="b p sm" id="simBtn2">📝 Fazer simulado</button></div>
          <details class="s"><summary>Todos os exercícios da certificação</summary>${certTracks.map(trackRow).join('')}</details></div>
        <div class="lane proj"><h4>${p.lanes[1].icon} ${esc(p.lanes[1].title)}</h4>
          ${projTracks.map(trackRow).join('')}
          <div class="row" style="margin-top:10px"><button class="b sm" id="expBtn2">📦 Exportar projeto</button></div></div></div>`;
    } else body = p.tracks.map(trackRow).join('');
    return `<section class="phase ${status} ${p.final ? 'final' : ''}"><div class="node">${status === 'done' ? '✓' : p.n}</div>
      <div class="phbody"><div class="phhead"><div><h3>${p.icon} Fase ${p.n} · ${esc(p.title)}${status === 'active' ? ' <span class="here">você está aqui</span>' : ''}</h3><p class="goal">${esc(p.goal)}</p>
      <div class="meta">${phaseStats(items)}</div></div>${ring(pc)}</div>${body}</div></section>`;
  }).join('');

  showPanel(`<header><div><small>🗺️ Roadmap de estudos</small><h2>Do SELECT à certificação</h2></div></header>
    <div class="kpis">
      <div class="kpi">${ring(m.pct, 56)}<div><b>${m.done}/${m.total}</b><small>itens concluídos</small></div></div>
      <div class="kpi"><div class="ico">🎯</div><div><b>${m.acc === null ? '—' : m.acc + '%'}</b><small>acertos de primeira</small></div></div>
      <div class="kpi"><div class="ico">🔥</div><div><b>${m.streak} dia${m.streak === 1 ? '' : 's'}</b><small>sequência de estudo</small></div></div>
      <div class="kpi"><div class="ico">⏱</div><div><b>${m.remaining ? '~' + fmtMin(m.remaining) : '0'}</b><small>tempo restante est.</small></div></div>
      <div class="kpi"><div class="ico">🎓</div><div><b>${m.readiness}%</b><small>prontidão p/ certificação</small></div></div>
      <div class="kpi"><div class="ico">📝</div><div><b>${state.exams.length}</b><small>simulados${m.best === null ? '' : ' · melhor ' + m.best + '%'}</small></div></div>
    </div>
    <div class="dashrow">
      <div class="card next"><small>Próximo passo</small>${m.next ? `<h3>${esc(m.next.title)}</h3><div class="hint">${m.next.track.icon} ${esc(m.next.track.title)} · Fase ${PHASE_OF[m.next.track.id].n}</div><div class="row" style="margin-top:10px"><button class="b p" id="goNext2">${m.done ? '▶ Continuar' : '▶ Começar'}</button></div>` : '<h3>Tudo concluído 🎉</h3>'}</div>
      <div class="card"><small>Itens concluídos nos últimos 14 dias</small><div class="act">${days.map(x => `<div class="col" title="${x.k}: ${x.n}"><i style="height:${Math.max(x.n ? 8 : 2, x.n / maxDay * 100)}%" class="${x.n ? 'on' : ''}"></i><span>${x.d}</span></div>`).join('')}</div></div>
    </div>
    <div class="road">${phasesHtml}</div>
    <details class="audit"><summary>🔍 Auditoria do conteúdo</summary><div id="auditBody"></div></details>
    <p class="foot">Trilha prática inspirada na estrutura do <a href="https://sqlbolt.com" target="_blank" rel="noopener noreferrer">SQLBolt</a> (exercícios originais). Videoaulas de terceiros: canal Hora de Codar e outros, com data de postagem em cada cartão.</p>`);

  document.querySelectorAll('#panelView .chip').forEach(b => b.onclick = () => go(b.dataset.id));
  if ($('goNext2')) $('goNext2').onclick = () => go(m.next.id);
  $('simBtn2').onclick = startExam;
  $('expBtn2').onclick = () => go(PROJECT.items[PROJECT.items.length - 1].id);
  document.querySelector('.audit').ontoggle = e => { if (e.target.open) renderAudit(); };
}

/* ───────── Auditoria: cobertura, repetição intencional, integridade ───────── */
function renderAudit() {
  const hasVideo = i => (ITEM_VIDEO[i.id] || TRACK_VIDEO[i.track.id] || []).length > 0;
  const hasHow = i => i.kind === 'quiz' || i.kind === 'export' || !!(EXPLAIN[i.id] || i.how);
  const noHow = ITEMS.filter(i => !hasHow(i)), noVid = ITEMS.filter(i => !hasVideo(i));
  const byKind = k => ITEMS.filter(i => (k === 'proj' ? i.project : !i.project && i.kind === k)).length;
  /* temas repetidos = mesmo trecho de vídeo principal */
  const topics = {};
  ITEMS.forEach(i => { const v = (ITEM_VIDEO[i.id] || TRACK_VIDEO[i.track.id] || [])[0]; if (!v) return; const vid = v.split('|')[0].split('@')[0]; (topics[vid] = topics[vid] || []).push(i); });
  const rep = Object.entries(topics).filter(([, a]) => a.length > 1).sort((a, b) => b[1].length - a[1].length);
  const sols = {};
  ITEMS.filter(i => i.solution).forEach(i => { const k = i.solution.toLowerCase().replace(/\s+/g, ' ').trim(); (sols[k] = sols[k] || []).push(i.title); });
  const dupSol = Object.values(sols).filter(a => a.length > 1);
  $('auditBody').innerHTML = `<div class="audgrid">
    <div class="card"><small>Inventário</small><p><b>${ITEMS.length}</b> itens · ${byKind('quiz')} questões · ${byKind('query')} consultas · ${byKind('script')} scripts DDL/DML · ${byKind('proj')} etapas de projeto</p></div>
    <div class="card"><small>Cobertura</small><p>Explicação passo a passo: <b>${pctOf(ITEMS.length - noHow.length, ITEMS.length)}%</b><br>Videoaula: <b>${pctOf(ITEMS.length - noVid.length, ITEMS.length)}%</b></p></div>
    <div class="card"><small>Repetição intencional</small><p><b>${rep.length}</b> temas aparecem em mais de um exercício (ex.: JOIN, GROUP BY, DML, DDL) para fixar o conteúdo. Gabaritos idênticos: <b>${dupSol.length}</b>.</p></div></div>
    ${noHow.length ? `<p class="hint">Sem explicação: ${noHow.map(i => esc(i.title)).join(' · ')}</p>` : ''}
    ${noVid.length ? `<p class="hint">Sem videoaula: ${noVid.map(i => esc(i.title)).join(' · ')}</p>` : ''}
    <details class="s"><summary>Temas repetidos (mesmo trecho de vídeo)</summary><ul class="test">${rep.map(([id, a]) => `<li>${esc(VMETA[id][0])} — ${a.length} itens</li>`).join('')}</ul></details>
    <div class="row" style="margin-top:10px"><button class="b" id="runTest">🧪 Verificar todos os gabaritos no SQLite</button></div>`;
  $('runTest').onclick = selfTest;
}
