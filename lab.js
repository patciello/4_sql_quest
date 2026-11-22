'use strict';
/* ═══════════ Lab visual — o SQL passo a passo, em tabelas pequenas ═══════════
   Painel independente dos exercícios: o aluno avança pelas etapas de uma consulta
   (FROM → JOIN → WHERE → GROUP BY → SELECT) e vê quais linhas sobram em cada uma.
   Os dados abaixo são só do lab (não usam o SQLite). Cada lição aponta para um exercício real
   ("Praticar este tema"). Para criar uma lição, acrescente um objeto em LAB_LESSONS. */

const LAB_CLI = {h: ['id', 'nome', 'cidade'], r: [[1, 'Ana', 'Valença'], [2, 'Bruno', 'Barra'], [3, 'Carla', 'Valença'], [4, 'Diego', 'Volta Redonda']]};
const LAB_PED = {h: ['id', 'cliente_id', 'status', 'valor'], r: [[101, 1, 'entregue', 50], [102, 2, 'pendente', 30], [103, 1, 'entregue', 80], [104, 3, 'entregue', 20], [105, 2, 'entregue', 40]]};
const LAB_J = {h: ['p.id', 'p.status', 'c.nome'], r: [[101, 'entregue', 'Ana'], [102, 'pendente', 'Bruno'], [103, 'entregue', 'Ana'], [104, 'entregue', 'Carla'], [105, 'entregue', 'Bruno']]};
const LAB_J3 = {h: ['p.id', 'c.nome', 'p.valor'], r: [[101, 'Ana', 50], [102, 'Bruno', 30], [103, 'Ana', 80], [104, 'Carla', 20], [105, 'Bruno', 40]]};
const LAB_LJ = {h: ['c.nome', 'p.id'], r: [['Ana', 101], ['Ana', 103], ['Bruno', 102], ['Bruno', 105], ['Carla', 104], ['Diego', 'NULL']]};
const LAB_PED_ORD = {h: LAB_PED.h, r: [LAB_PED.r[2], LAB_PED.r[0], LAB_PED.r[4], LAB_PED.r[1], LAB_PED.r[3]]};
const LAB_SOMA = {h: ['nome', 'total'], r: [['Ana', 130], ['Bruno', 70], ['Carla', 20]]};
const LAB_RES = 'Resultado';
const LK = 'k', LD = 'd', LW = 'w';          // mantida · removida · atenção

