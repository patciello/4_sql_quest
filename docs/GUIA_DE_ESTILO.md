# Guia de Estilo UI/UX — SQL Quest

Conceito: **"clean tech dark"** — estética de ferramenta de desenvolvedor (GitHub dark), foco total no código e no resultado.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#0D1117` | fundo da página |
| `--surface` | `#161B22` | cards, tabelas de esquema, sidebar |
| `--border` | `#30363D` | divisórias, contornos |
| `--text` | `#E6EDF3` | texto principal (contraste ≈ 15:1) |
| `--muted` | `#8B949E` | metadados, tipos de coluna |
| `--accent` | `#58A6FF` | ação primária, nomes de tabela, links |
| `--ok` | `#3FB950` | sucesso, badge de conclusão, FKs |
| `--warn` | `#D29922` | resultado incorreto (tentar de novo — tom encorajador, não punitivo) |
| `--err` | `#F85149` | erro de sintaxe SQL |
| `--key` | `#E3B341` | chaves primárias 🔑 |

Cor nunca é o único sinal: todo estado traz ícone + texto (✅ / 🔎 / ⚠).

## Tipografia

- **Interface:** Inter 400/500/600/700.
- **Código, esquema, SQL:** JetBrains Mono 400/500 (ligaduras desligadas para SQL), 15 px no editor.
- Escala: título 32 · seção 20 · corpo 16 · legenda 13.

## Layout do workspace (desktop ≥ 1200 px)

```
┌ Sidebar ─────┬───────────────── Cabeçalho: trilha · título · badge ─────────────────┐
│ 🛢 SQL Quest │ ┌──── Aprender (2/5) ───────┐ ┌──── Praticar (3/5) ───────────────┐ │
│ ▓▓▓░░ 2/5    │ │ 📖 Conceito (markdown)    │ │ 🎯 Desafio                        │ │
│              │ │ 🗂 Esquema: cards das     │ │ ┌ Editor SQL (Ace, syntax HL) ──┐ │ │
│ 🌱 Básico    │ │   tabelas (🔑 PK, → FK)   │ │ └───────────────────────────────┘ │ │
│  ✅ SELECT…  │ │ ▸ Amostra dos dados       │ │ [▶ Executar] [💡 Dica] [👁 Solução]│ │
│ 🚀 Interm.   │ │                           │ │ Veredito (verde/âmbar/vermelho)   │ │
│ 🔥 Avançado  │ │                           │ │ Tabela paginada + tempo/linhas    │ │
│              │ └───────────────────────────┘ │ [← Anterior]          [Próxima →] │ │
└──────────────┴───────────────────────────────┴───────────────────────────────────┘
```

Princípio: **esquerda = ler, direita = fazer**. O esquema fica visível enquanto o aluno escreve.
Em telas estreitas as colunas empilham: conceito → esquema → editor → resultado.

## Feedback e microcopy

- **Erro de SQL:** caixa vermelha com a mensagem do SQLite em monoespaçado.
- **Resultado incorreto:** âmbar, diz *o que* difere (colunas, nº de linhas, valores) + dica de onde olhar.
- **Sucesso:** verde, balões, badge "✓ Concluída", botão "Próxima" ganha destaque.
- **Dicas progressivas:** cada clique revela uma dica; a solução fica por último e não conclui a lição.

## Acessibilidade e interação

- Contraste AA em todo texto; foco visível nos botões (padrão Streamlit).
- Editor: atalhos estilo VS Code (Ctrl+/ comenta, Ctrl+D seleciona próxima ocorrência, Tab indenta, Ctrl+Z desfaz).
- Alvos de clique ≥ 40 px; navegação por teclado na sidebar e botões.
