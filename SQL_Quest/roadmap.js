/* ═══════════ Roadmap: reorganiza todo o conteúdo em 5 fases ═══════════
   Exercícios de temas parecidos aparecem em mais de uma fase DE PROPÓSITO (repetição espaçada).
   A ÚLTIMA fase reúne a Certificação Oracle (1Z0-071) e o Projeto real BiblioTech.             */

const KIND_MIN = {quiz: 2, query: 6, script: 8, export: 5};
const itemMin = it => it.project && it.kind !== 'export' ? 10 : (KIND_MIN[it.kind] || 6);

const PHASES = [];
const PHASE_OF = {};          // id da trilha → fase
const phaseTracks = p => p.lanes ? p.lanes.flatMap(l => l.tracks) : p.tracks;
const phaseItems = p => phaseTracks(p).flatMap(t => t.items);

(function buildRoadmap() {
  const by = {}; TRACKS.forEach(t => { by[t.id] = t; });
  const sb = by.sb;
  const lessonOf = it => it.lesson !== undefined ? String(it.lesson) : ((it.id.match(/^sbq(\d+)$/) || [])[1]);
  const split = (id, title, icon, lessons) => ({id, group: 'Trilha prática', icon, title, tables: sb.tables, items: sb.items.filter(it => lessons.includes(lessonOf(it)))});
  const sba = split('sba', 'Consultas básicas', '🎬', ['1', '2', '3', '4', 'R']);
  const sbb = split('sbb', 'Junções, NULLs e agregações', '🎬', ['6', '7', '8', '9', '10', '11', '12']);
  const sbc = split('sbc', 'Alterando dados e estruturas', '🎬', ['13', '14', '15', '16', '17', '18']);
  const sbd = split('sbd', 'Subqueries e conjuntos', '🎬', ['Sub', 'Set']);
  by.basico.title = 'Guiado: SELECT, WHERE, ORDER BY';
  by.intermediario.title = 'Guiado: JOIN e GROUP BY';
  by.avancado.title = 'Guiado: Window Functions';
  const dts = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'].map(k => by[k]);
  by.proj.title = 'BiblioTech (18 etapas)';

  PHASES.push(
    {id: 'f1', n: 1, icon: '🌱', title: 'Fundamentos', goal: 'Ler dados de uma tabela: SELECT, WHERE, ordenação e limites.', tracks: [by.basico, sba]},
    {id: 'f2', n: 2, icon: '🔗', title: 'Juntar e resumir', goal: 'JOINs, NULLs, expressões, GROUP BY e HAVING.', tracks: [by.intermediario, sbb]},
    {id: 'f3', n: 3, icon: '✏️', title: 'Alterar dados e estruturas', goal: 'INSERT, UPDATE, DELETE, CREATE, ALTER e DROP.', tracks: [sbc]},
    {id: 'f4', n: 4, icon: '🚀', title: 'SQL avançado', goal: 'Window functions, subqueries e operadores de conjunto.', tracks: [by.avancado, sbd]},
    {id: 'f5', n: 5, icon: '🏆', title: 'Certificação Oracle + Projeto real', final: true,
     goal: 'Domínios do exame Oracle SQL (1Z0-071) com simulado, e o projeto BiblioTech — do esquema à entrega de um banco real exportável.',
     lanes: [{id: 'cert', icon: '🎓', title: 'Certificação Oracle SQL (1Z0-071)', tracks: dts}, {id: 'proj', icon: '📚', title: 'Projeto real: BiblioTech', tracks: [by.proj]}]}
  );
  PHASES.forEach(p => phaseTracks(p).forEach(t => { PHASE_OF[t.id] = p; }));

  /* a ordem de TRACKS (e portanto de ITEMS) passa a ser a do roadmap */
  const ordered = PHASES.flatMap(phaseTracks);
  TRACKS.length = 0; ordered.forEach(t => TRACKS.push(t));
  sb.intro = '';
})();