const LAB_LESSONS = [
  {n: 'SELECT', practice: 'xa01', sql: ['SELECT nome, cidade', 'FROM clientes;'], steps: [
    {c: 1, ti: 'FROM', t: 'Escolhe a tabela de onde vêm os dados.', tabs: [{l: 'clientes', T: LAB_CLI, s: [LK, LK, LK, LK]}]},
    {c: 0, ti: 'SELECT', t: 'Escolhe as colunas. Só nome e cidade ficam; o id sai.', tabs: [{l: 'clientes', T: LAB_CLI, hc: [1, 2]}, {l: LAB_RES, T: {h: ['nome', 'cidade'], r: LAB_CLI.r.map(r => [r[1], r[2]])}}]}]},
  {n: 'WHERE', practice: 'xa02', sql: ['SELECT id, valor', 'FROM pedidos', "WHERE status = 'entregue';"], steps: [
    {c: 1, ti: 'FROM', t: 'Começa com os 5 pedidos.', tabs: [{l: 'pedidos', T: LAB_PED, s: [LK, LK, LK, LK, LK]}]},
    {c: 2, ti: 'WHERE', t: 'Filtra linhas. O pedido 102 está pendente, então sai.', tabs: [{l: 'pedidos', T: LAB_PED, s: [LK, LD, LK, LK, LK], hc: [2]}]},
    {c: 0, ti: 'SELECT', t: 'Das linhas que sobraram, mostra só id e valor.', tabs: [{l: 'pedidos', T: LAB_PED, s: [LK, LD, LK, LK, LK], hc: [0, 3]}, {l: LAB_RES, T: {h: ['id', 'valor'], r: [[101, 50], [103, 80], [104, 20], [105, 40]]}}]}]},
  {n: 'JOIN', practice: 'xb02', sql: ['SELECT p.id, c.nome', 'FROM pedidos p', 'JOIN clientes c ON c.id = p.cliente_id', "WHERE p.status = 'entregue';"], steps: [
    {c: 1, ti: 'FROM', t: 'Começa em pedidos. Cada pedido guarda só o cliente_id, não o nome.', tabs: [{l: 'pedidos', T: LAB_PED, hc: [1]}]},
    {c: 2, ti: 'JOIN', t: 'Liga pedidos.cliente_id a clientes.id. Cada pedido ganha o nome do cliente.', tabs: [{l: 'clientes', T: LAB_CLI, hc: [0]}, {l: 'Tabela combinada (temporária)', T: LAB_J}]},
    {c: 3, ti: 'WHERE', t: 'Filtra a tabela combinada. O pedido 102 sai.', tabs: [{l: 'Tabela combinada', T: LAB_J, s: [LK, LD, LK, LK, LK], hc: [1]}]},
    {c: 0, ti: 'SELECT', t: 'Mantém p.id e c.nome. A Ana aparece 2 vezes: o resultado tem uma linha por pedido.', tabs: [{l: LAB_RES, T: {h: ['pedido_id', 'cliente'], r: [[101, 'Ana'], [103, 'Ana'], [104, 'Carla'], [105, 'Bruno']]}}]}]},
  {n: 'GROUP BY', practice: 'xb05', sql: ['SELECT c.nome, COUNT(*) AS total', 'FROM pedidos p', 'JOIN clientes c ON c.id = p.cliente_id', 'GROUP BY c.nome;'], steps: [
    {c: 2, ti: 'FROM + JOIN', t: 'O mesmo JOIN de antes: cada pedido ganha o nome do cliente.', tabs: [{l: 'Tabela combinada', T: LAB_J}]},
    {c: 3, ti: 'GROUP BY', t: 'Linhas com o mesmo nome vão para o mesmo grupo (mesma cor).', tabs: [{l: 'Grupos', T: LAB_J, s: ['g1', 'g2', 'g1', 'g3', 'g2'], hc: [2]}]},
    {c: 0, ti: 'SELECT', t: 'COUNT(*) conta as linhas de cada grupo. Sai uma linha por grupo.', tabs: [{l: LAB_RES, T: {h: ['nome', 'total'], r: [['Ana', 2], ['Bruno', 2], ['Carla', 1]]}, s: ['g1', 'g2', 'g3']}]}]},
  {n: 'LEFT JOIN', practice: 'xb03', sql: ['SELECT c.nome', 'FROM clientes c', 'LEFT JOIN pedidos p ON p.cliente_id = c.id', 'WHERE p.id IS NULL;'], steps: [
    {c: 1, ti: 'FROM', t: 'Começa com TODOS os clientes, inclusive o Diego.', tabs: [{l: 'clientes', T: LAB_CLI, s: [LK, LK, LK, LK]}]},
    {c: 2, ti: 'LEFT JOIN', t: 'Mantém todos os clientes. Quem não tem pedido fica com NULL. Num INNER JOIN, o Diego sumiria aqui.', tabs: [{l: 'Tabela combinada', T: LAB_LJ, s: [0, 0, 0, 0, 0, LW], hc: [1]}]},
    {c: 3, ti: 'WHERE', t: 'IS NULL acha as linhas sem par. Só o Diego não casou com nenhum pedido.', tabs: [{l: 'Tabela combinada', T: LAB_LJ, s: [LD, LD, LD, LD, LD, LK], hc: [1]}]},
    {c: 0, ti: 'SELECT', t: 'Receita clássica: "quais clientes nunca compraram?".', tabs: [{l: LAB_RES, T: {h: ['nome'], r: [['Diego']]}}]}]},
  {n: 'ORDER BY', practice: 'xa15', sql: ['SELECT id, valor', 'FROM pedidos', 'ORDER BY valor DESC', 'LIMIT 3;'], steps: [
    {c: 1, ti: 'FROM', t: 'Os 5 pedidos, na ordem em que foram salvos.', tabs: [{l: 'pedidos', T: LAB_PED, s: [LK, LK, LK, LK, LK]}]},
    {c: 2, ti: 'ORDER BY', t: 'Ordena por valor, do maior para o menor (DESC). ASC seria o contrário.', tabs: [{l: 'pedidos ordenado', T: LAB_PED_ORD, hc: [3]}]},
    {c: 3, ti: 'LIMIT', t: 'Mantém só as 3 primeiras linhas. As outras 2 saem.', tabs: [{l: 'pedidos ordenado', T: LAB_PED_ORD, s: [LK, LK, LK, LD, LD], hc: [3]}]},
    {c: 0, ti: 'SELECT', t: 'Os 3 maiores pedidos.', tabs: [{l: LAB_RES, T: {h: ['id', 'valor'], r: [[103, 80], [101, 50], [105, 40]]}}]}]},
  {n: 'SUM e AVG', practice: 'xb06', sql: ['SELECT SUM(valor) AS total,', '       AVG(valor) AS media', 'FROM pedidos', "WHERE status = 'entregue';"], steps: [
    {c: 2, ti: 'FROM', t: 'Começa com todos os pedidos.', tabs: [{l: 'pedidos', T: LAB_PED, s: [LK, LK, LK, LK, LK]}]},
    {c: 3, ti: 'WHERE', t: 'Só os pedidos entregues entram na conta.', tabs: [{l: 'pedidos', T: LAB_PED, s: [LK, LD, LK, LK, LK], hc: [2]}]},
    {c: 0, ti: 'SUM e AVG', t: '50 + 80 + 20 + 40 = 190, e 190 ÷ 4 = 47,5. Sem GROUP BY, tudo vira uma linha só.', tabs: [{l: 'valores que entraram', T: {h: ['valor'], r: [[50], [80], [20], [40]]}, s: [LK, LK, LK, LK]}, {l: LAB_RES, T: {h: ['total', 'media'], r: [[190, 47.5]]}}]}]},
  {n: 'HAVING', practice: 'xb07', sql: ['SELECT c.nome, SUM(p.valor) AS total', 'FROM pedidos p', 'JOIN clientes c ON c.id = p.cliente_id', 'GROUP BY c.nome', 'HAVING SUM(p.valor) > 70;'], steps: [
    {c: 2, ti: 'JOIN', t: 'Cada pedido ganha o nome do cliente.', tabs: [{l: 'Tabela combinada', T: LAB_J3}]},
    {c: 3, ti: 'GROUP BY', t: 'Mesmo nome, mesmo grupo (mesma cor).', tabs: [{l: 'Grupos', T: LAB_J3, s: ['g1', 'g2', 'g1', 'g3', 'g2'], hc: [1]}]},
    {c: 0, ti: 'SUM por grupo', t: 'Cada grupo vira uma linha com a soma.', tabs: [{l: 'Soma por grupo', T: LAB_SOMA, s: ['g1', 'g2', 'g3']}]},
    {c: 4, ti: 'HAVING', t: 'HAVING filtra grupos; WHERE filtra linhas. O Bruno tem exatamente 70, e 70 não é maior que 70.', tabs: [{l: 'Soma por grupo', T: LAB_SOMA, s: [LK, LD, LD], hc: [1]}]},
    {c: 0, ti: 'Final', t: 'Só quem passou pelo filtro.', tabs: [{l: LAB_RES, T: {h: ['nome', 'total'], r: [['Ana', 130]]}}]}]},
  {n: 'UPDATE', practice: 'xc03', sql: ['UPDATE pedidos', "SET status = 'entregue'", 'WHERE id = 102;'], steps: [
    {c: 2, ti: 'WHERE', t: 'Primeiro acha a linha alvo: id = 102.', tabs: [{l: 'pedidos', T: LAB_PED, s: [0, LK, 0, 0, 0], hc: [0]}]},
    {c: 1, ti: 'SET', t: 'Troca a coluna só nessa linha.', tabs: [{l: 'pedidos depois', T: {h: LAB_PED.h, r: LAB_PED.r.map(r => r[0] === 102 ? [102, 2, 'entregue', 30] : r)}, s: [0, LK, 0, 0, 0], hc: [2]}]},
    {c: -1, ti: 'Cuidado', t: 'Sem WHERE, TODAS as linhas mudam.', tabs: [{l: 'Sem WHERE', T: {h: LAB_PED.h, r: LAB_PED.r.map(r => [r[0], r[1], 'entregue', r[3]])}, s: [LW, LW, LW, LW, LW], hc: [2]}]}]},
  {n: 'DELETE', practice: 'xc05', sql: ['DELETE FROM pedidos', "WHERE status = 'pendente';"], steps: [
    {c: 1, ti: 'WHERE', t: 'Acha as linhas a remover. Só o 102 está pendente.', tabs: [{l: 'pedidos', T: LAB_PED, s: [0, LK, 0, 0, 0], hc: [2]}]},
    {c: 0, ti: 'DELETE', t: 'A linha é removida de vez da tabela.', tabs: [{l: 'pedidos', T: LAB_PED, s: [0, LD, 0, 0, 0]}]},
    {c: -1, ti: 'Dica', t: "Antes de apagar, rode SELECT * FROM pedidos WHERE status = 'pendente' para conferir. Sem WHERE, apaga tudo.", tabs: [{l: 'pedidos agora', T: {h: LAB_PED.h, r: LAB_PED.r.filter(r => r[0] !== 102)}}]}]}
];

