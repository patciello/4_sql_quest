'use strict';
/* SQL Quest — histórico de métricas e progresso em SQL (ESQUELETO).
   Um banco SQLite (sql.js) com o esquema de db/schema.js, guardado no localStorage deste navegador.
   O estado do app (`sqlquest2`) continua sendo a fonte da interface; este banco é o REGISTRO HISTÓRICO
   (tentativas, conclusões, simulados) que permite consultas por SQL. Toda função é defensiva:
   se algo falhar, o app segue funcionando e só o histórico deixa de ser gravado. */

const STORE_KEY = 'sqlquest_db';

const Store = (() => {
  let db = null, uid = 'guest', timer = null;

  const toB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const now = () => new Date().toISOString();

  function persist() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, toB64(db.export()));
        db.exec('PRAGMA foreign_keys = ON;');   // sql.js zera o PRAGMA ao exportar
      } catch (e) { /* cota cheia ou storage bloqueado */ }
    }, 400);
  }
  const safe = fn => { if (!db) return null; try { return fn(); } catch (e) { console.warn('Store:', e); return null; } };

  return {
    /* Abre (ou cria) o banco local e registra o usuário atual. */
    init(SQL, user) {
      try {
        let saved = null; try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* sem storage */ }
        try { db = saved ? new SQL.Database(fromB64(saved)) : new SQL.Database(); }
        catch (e) { db = new SQL.Database(); }   // banco salvo corrompido: recomeça
        db.exec(SCHEMA_SQL);
        uid = user.id;
        db.run(`INSERT INTO users (id, provider, email, display_name) VALUES (?, ?, ?, ?)
                ON CONFLICT (id) DO UPDATE SET last_login_at = ?, display_name = excluded.display_name`,
          [user.id, user.provider, user.email || null, user.name || user.id, now()]);
        persist();
      } catch (e) { console.warn('Store.init:', e); db = null; }
    },

    recordAttempt(itemId, passed, sqlText) {
      safe(() => { db.run('INSERT INTO attempts (user_id, item_id, attempted_at, passed, sql_text) VALUES (?, ?, ?, ?, ?)',
        [uid, itemId, now(), passed ? 1 : 0, sqlText ? String(sqlText).slice(0, 4000) : null]); persist(); });
    },

    recordCompletion(itemId, firstTry, projectSql) {
      safe(() => { db.run(`INSERT OR IGNORE INTO progress (user_id, item_id, completed_at, attempts, first_try, project_sql)
          VALUES (?, ?, ?, MAX(1, (SELECT COUNT(*) FROM attempts WHERE user_id = ? AND item_id = ?)), ?, ?)`,
        [uid, itemId, now(), uid, itemId, firstTry ? 1 : 0, projectSql || null]); persist(); });
    },

    recordExam(correct, total, durationS) {
      safe(() => { db.run('INSERT INTO exams (user_id, taken_at, correct, total, duration_s) VALUES (?, ?, ?, ?, ?)',
        [uid, now(), correct, total, durationS]); persist(); });
    },

    /* Espelha "Reiniciar progresso" do app: apaga conclusões e tentativas; os simulados ficam. */
    resetProgress() {
      safe(() => { db.run('DELETE FROM progress WHERE user_id = ?', [uid]); db.run('DELETE FROM attempts WHERE user_id = ?', [uid]); persist(); });
    },

    /* Consulta livre (somente leitura na prática) → array de objetos. Ex.: Store.query('SELECT * FROM v_user_metrics'). */
    query(sql, params = []) {
      return safe(() => { const st = db.prepare(sql, params), rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; }) || [];
    }
  };
})();

/* TODO (sincronização com servidor): enviar eventos novos ao backend e baixar o histórico ao entrar.
   Ideia: fila local de eventos {type, payload, at} → POST em lote para `${AUTH_CONFIG.apiBase}/sync`
   (com a sessão do usuário) e mesclagem por (user_id, item_id) mantendo o `completed_at` mais antigo. */
