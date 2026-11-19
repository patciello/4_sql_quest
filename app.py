"""SQL Quest — aprenda SQL na prática. Execute: streamlit run app.py"""
from __future__ import annotations

import html
import math

import pandas as pd
import streamlit as st

from sqlquest import progress
from sqlquest.content.lessons import TRACKS, Lesson, Track, all_lessons
from sqlquest.db import run_query, sample_rows, table_schemas
from sqlquest.validator import validate

try:
    from streamlit_ace import st_ace
except ImportError:  # fallback sem syntax highlighting
    st_ace = None

st.set_page_config(page_title="SQL Quest", page_icon="🛢️", layout="wide")

# ───────────────────────── Estilo ─────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root{--bg:#0D1117;--surface:#161B22;--border:#30363D;--text:#E6EDF3;--muted:#8B949E;
      --accent:#58A6FF;--ok:#3FB950;--err:#F85149;--warn:#D29922;--key:#E3B341;}
html,body,[class*="css"]{font-family:'Inter',system-ui,sans-serif;}
code,pre,.mono{font-family:'JetBrains Mono',ui-monospace,monospace !important;}
.block-container{padding-top:2rem;max-width:1400px;}
.tbl{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:0;margin-bottom:.75rem;overflow:hidden}
.tbl h4{margin:0;padding:.5rem .8rem;background:#1F2630;font:600 .85rem 'JetBrains Mono',monospace;color:var(--accent)}
.tbl .col{display:flex;justify-content:space-between;gap:1rem;padding:.25rem .8rem;border-top:1px solid var(--border);
          font:400 .8rem 'JetBrains Mono',monospace;color:var(--text)}
.tbl .col .t{color:var(--muted)} .tbl .pk{color:var(--key)} .tbl .fk{color:var(--ok)}
.badge{display:inline-block;padding:.15rem .6rem;border-radius:999px;font-size:.75rem;font-weight:600;border:1px solid}
.badge.ok{color:var(--ok);border-color:var(--ok);background:rgba(63,185,80,.12)}
.badge.todo{color:var(--muted);border-color:var(--border)}
.verdict{border-radius:10px;padding:.8rem 1rem;margin:.5rem 0;border:1px solid}
.verdict.ok{border-color:var(--ok);background:rgba(63,185,80,.10)}
.verdict.fail{border-color:var(--warn);background:rgba(210,153,34,.10)}
.sqlerr{border:1px solid var(--err);background:rgba(248,81,73,.10);border-radius:10px;padding:.8rem 1rem}
.sqlerr pre{margin:.3rem 0 0;white-space:pre-wrap;color:var(--err);background:transparent}
</style>
""", unsafe_allow_html=True)

# ───────────────────────── Estado ─────────────────────────
LESSONS = all_lessons()
BY_ID = {l.id: (t, l) for t, l in LESSONS}

if "progress" not in st.session_state:
    st.session_state.progress = progress.load()
if "current" not in st.session_state:
    st.session_state.current = LESSONS[0][1].id
if "hints" not in st.session_state:
    st.session_state.hints = {}
if "last" not in st.session_state:
    st.session_state.last = {}

PROG = st.session_state.progress
done = set(PROG["completed"])


def goto(lesson_id: str) -> None:
    st.session_state.current = lesson_id


# ───────────────────────── Componentes ─────────────────────────
def render_schema(lesson: Lesson) -> None:
    schemas = table_schemas(lesson.dataset, list(lesson.tables))
    cols = st.columns(len(schemas))
    for col, (name, fields) in zip(cols, schemas.items()):
        rows = ""
        for cname, ctype, pk, fk in fields:
            tag = ' <span class="pk">🔑</span>' if pk else (f' <span class="fk">→ {html.escape(fk)}</span>' if fk else "")
            rows += (f'<div class="col"><span>{html.escape(cname)}{tag}</span>'
                     f'<span class="t">{html.escape(ctype)}</span></div>')
        col.markdown(f'<div class="tbl"><h4>{html.escape(name)}</h4>{rows}</div>', unsafe_allow_html=True)
    with st.expander("Ver amostra dos dados"):
        for name in lesson.tables:
            c, r = sample_rows(lesson.dataset, name)
            st.caption(name)
            st.dataframe(pd.DataFrame(r, columns=c), hide_index=True, use_container_width=True)


def render_table(columns: list[str], rows: list[tuple], key: str) -> None:
    df = pd.DataFrame(rows, columns=columns)
    c1, c2 = st.columns([1, 3])
    size = c1.selectbox("Linhas por página", [5, 10, 25, 50], index=1, key=f"{key}_size")
    pages = max(1, math.ceil(len(df) / size))
    page = c2.number_input(f"Página (1–{pages})", 1, pages, 1, key=f"{key}_page") if pages > 1 else 1
    st.dataframe(df.iloc[(page - 1) * size: page * size], hide_index=True, use_container_width=True)
    st.caption(f"{len(df)} linha(s) · {len(columns)} coluna(s)")


def editor(lesson: Lesson) -> str:
    if st_ace is None:
        st.warning("Instale `streamlit-ace` para syntax highlighting (`pip install streamlit-ace`).")
        return st.text_area("SQL", lesson.starter, height=200, key=f"ed_{lesson.id}")
    return st_ace(
        value=lesson.starter, language="sql", theme="tomorrow_night", keybinding="vscode",
        font_size=15, min_lines=9, max_lines=20, tab_size=2, wrap=True, show_gutter=True,
        auto_update=True, key=f"ed_{lesson.id}",
    ) or ""


def mark_done(lesson_id: str) -> None:
    if lesson_id not in PROG["completed"]:
        PROG["completed"].append(lesson_id)
    progress.save(PROG)


# ───────────────────────── Sidebar ─────────────────────────
with st.sidebar:
    st.markdown("## 🛢️ SQL Quest")
    total = len(LESSONS)
    st.progress(len(done) / total, text=f"{len(done)}/{total} lições concluídas")
    for track in TRACKS:
        st.markdown(f"**{track.icon} {track.title}**")
        for lesson in track.lessons:
            mark = "✅" if lesson.id in done else "○"
            active = lesson.id == st.session_state.current
            st.button(f"{mark} {lesson.title}", key=f"nav_{lesson.id}", use_container_width=True,
                      type="primary" if active else "secondary", on_click=goto, args=(lesson.id,))
    st.divider()
    if st.button("Reiniciar progresso", use_container_width=True):
        PROG["completed"].clear()
        progress.save(PROG)
        st.session_state.last.clear()
        st.rerun()

# ───────────────────────── Workspace ─────────────────────────
track, lesson = BY_ID[st.session_state.current]
idx = [l.id for _, l in LESSONS].index(lesson.id)

head, badge = st.columns([5, 1])
head.markdown(f"<span style='color:var(--muted)'>{track.icon} {track.title}</span>", unsafe_allow_html=True)
head.title(lesson.title)
badge.markdown(
    f"<div style='text-align:right;padding-top:1.5rem'><span class='badge {'ok' if lesson.id in done else 'todo'}'>"
    f"{'✓ Concluída' if lesson.id in done else 'Em andamento'}</span></div>", unsafe_allow_html=True)

left, right = st.columns([2, 3], gap="large")

with left:
    st.subheader("📖 Conceito")
    st.markdown(lesson.theory_md)
    st.subheader("🗂️ Esquema")
    render_schema(lesson)

with right:
    st.subheader("🎯 Desafio")
    st.info(lesson.challenge)

    sql = editor(lesson)
    b1, b2, b3 = st.columns([1.2, 1, 1])
    run = b1.button("▶ Executar e validar", type="primary", use_container_width=True, key=f"run_{lesson.id}")
    show_hint = b2.button("💡 Dica", use_container_width=True, key=f"hint_{lesson.id}")
    peek = b3.button("👁 Ver solução", use_container_width=True, key=f"sol_{lesson.id}")

    if show_hint:
        n = st.session_state.hints.get(lesson.id, 0)
        st.session_state.hints[lesson.id] = min(n + 1, len(lesson.hints))
    for h in lesson.hints[: st.session_state.hints.get(lesson.id, 0)]:
        st.caption(f"💡 {h}")
    if peek:
        st.code(lesson.solution, language="sql")

    if run:
        user = run_query(sql, lesson.dataset)
        expected = run_query(lesson.solution, lesson.dataset)
        verdict = validate(user, expected, ordered=lesson.ordered) if user.ok else None
        att = PROG["attempts"]
        att[lesson.id] = att.get(lesson.id, 0) + 1
        if verdict and verdict.passed:
            mark_done(lesson.id)
        else:
            progress.save(PROG)
        st.session_state.last[lesson.id] = (user, verdict)
        st.rerun() if (verdict and verdict.passed and lesson.id not in done) else None

    last = st.session_state.last.get(lesson.id)
    if last:
        user, verdict = last
        if not user.ok:
            st.markdown(f"<div class='sqlerr'><b>⚠ Erro de SQL</b><pre>{html.escape(user.error or '')}</pre></div>",
                        unsafe_allow_html=True)
        else:
            cls = "ok" if verdict.passed else "fail"
            icon = "✅" if verdict.passed else "🔎"
            extra = f"<br><small>💡 {html.escape(verdict.hint)}</small>" if verdict.hint else ""
            st.markdown(f"<div class='verdict {cls}'>{icon} <b>{html.escape(verdict.message)}</b>{extra}</div>",
                        unsafe_allow_html=True)
            if verdict.passed:
                st.balloons() if lesson.id not in st.session_state.get("_celebrated", set()) else None
                st.session_state.setdefault("_celebrated", set()).add(lesson.id)
            st.caption(f"Executado em {user.elapsed_ms:.1f} ms"
                       + (" · resultado truncado em 1000 linhas" if user.truncated else ""))
            render_table(user.columns, user.rows, key=f"res_{lesson.id}")

    nav1, _, nav2 = st.columns([1, 2, 1])
    if idx > 0:
        nav1.button("← Anterior", on_click=goto, args=(LESSONS[idx - 1][1].id,), use_container_width=True)
    if idx < len(LESSONS) - 1:
        nav2.button("Próxima →", on_click=goto, args=(LESSONS[idx + 1][1].id,), use_container_width=True,
                    type="primary" if lesson.id in done else "secondary")
