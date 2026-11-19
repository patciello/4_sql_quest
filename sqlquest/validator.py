"""Validação automática: compara o resultado do aluno com o do gabarito."""
from __future__ import annotations

from dataclasses import dataclass

from .db import QueryResult


@dataclass
class Verdict:
    passed: bool
    message: str
    hint: str | None = None


def _norm(v):
    if isinstance(v, float):
        return round(v, 2)
    if isinstance(v, str):
        return v.strip()
    return v


def _norm_rows(rows):
    return [tuple(_norm(v) for v in r) for r in rows]


def _sort_key(row):
    return tuple((v is None, str(type(v).__name__), str(v)) for v in row)


def validate(user: QueryResult, expected: QueryResult, *, ordered: bool = False,
             check_column_names: bool = True) -> Verdict:
    if not user.ok:
        return Verdict(False, "Sua consulta tem um erro e não pôde ser avaliada.")
    if not expected.ok:  # erro do autor da lição, não do aluno
        return Verdict(False, f"Erro interno no gabarito: {expected.error}")

    if len(user.columns) != len(expected.columns):
        return Verdict(False, f"Número de colunas diferente: você retornou {len(user.columns)}, "
                              f"o esperado é {len(expected.columns)}.",
                       "Revise a lista de colunas no SELECT.")
    if check_column_names and [c.lower() for c in user.columns] != [c.lower() for c in expected.columns]:
        return Verdict(False, "Os nomes/ordem das colunas não batem com o esperado: "
                              f"{', '.join(expected.columns)}.",
                       "Use alias (AS) para nomear colunas calculadas.")

    u, e = _norm_rows(user.rows), _norm_rows(expected.rows)
    if len(u) != len(e):
        rel = "mais" if len(u) > len(e) else "menos"
        return Verdict(False, f"Quantidade de linhas incorreta: {len(u)} (esperado {len(e)}).",
                       f"Você retornou {rel} linhas do que o necessário. Confira o WHERE/JOIN/GROUP BY.")

    if ordered:
        ok = u == e
        hint = "O conteúdo está certo? Então revise o ORDER BY." if sorted(u, key=_sort_key) == sorted(e, key=_sort_key) else None
    else:
        ok = sorted(u, key=_sort_key) == sorted(e, key=_sort_key)
        hint = None
    if ok:
        return Verdict(True, "Resultado idêntico ao gabarito. Muito bem!")
    return Verdict(False, "O número de linhas está certo, mas os valores diferem do esperado.",
                   hint or "Compare os valores da sua tabela com o enunciado.")
