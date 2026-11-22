/* Confere TODOS os exercícios do SQL Quest fora do navegador (mesma lógica do botão "Autoteste").
   Uso:   npm install --no-save sql.js@1.8.0   (uma vez, na raiz do projeto)
          node tests/run_gabaritos.mjs
   Ou aponte para outro sql.js:  SQLJS_PATH=/caminho/para/node_modules/sql.js node tests/run_gabaritos.mjs
   Verifica: ids únicos, gabaritos executando e retornando linhas, constraints (mustFail), quizzes válidos
   e se o enunciado de cada exercício tem solução que respeita as travas do sandbox (só SELECT/WITH em queries). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(process.cwd(), 'noop.js'));
const initSqlJs = require(process.env.SQLJS_PATH || 'sql.js');
const SQL = await initSqlJs();

const ctx = vm.createContext({console});
for (const f of ['content.js', 'content_sb.js', 'content_extra.js', 'roadmap.js'])
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, {filename: f});
const get = expr => vm.runInContext(expr, ctx);
const TRACKS = get('TRACKS'), SEEDS = get('SEEDS'), PHASES = get('PHASES');
const PROJECT = TRACKS.find(t => t.id === 'proj');

const FORBID = /\b(attach|detach|pragma|vacuum|load_extension|reindex)\b/i;
const clean = s => (s || '').trim().replace(/;+\s*$/, '').trim();
const newDb = seed => { const db = new SQL.Database(); db.exec('PRAGMA foreign_keys = ON;'); if (seed) db.exec(seed); return db; };
const run = (db, sql) => { const st = db.prepare(sql), rows = []; while (st.step()) rows.push(st.get()); st.free(); return rows; };
const buildDb = item => {
  if (!item.project) return newDb(SEEDS[item.dataset || 'vazio']);
  const db = newDb(''), idx = PROJECT.items.indexOf(item);
  for (let i = 0; i < idx; i++) if (PROJECT.items[i].kind === 'script') db.exec(PROJECT.items[i].solution);
  return db;
};

const items = TRACKS.flatMap(t => t.items.map(it => { it.track = t; return it; }));
const fails = [];
const bad = (it, why) => fails.push(`${it.track.title} › ${it.id}: ${why}`);

const seen = new Set();
for (const it of items) { if (seen.has(it.id)) bad(it, 'id duplicado'); seen.add(it.id); }

for (const it of items) {
  try {
    if (it.kind === 'quiz') {
      if (!(Array.isArray(it.options) && it.options.length >= 2 && it.answer >= 0 && it.answer < it.options.length && it.explain)) bad(it, 'quiz inválido');
      continue;
    }
    if (it.kind === 'export') continue;
    if (!it.challenge) bad(it, 'sem enunciado');
    if (!Array.isArray(it.hints) || !it.hints.length) bad(it, 'sem dicas');
    const db = buildDb(it);
    if (it.kind === 'query') {
      const sql = clean(it.solution);
      if (sql.includes(';') || !/^(select|with)\b/i.test(sql) || FORBID.test(sql)) bad(it, 'gabarito viola as travas do sandbox');
      const rows = run(db, sql);
      if (!rows.length) bad(it, 'gabarito retornou 0 linhas');
      db.close();
    } else {
      db.exec(it.solution);
      const rows = run(db, it.check);
      if (!rows.length) bad(it, 'verificação retornou 0 linhas');
      db.close();
      for (const probe of it.mustFail || []) {
        const d2 = buildDb(it); d2.exec(it.solution);
        let rejected = false; try { d2.exec(probe); } catch { rejected = true; } d2.close();
        if (!rejected) bad(it, `o gabarito aceita comando que deveria falhar: ${probe}`);
      }
      /* o estado inicial NÃO pode já satisfazer o desafio (senão o exercício é trivial) */
      const d3 = buildDb(it); let initial = null; try { initial = JSON.stringify(run(d3, it.check)); } catch { /* tabela ainda não existe: ok */ } d3.close();
      const d4 = buildDb(it); d4.exec(it.solution); const after = JSON.stringify(run(d4, it.check)); d4.close();
      if (initial !== null && initial === after) bad(it, 'o banco inicial já satisfaz a verificação (exercício trivial)');
    }
  } catch (e) { bad(it, String(e.message || e)); }
}

const total = items.length, byTrack = TRACKS.map(t => `${t.id}:${t.items.length}`).join(' ');
console.log(`Itens: ${total} | trilhas: ${byTrack}`);
console.log(`Fases: ${PHASES.map(p => `${p.n}=${p.tracks ? p.tracks.flatMap(t => t.items).length : p.lanes.flatMap(l => l.tracks).flatMap(t => t.items).length}`).join(' ')}`);
if (fails.length) { console.error(`\n${fails.length} problema(s):\n- ` + fails.join('\n- ')); process.exit(1); }
console.log('Todos os gabaritos funcionam.');