const labState = {li: 0, si: 0};
const LAB_BG = {k: 'lab-k', w: 'lab-w', g1: 'lab-g1', g2: 'lab-g2', g3: 'lab-g3'};

function labTable(T, s, hc) {
  return '<div class="res"><table><thead><tr>' + T.h.map(x => `<th>${esc(x)}</th>`).join('') + '</tr></thead><tbody>' +
    T.r.map((r, i) => {
      const st = s && s[i], cls = st === LD ? 'lab-d' : (LAB_BG[st] || '');
      return `<tr class="${cls}">` + r.map((v, j) => `<td class="${hc && hc.includes(j) ? 'lab-hc' : ''}${v === 'NULL' ? ' n' : ''}">${esc(v)}</td>`).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
}

function labDraw() {
  const les = LAB_LESSONS[labState.li], st = les.steps[labState.si], last = labState.si === les.steps.length - 1;
  $('labLessons').innerHTML = LAB_LESSONS.map((l, i) => `<button class="lab-chip ${i === labState.li ? 'on' : ''}" data-i="${i}" aria-pressed="${i === labState.li}">${esc(l.n)}</button>`).join('');
  $('labLessons').querySelectorAll('button').forEach(b => b.onclick = () => { labState.li = +b.dataset.i; labState.si = 0; labDraw(); });
  $('labSql').innerHTML = les.sql.map((x, i) => `<div class="${i === st.c ? 'a' : ''}">${esc(x)}</div>`).join('');
  $('labCtr').textContent = `Etapa ${labState.si + 1} de ${les.steps.length}`;
  $('labTi').textContent = st.ti;
  $('labTxt').textContent = st.t;
  $('labTabs').innerHTML = st.tabs.map(t => `<div class="lab-cap">${esc(t.l)}</div>` + labTable(t.T, t.s, t.hc)).join('');
  $('labPrev').disabled = labState.si === 0;
  $('labNext').innerHTML = last ? 'Recomeçar' : `Próxima ${ic('arrow-right', 16)}`;
  $('labGo').onclick = () => go(les.practice);
}

function labStep(d) {
  const n = LAB_LESSONS[labState.li].steps.length;
  labState.si = d > 0 ? (labState.si === n - 1 ? 0 : labState.si + 1) : Math.max(0, labState.si - 1);
  labDraw();
}

function renderLab() {
  showPanel(`<header><div><h2>Lab <mark class="mk">visual</mark></h2><p class="lede">Veja uma consulta rodar etapa por etapa, em tabelas pequenas. Depois pratique o mesmo tema no editor.</p></div></header>
    <div class="lab" id="lab">
      <div class="lab-chips" id="labLessons" role="group" aria-label="Lições do lab"></div>
      <div class="lab-sql" id="labSql" aria-label="Consulta SQL"></div>
      <div class="lab-head"><span class="hint" id="labCtr"></span><b id="labTi"></b></div>
      <p class="lab-txt" id="labTxt" aria-live="polite"></p>
      <div id="labTabs"></div>
      <div class="row lab-nav">
        <button class="b" id="labPrev">${ic('arrow-left', 16)} Voltar</button>
        <button class="b p" id="labNext"></button>
      </div>
      <div class="hint lab-legend">Verde = linha mantida · riscado = removida · amarelo = atenção · lima = coluna em uso · setas ← → avançam</div>
      <div class="row"><button class="b" id="labGo">Praticar este tema</button></div>
    </div>`);
  $('labPrev').onclick = () => labStep(-1);
  $('labNext').onclick = () => labStep(1);
  labDraw();
}

/* atalhos ← → só enquanto o lab está na tela */
document.addEventListener('keydown', e => {
  if (!document.getElementById('lab') || $('panelView').classList.contains('hidden')) return;
  if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); labStep(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); labStep(-1); }
});
