"""Sandbox SQLite: banco em memória, recriado a cada execução, somente leitura."""
from __future__ import annotations

import sqlite3
import time
from dataclasses import dataclass, field

MAX_ROWS = 1000
TIMEOUT_S = 2.0

SEED_LOJA = """
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cidade TEXT NOT NULL, estado TEXT NOT NULL
);
CREATE TABLE produtos (
  id INTEGER PRIMARY KEY, nome TEXT NOT NULL, categoria TEXT NOT NULL, preco REAL NOT NULL
);
CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY, cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data TEXT NOT NULL, status TEXT NOT NULL
);
CREATE TABLE itens_pedido (
  id INTEGER PRIMARY KEY, pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id INTEGER NOT NULL REFERENCES produtos(id), quantidade INTEGER NOT NULL
);

INSERT INTO clientes VALUES
 (1,'Ana Souza','Recife','PE'),(2,'Bruno Lima','São Paulo','SP'),
 (3,'Carla Dias','Olinda','PE'),(4,'Diego Alves','Campinas','SP'),
 (5,'Elisa Rocha','Salvador','BA'),(6,'Fábio Costa','Recife','PE');

INSERT INTO produtos VALUES
 (1,'Notebook','Eletrônicos',3500.00),(2,'Mouse','Periféricos',80.00),
 (3,'Teclado','Periféricos',150.00),(4,'Monitor','Eletrônicos',1200.00),
 (5,'Cadeira Gamer','Móveis',950.00),(6,'Mesa de Escritório','Móveis',700.00),
 (7,'Webcam','Periféricos',220.00);

INSERT INTO pedidos VALUES
 (1,1,'2025-01-10','entregue'),(2,2,'2025-01-15','entregue'),
 (3,1,'2025-02-02','cancelado'),(4,3,'2025-02-10','entregue'),
 (5,4,'2025-03-05','pendente'),(6,2,'2025-03-12','entregue'),
 (7,5,'2025-03-20','entregue'),(8,1,'2025-04-01','pendente');

INSERT INTO itens_pedido VALUES
 (1,1,1,1),(2,1,2,2),(3,2,4,2),(4,2,3,1),(5,3,5,1),(6,4,2,3),
 (7,4,7,1),(8,5,6,1),(9,6,1,1),(10,6,3,2),(11,7,5,2),(12,8,4,1);
"""

DATASETS = {"loja": SEED_LOJA}


@dataclass
class QueryResult:
    ok: bool
    columns: list[str] = field(default_factory=list)
    rows: list[tuple] = field(default_factory=list)
    error: str | None = None
    truncated: bool = False
    elapsed_ms: float = 0.0


def _authorizer(action, arg1, arg2, dbname, source):
    """Permite apenas leitura (SELECT/funções/leitura de colunas)."""
    allowed = {sqlite3.SQLITE_SELECT, sqlite3.SQLITE_READ, sqlite3.SQLITE_FUNCTION,
               sqlite3.SQLITE_RECURSIVE}
    return sqlite3.SQLITE_OK if action in allowed else sqlite3.SQLITE_DENY


def build_connection(dataset: str = "loja") -> sqlite3.Connection:
    con = sqlite3.connect(":memory:")
    con.executescript(DATASETS[dataset])
    con.commit()
    con.set_authorizer(_authorizer)  # só depois do seed
    return con


def run_query(sql: str, dataset: str = "loja") -> QueryResult:
    sql = (sql or "").strip().rstrip(";").strip()
    if not sql:
        return QueryResult(False, error="Escreva uma consulta antes de executar.")
    if ";" in sql:
        return QueryResult(False, error="Execute apenas uma instrução por vez (remova o ';' extra).")
    if sql.split(None, 1)[0].upper() not in ("SELECT", "WITH"):
        return QueryResult(False, error="Nesta trilha só são permitidas consultas SELECT.")

    con = build_connection(dataset)
    start = time.perf_counter()
    con.set_progress_handler(lambda: 1 if time.perf_counter() - start > TIMEOUT_S else 0, 10_000)
    try:
        cur = con.execute(sql)
        cols = [d[0] for d in cur.description] if cur.description else []
        rows = cur.fetchmany(MAX_ROWS + 1)
        truncated = len(rows) > MAX_ROWS
        return QueryResult(True, cols, rows[:MAX_ROWS], truncated=truncated,
                           elapsed_ms=(time.perf_counter() - start) * 1000)
    except sqlite3.OperationalError as e:
        msg = "A consulta excedeu o tempo limite." if "interrupted" in str(e) else str(e)
        return QueryResult(False, error=msg)
    except sqlite3.Error as e:
        return QueryResult(False, error=str(e))
    finally:
        con.close()


def table_schemas(dataset: str, tables: list[str]) -> dict[str, list[tuple]]:
    """Retorna {tabela: [(coluna, tipo, pk, fk_destino)]} para o diagrama."""
    con = sqlite3.connect(":memory:")
    con.executescript(DATASETS[dataset])
    out = {}
    for t in tables:
        fks = {r[3]: f"{r[2]}.{r[4]}" for r in con.execute(f"PRAGMA foreign_key_list({t})")}
        out[t] = [(c[1], c[2], bool(c[5]), fks.get(c[1]))
                  for c in con.execute(f"PRAGMA table_info({t})")]
    con.close()
    return out


def sample_rows(dataset: str, table: str, n: int = 3) -> tuple[list[str], list[tuple]]:
    con = sqlite3.connect(":memory:")
    con.executescript(DATASETS[dataset])
    cur = con.execute(f"SELECT * FROM {table} LIMIT {int(n)}")
    cols = [d[0] for d in cur.description]
    rows = cur.fetchall()
    con.close()
    return cols, rows
