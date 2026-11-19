/* ═══════════ Videoaulas do canal Hora de Codar (Matheus Battisti) ═══════════
   Cada entrada é 'ID@segundo_inicial|rótulo' — o vídeo abre direto no trecho do assunto
   (capítulos lidos da descrição dos próprios vídeos). O curso completo "SQL do básico ao
   avançado com MySQL e projeto" é pago (Udemy); aqui entram os vídeos GRATUITOS do canal.
   Postados em 2021–2022. Os vídeos recentes de outros canais ficam como complemento.      */

Object.assign(VMETA, {
  '4fIs_ZT4-3I': ['Aprenda SQL na prática — Fundamentos do banco de dados (SBD #01)', 'Hora de Codar', '2022-08-08', 80],
  'aYt6pKsBws8': ['SQL avançado — Subquery, Stored Procedure, Views, Trigger (SBD #02)', 'Hora de Codar', '2022-08-09', 51],
  'DFoRSgn9Y50': ['Design de banco de dados e modelagem de dados (SBD #03)', 'Hora de Codar', '2022-08-10', 54],
  'IvwhG7wvsvg': ['Aprenda JOIN em SQL — LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN', 'Hora de Codar', '2022-07-21', 35],
  'XQkf-6Yl3WM': ['Curso de SQL e MySQL fundamental — Aprenda SQL em 1 hora', 'Hora de Codar', '2021-04-27', 53]
});

const S1 = '4fIs_ZT4-3I', S2 = 'aYt6pKsBws8', S3 = 'DFoRSgn9Y50', JN = 'IvwhG7wvsvg';
const H = {
  select: `${S1}@1259|SELECT`, where: `${S1}@1493|WHERE`, order: `${S1}@1664|Ordenando registros (ORDER BY)`,
  arit: `${S1}@1769|Operações aritméticas e alias`, distinct: `${S1}@1982|DISTINCT`, cmp: `${S1}@2097|Operadores de comparação`,
  in: `${S1}@2598|Operador IN`, between: `${S1}@2706|Operador BETWEEN`, like: `${S1}@2864|Operador LIKE`,
  count: `${S1}@3240|Operador COUNT`, limit: `${S1}@3328|Operador LIMIT`, joins: `${S1}@3426|JOINs`,
  joinsAll: `${JN}|Todos os JOINs: LEFT, RIGHT, FULL OUTER`,
  constraints: `${S1}@4074|Principais constraints`, create: `${S1}@4215|Criando uma tabela`,
  insert: `${S1}@4335|Inserindo dados`, insertMany: `${S1}@4473|Inserindo múltiplos dados`,
  update: `${S1}@4520|Atualizando um dado`, del: `${S1}@4585|Deletando um dado`,
  minmax: `${S2}@393|Funções MIN e MAX`, avg: `${S2}@526|Função AVG`, groupby: `${S2}@793|GROUP BY`,
  subq: `${S2}@1026|Subqueries`, views: `${S2}@2219|Views`, drop: `${S2}@2554|Utilizando o DROP`,
  fk: `${S3}@1427|Chave estrangeira`, design: `${S3}@405|A importância do DB Design`
};

const trackOf = {};
TRACKS.forEach(t => t.items.forEach(i => { trackOf[i.id] = t.id; }));
const uniq = a => [...new Set(a)];
const prepend = (key, hc) => { ITEM_VIDEO[key] = uniq([...hc, ...(ITEM_VIDEO[key] || TRACK_VIDEO[trackOf[key]] || [])]).slice(0, 3); };

/* padrão por domínio */
Object.entries({basico: [H.select], intermediario: [H.joins], d1: [H.select], d2: [H.where], d4: [H.groupby],
  d5: [H.joins], d6: [H.subq], d8: [H.insert], d9: [H.constraints], proj: [H.design]})
  .forEach(([t, hc]) => { TRACK_VIDEO[t] = uniq([...hc, ...(TRACK_VIDEO[t] || [])]).slice(0, 3); });

/* por exercício / questão */
const HC_ITEMS = {
  'select-where': [H.select, H.where], 'order-limit': [H.order, H.limit], 'inner-join': [H.joins, H.joinsAll], 'group-by': [H.groupby],
  d1p1: [H.arit], d1p2: [H.distinct], d1q3: [H.distinct],
  d2p1: [H.between], d2p3: [H.like, H.in], d2p4: [H.limit], d2q3: [H.between],
  d4p1: [H.minmax], d4p2: [H.groupby], d4p3: [H.count], d4p4: [H.groupby], d4q1: [H.count], d4q2: [H.groupby],
  d5p1: [H.joins], d5p2: [H.joinsAll], d5p4: [H.joinsAll], d5q1: [H.joinsAll], d5q2: [H.joins], d5q3: [H.joinsAll],
  d6p1: [H.subq], d6p2: [H.subq], d6p3: [H.subq], d6p4: [H.subq], d6q1: [H.subq], d6q2: [H.subq], d6q3: [H.subq], d6q4: [H.subq],
  d8s1: [H.insert, H.insertMany], d8s2: [H.update], d8s3: [H.del], d8s4: [H.update], d8s5: [H.del, H.fk],
  d8q1: [H.del], d8q5: [H.update],
  d9s1: [H.create, H.constraints], d9s3: [H.views], d9s5: [H.constraints], d9q1: [H.create], d9q2: [H.constraints],
  d9q3: [H.fk], d9q5: [H.views], d9q6: [H.constraints],
  p01: [H.create, H.constraints], p02: [H.create, H.fk, H.constraints], p03: [H.create, H.constraints], p04: [H.create, H.fk],
  p05: [H.insertMany, H.insert], p06: [H.insertMany], p07: [H.insertMany], p08: [H.insertMany],
  p09: [H.joins], p10: [H.joins, H.where], p11: [H.groupby], p13: [H.update], p14: [H.del, H.fk], p15: [H.views], p18: [H.design]
};
Object.entries(HC_ITEMS).forEach(([k, hc]) => prepend(k, hc));

/* trilha estilo SQLBolt: vídeo por lição */
const HC_SB = {1: [H.select], 2: [H.where, H.between], 3: [H.like, H.in], 4: [H.order, H.distinct, H.limit], R: [H.where],
  6: [H.joins], 7: [H.joinsAll], 8: ['lkj06O-qle0'], 9: [H.arit], 10: [H.minmax, H.avg], 11: [H.groupby], 12: [H.groupby],
  13: [H.insert], 14: [H.update], 15: [H.del], 16: [H.create, H.constraints], 17: ['gw9xeuhFVak'], 18: [H.drop],
  Sub: [H.subq], Set: ['OzOEWYquyTk']};
SB.items.forEach(it => {
  const key = it.lesson !== undefined ? it.lesson : (it.id.match(/^sbq(\d+)$/) || [])[1];
  if (HC_SB[key]) ITEM_VIDEO[it.id] = HC_SB[key];
});
