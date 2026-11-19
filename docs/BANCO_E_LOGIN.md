# Login e banco de métricas (esqueleto)

O app continua sendo um site estático: abre com duplo clique, sem servidor. Estes dois esqueletos já têm a forma final; falta só ligar um backend.

## Arquivos

| Arquivo | Papel |
|---|---|
| `auth.js` | `Auth`: sessão, e-mail + senha e Google. Hoje em modo **demonstração** (`AUTH_CONFIG.mode = 'local'`). |
| `login.js` | Cartão da conta na barra lateral e tela de login. |
| `db/schema.sql` | Esquema SQL (fonte única): `users`, `progress`, `attempts`, `exams`, `exam_answers` + views `v_daily_activity` e `v_user_metrics`. |
| `db/schema.js` | Cópia de `schema.sql` como string JS (o navegador não lê `.sql` em `file://`). **Gerado**, não edite. |
| `storage.js` | `Store`: abre o esquema num SQLite (sql.js) guardado no `localStorage` e registra tentativas, conclusões e simulados. |

Ordem de carga em `index.html`: `auth.js` → `db/schema.js` → `storage.js` → conteúdo → `dashboard.js` → `login.js` → `app.js`.

## O que funciona hoje

- Progresso separado por usuário: convidado usa `sqlquest2`; quem entra usa `sqlquest2:<id>`.
- Cada execução/resposta vira uma linha em `attempts`; a primeira conclusão de um item vira uma linha em `progress`; cada simulado vira uma linha em `exams`.
- Consultas no console do navegador: `Store.query('SELECT * FROM v_user_metrics')`.

## O que é de mentira (leia antes de confiar)

- **A senha não é verificada nem guardada.** Qualquer e-mail válido entra; o `id` do usuário é um hash do e-mail.
- **Google não está ligado.** O botão mostra um aviso até existir `googleClientId` e um backend que valide o token.
- Tudo fica só neste navegador; limpar os dados do site apaga o histórico.

## Como ligar um backend

1. `auth.js`: defina `AUTH_CONFIG.mode = 'remote'` e `apiBase`; implemente os `TODO` de `signInWithEmail` e `signInWithGoogle` (o backend valida senha e token; sessão em cookie `HttpOnly` sobre HTTPS).
2. `storage.js`: implemente a sincronização do `TODO` no fim do arquivo (fila de eventos → `POST /sync`).
3. Servidor: aplique `db/schema.sql` (notas de PostgreSQL no topo do arquivo).

## Alterar o esquema

Edite `db/schema.sql`, aumente `schema_version` e regenere `db/schema.js`:

```bash
python3 -I - <<'EOF'
src = open('db/schema.sql', encoding='utf-8').read()
esc = src.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
open('db/schema.js', 'w', encoding='utf-8').write(
  "/* GERADO a partir de db/schema.sql — não edite à mão (ver docs/BANCO_E_LOGIN.md). */\n"
  "const SCHEMA_SQL = `" + esc + "`;\n")
EOF
```
