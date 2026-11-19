# Arquitetura — SQL Quest

## Decisão de stack

| Opção | Veredito |
|---|---|
| **Streamlit** | ✅ **Escolhida para o MVP.** 100% Python, tabelas/estado/tema prontos, deploy em minutos. Limite: reruns do script e pouco controle fino de layout. |
| NiceGUI / Reflex | Boa evolução se precisar de UI mais customizada e estado no servidor. |
| FastAPI + front leve (HTMX/Monaco) | Caminho de produção: multiusuário, auth, editor Monaco, API reaproveitável. O núcleo (`db.py`, `validator.py`, `content/`) já é independente de UI e migra sem mudanças. |

Execução segura: **SQLite `:memory:` recriado a cada execução** (isolamento total, sem estado entre alunos) +
`set_authorizer` (somente leitura) + `progress_handler` (timeout de 2 s) + limite de 1000 linhas + 1 instrução por vez.

## Estrutura de pastas

```
Talk/
├── app.py                    # UI Streamlit (sidebar, workspace, editor, resultados)
├── requirements.txt
├── .streamlit/config.toml    # tema dark
├── sqlquest/
│   ├── db.py                 # sandbox SQLite, seed, execução segura, introspecção de esquema
│   ├── validator.py          # comparação aluno × gabarito → Verdict (mensagem + dica)
│   ├── progress.py           # persistência do progresso (JSON local)
│   └── content/lessons.py    # trilhas e lições (dados, sem lógica)
├── tests/test_core.py        # gabaritos, validador, segurança do sandbox
├── data/progress.json        # gerado em runtime
└── docs/                     # este documento + guia de estilo
```

## Fluxo de uma lição

```
Aluno digita SQL ──► run_query(sql)  ──┐
                                       ├─► validate(user, expected) ─► Verdict ─► UI (badge/alerta/tabela)
Gabarito (lesson.solution) ► run_query ┘
```

A validação compara **resultados**, não texto de SQL — qualquer query equivalente é aceita.
Regras: nº de colunas, nomes (case-insensitive), nº de linhas, valores (floats arredondados a 2 casas);
ordem das linhas só importa se `ordered=True` na lição (ex.: rankings).

## Como adicionar uma lição

Acrescente um `Lesson(...)` em `sqlquest/content/lessons.py` com `theory_md`, `tables`, `challenge`,
`solution`, `starter`, `hints`. O teste `test_solution_passes_itself` valida o gabarito automaticamente.
Para novo dataset, adicione o SQL em `db.DATASETS`.

## Evolução recomendada

1. Contas de usuário + progresso em Postgres/SQLite persistente.
2. Editor Monaco/CodeMirror com autocomplete de tabelas e atalho Ctrl+Enter (migrando para FastAPI/NiceGUI).
3. Lições em YAML/Markdown para autores não programadores.
4. Datasets múltiplos, desafios com *casos de teste ocultos* (anti-hardcode) e modo "explicar plano" (`EXPLAIN`).
5. Mais lições: LEFT JOIN, subqueries, CTE, `CASE`, `LAG/LEAD`, somas acumuladas.
