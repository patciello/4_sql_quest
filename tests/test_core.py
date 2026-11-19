import pytest

from sqlquest.content.lessons import all_lessons
from sqlquest.db import run_query
from sqlquest.validator import validate


@pytest.mark.parametrize("track,lesson", all_lessons(), ids=lambda x: getattr(x, "id", ""))
def test_solution_passes_itself(track, lesson):
    res = run_query(lesson.solution, lesson.dataset)
    assert res.ok, res.error
    assert res.rows, "gabarito não deve retornar vazio"
    assert validate(res, res, ordered=lesson.ordered).passed


def test_wrong_filter_fails():
    exp = run_query("SELECT nome FROM clientes WHERE estado='PE'")
    usr = run_query("SELECT nome FROM clientes WHERE estado='SP'")
    assert not validate(usr, exp).passed


def test_row_order_ignored_unless_ordered():
    a = run_query("SELECT nome FROM produtos ORDER BY preco")
    b = run_query("SELECT nome FROM produtos ORDER BY preco DESC")
    assert validate(a, b).passed
    assert not validate(a, b, ordered=True).passed


def test_syntax_error_reported():
    r = run_query("SELEC * FROM clientes")
    assert not r.ok


@pytest.mark.parametrize("bad", [
    "DROP TABLE clientes", "DELETE FROM clientes", "SELECT 1; DROP TABLE clientes",
    "WITH x AS (SELECT 1) DELETE FROM clientes", "PRAGMA table_info(clientes)",
])
def test_writes_blocked(bad):
    assert not run_query(bad).ok


def test_runaway_query_times_out():
    r = run_query("WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c) SELECT count(*) FROM c")
    assert not r.ok
