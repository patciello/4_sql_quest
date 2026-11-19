"""Conteúdo pedagógico. Adicionar lição = adicionar um Lesson à lista da trilha."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Lesson:
    id: str
    title: str
    theory_md: str
    tables: tuple[str, ...]
    challenge: str
    solution: str
    starter: str = "SELECT \n"
    hints: tuple[str, ...] = ()
    ordered: bool = False
    dataset: str = "loja"


@dataclass(frozen=True)
class Track:
    id: str
    title: str
    level: str
    icon: str
    lessons: tuple[Lesson, ...] = field(default_factory=tuple)


BASIC = Track("basico", "Básico", "Iniciante", "🌱", (
    Lesson(
        id="select-where",
        title="SELECT e WHERE",
        theory_md="""
**`SELECT`** escolhe *quais colunas* você quer ver; **`FROM`** diz *de qual tabela*;
**`WHERE`** filtra *quais linhas* entram no resultado.

```sql
SELECT nome, preco
FROM produtos
WHERE categoria = 'Móveis';
```

- Textos vão entre aspas simples: `'Recife'`.
- Operadores: `=`, `<>`, `>`, `<`, `>=`, `<=`, `AND`, `OR`, `IN (...)`, `LIKE 'A%'`.
- `SELECT *` traz todas as colunas (útil para explorar, evite em produção).
""",
        tables=("clientes",),
        challenge="Liste o **nome** e a **cidade** dos clientes do estado de **PE**.",
        solution="SELECT nome, cidade FROM clientes WHERE estado = 'PE'",
        starter="SELECT \nFROM clientes\nWHERE ",
        hints=("Você precisa de duas colunas: nome e cidade.",
               "O filtro é sobre a coluna estado: WHERE estado = '...'."),
    ),
    Lesson(
        id="order-limit",
        title="ORDER BY e LIMIT",
        theory_md="""
**`ORDER BY`** ordena o resultado (`ASC` crescente, padrão; `DESC` decrescente).
**`LIMIT n`** mantém só as `n` primeiras linhas — combine os dois para criar rankings.

```sql
SELECT nome, preco
FROM produtos
ORDER BY preco DESC
LIMIT 3;
```

A ordem das cláusulas importa: `SELECT → FROM → WHERE → ORDER BY → LIMIT`.
""",
        tables=("produtos",),
        challenge="Mostre **nome** e **preco** dos **3 produtos mais caros**, do mais caro ao mais barato.",
        solution="SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 3",
        starter="SELECT \nFROM produtos\n",
        hints=("Ordene pela coluna preco em ordem decrescente.",),
        ordered=True,
    ),
))

INTERMEDIATE = Track("intermediario", "Intermediário", "Intermediário", "🚀", (
    Lesson(
        id="inner-join",
        title="INNER JOIN",
        theory_md="""
**`JOIN`** combina linhas de duas tabelas usando uma **chave** em comum
(normalmente `chave_estrangeira = chave_primária`).

```sql
SELECT p.id, c.nome
FROM pedidos AS p
INNER JOIN clientes AS c ON c.id = p.cliente_id;
```

- `INNER JOIN` mantém só linhas com correspondência nas duas tabelas.
- Use **alias** (`AS p`) para abreviar e evitar ambiguidade de colunas.
""",
        tables=("clientes", "pedidos"),
        challenge=("Liste o **id do pedido** (`pedido_id`) e o **nome do cliente** (`cliente`) "
                   "de todos os pedidos com status **'entregue'**."),
        solution=("SELECT p.id AS pedido_id, c.nome AS cliente FROM pedidos p "
                  "JOIN clientes c ON c.id = p.cliente_id WHERE p.status = 'entregue'"),
        starter="SELECT p.id AS pedido_id, \nFROM pedidos AS p\nJOIN clientes AS c ON \nWHERE ",
        hints=("A ligação é pedidos.cliente_id = clientes.id.",
               "Depois do JOIN, filtre com WHERE p.status = 'entregue'."),
    ),
    Lesson(
        id="group-by",
        title="GROUP BY e agregações",
        theory_md="""
**Funções de agregação** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) resumem várias linhas em um valor.
**`GROUP BY`** cria um resumo *por grupo*. **`HAVING`** filtra grupos (como um `WHERE` para agregados).

```sql
SELECT categoria, COUNT(*) AS qtd
FROM produtos
GROUP BY categoria
HAVING COUNT(*) > 1;
```

Toda coluna do `SELECT` que não é agregada deve estar no `GROUP BY`.
""",
        tables=("clientes", "pedidos"),
        challenge=("Para cada **cliente** (`cliente`), mostre quantos pedidos fez (`total_pedidos`), "
                   "apenas clientes com **2 ou mais** pedidos."),
        solution=("SELECT c.nome AS cliente, COUNT(*) AS total_pedidos FROM clientes c "
                  "JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id, c.nome HAVING COUNT(*) >= 2"),
        starter="SELECT c.nome AS cliente, \nFROM clientes AS c\nJOIN pedidos AS p ON \nGROUP BY \nHAVING ",
        hints=("Junte clientes e pedidos e agrupe por cliente.",
               "Filtre os grupos com HAVING COUNT(*) >= 2 (WHERE não enxerga agregados)."),
    ),
))

ADVANCED = Track("avancado", "Avançado", "Avançado", "🔥", (
    Lesson(
        id="window-rank",
        title="Window Functions: RANK",
        theory_md="""
**Window functions** calculam valores sobre um conjunto de linhas *sem colapsá-las*
(diferente do `GROUP BY`). A cláusula `OVER` define a janela.

```sql
SELECT nome, categoria, preco,
       RANK() OVER (PARTITION BY categoria ORDER BY preco DESC) AS posicao
FROM produtos;
```

- `PARTITION BY` reinicia o cálculo a cada grupo.
- `ORDER BY` dentro do `OVER` define a ordem do ranking.
- Para filtrar pelo ranking, use uma **subquery** ou CTE (`WITH`).
""",
        tables=("produtos",),
        challenge=("Mostre o **produto mais caro de cada categoria**: colunas `categoria`, `nome`, `preco`."),
        solution=("SELECT categoria, nome, preco FROM ("
                  "SELECT categoria, nome, preco, "
                  "RANK() OVER (PARTITION BY categoria ORDER BY preco DESC) AS r FROM produtos"
                  ") WHERE r = 1"),
        starter="SELECT categoria, nome, preco\nFROM (\n  SELECT categoria, nome, preco,\n         RANK() OVER (...) AS r\n  FROM produtos\n)\nWHERE ",
        hints=("Calcule RANK() particionando por categoria, ordenando por preço decrescente.",
               "Envolva em subquery e filtre WHERE r = 1."),
    ),
))

TRACKS: tuple[Track, ...] = (BASIC, INTERMEDIATE, ADVANCED)


def all_lessons() -> list[tuple[Track, Lesson]]:
    return [(t, l) for t in TRACKS for l in t.lessons]
