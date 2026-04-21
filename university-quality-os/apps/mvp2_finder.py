"""Streamlit UI for MVP-2 Evidence Finder.

Tabs:
  1. Search by criterion — pick from 60 KĐCLGD criteria, see top-5 + coverage
  2. Free-text search — natural language query
  3. Evaluation — batch eval against ground truth

Run: streamlit run apps/mvp2_finder.py
"""

import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import streamlit as st

from university_quality_os.config import settings
from university_quality_os.mvp2 import EvidenceFinder, EvidenceQuery
from university_quality_os.mvp2.evaluator import run_evaluation
from university_quality_os.utils import read_json


st.set_page_config(
    page_title="Quality OS — Evidence Finder",
    page_icon="🔎",
    layout="wide",
)


# ─── Cached loaders ────────────────────────────────────────
@st.cache_data
def load_criteria():
    path = settings.data_dir / "criteria.json"
    return read_json(path) if path.exists() else None


@st.cache_data
def load_processes():
    path = settings.data_dir / "iso_processes.json"
    return read_json(path) if path.exists() else None


@st.cache_data
def check_index():
    """Check if pgvector has chunks indexed."""
    try:
        from university_quality_os.mvp2.indexer import get_db_connection
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM chunks;")
            count = cur.fetchone()[0]
        conn.close()
        return {"ok": True, "count": count}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@st.cache_resource
def get_finder(model: str):
    criteria = load_criteria()
    return EvidenceFinder(criteria_data=criteria, model=model)


def save_feedback(query_text: str, result_dict: dict, feedback: dict):
    """Append feedback to log."""
    log_path = settings.data_dir / "finder_feedback.jsonl"
    record = {
        "ts": datetime.now().isoformat(),
        "query": query_text,
        "result": result_dict,
        "feedback": feedback,
    }
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ─── Main ──────────────────────────────────────────────────
def main():
    st.title("🔎 Evidence Finder — MVP-2")
    st.caption("Tìm minh chứng cho tiêu chí KĐCLGD / free-text query")

    criteria = load_criteria()
    processes = load_processes()
    index_status = check_index()

    # Validate prereqs
    issues = []
    if not criteria:
        issues.append("❌ criteria.json missing. Run `scripts/04b_build_criteria_offline.py`.")
    if not index_status.get("ok"):
        issues.append(f"❌ Postgres/pgvector not accessible: {index_status.get('error')}")
        issues.append("   → Run `docker compose up -d` + `python scripts/08_build_index.py`")
    elif index_status.get("count", 0) == 0:
        issues.append("⚠️ Index is empty. Run `python scripts/08_build_index.py` first.")
    if not settings.anthropic_api_key or settings.anthropic_api_key.startswith("sk-ant-xxx"):
        issues.append("⚠️ ANTHROPIC_API_KEY not set — rerank will fail.")
    if not settings.openai_api_key or settings.openai_api_key.startswith("sk-xxx"):
        issues.append("⚠️ OPENAI_API_KEY not set — embedding will fail.")

    if issues:
        for i in issues:
            if "❌" in i:
                st.error(i)
            else:
                st.warning(i)

    # Sidebar
    with st.sidebar:
        st.header("Settings")

        model_choice = st.radio(
            "Rerank model",
            options=[settings.claude_model_fast, settings.claude_model_primary],
            format_func=lambda x: f"Haiku (fast)" if "haiku" in x else "Sonnet (quality)",
            index=0,
        )

        top_k = st.slider("Top K results", 3, 10, 5)
        use_rerank = st.checkbox("Use LLM rerank", value=True)
        use_coverage = st.checkbox("Include coverage analysis", value=True)

        st.divider()
        if index_status.get("ok"):
            st.metric("Chunks indexed", f"{index_status.get('count', 0):,}")
        if criteria:
            st.metric("Criteria", criteria.get("total_criteria", 0))

    # Tabs
    tab_crit, tab_free, tab_eval = st.tabs([
        "📐 Search by criterion",
        "💬 Free-text search",
        "📊 Evaluation",
    ])

    with tab_crit:
        if criteria:
            criterion_tab(criteria, model_choice, top_k, use_rerank, use_coverage)
        else:
            st.error("Need criteria.json to use this tab")

    with tab_free:
        freetext_tab(model_choice, top_k, use_rerank)

    with tab_eval:
        eval_tab(model_choice)


# ─── Tab: Search by criterion ─────────────────────────────
def criterion_tab(criteria, model, top_k, use_rerank, use_coverage):
    """Pick a KĐCLGD criterion → find evidence."""

    # Build flat list
    all_criteria = []
    for std in criteria["standards"]:
        for c in std["criteria"]:
            all_criteria.append({
                "id": c["id"],
                "name": c["name"],
                "standard": std["name"],
                "requirements": c.get("requirements", []),
                "label": f"{c['id']} — {c['name']}",
            })

    # Selector
    picked = st.selectbox(
        "Chọn tiêu chí",
        options=all_criteria,
        format_func=lambda x: x["label"],
    )

    # Show criterion details
    with st.expander("📋 Chi tiết tiêu chí", expanded=False):
        st.markdown(f"**Tiêu chuẩn:** {picked['standard']}")
        st.markdown(f"**Yêu cầu:**")
        for r in picked["requirements"]:
            st.markdown(f"- {r}")

    if st.button("🔎 Find evidence", type="primary"):
        query = EvidenceQuery(
            criterion_id=picked["id"],
            top_k=top_k,
            rerank=use_rerank,
            include_coverage=use_coverage,
        )

        finder = get_finder(model)
        with st.spinner(f"Searching {picked['id']}..."):
            result = finder.find(query)

        st.session_state.last_crit_result = result
        st.session_state.last_crit = picked

    # Show result
    if "last_crit_result" in st.session_state:
        show_result(st.session_state.last_crit_result,
                    st.session_state.last_crit)


# ─── Tab: Free-text ────────────────────────────────────────
def freetext_tab(model, top_k, use_rerank):
    query_text = st.text_area(
        "Nhập câu query",
        placeholder="VD: 'Quy trình tuyển dụng giảng viên có những bước nào?'",
        height=100,
    )

    if st.button("🔎 Search", type="primary", disabled=not query_text.strip()):
        query = EvidenceQuery(
            query_text=query_text,
            top_k=top_k,
            rerank=use_rerank,
            include_coverage=False,
        )
        finder = get_finder(model)
        with st.spinner("Searching..."):
            result = finder.find(query)

        st.session_state.last_free_result = result
        st.session_state.last_free_query = query_text

    if "last_free_result" in st.session_state:
        show_result(st.session_state.last_free_result)


# ─── Shared result renderer ────────────────────────────────
def show_result(result, criterion=None):
    st.divider()
    st.subheader("Results")

    if result.error:
        st.error(f"Error: {result.error}")
        return

    # Perf row
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total time", f"{result.latency_ms_total:,} ms")
    col2.metric("Retrieval", f"{result.latency_ms_retrieval:,} ms")
    col3.metric("Rerank", f"{result.latency_ms_rerank:,} ms")
    col4.metric("Cost", f"{result.cost_vnd + result.embedding_cost_vnd:,.0f} VND")

    # Matches
    st.markdown("### 📄 Top matches")
    if not result.matches:
        st.info("No matches found")
        return

    for i, m in enumerate(result.matches):
        with st.container(border=True):
            cols = st.columns([5, 2])
            with cols[0]:
                st.markdown(f"**#{i+1} — `{m.doc_id}`**")
                st.caption(f"📂 {m.doc_path}")
                # Quote
                st.markdown(f"> {m.excerpt}")
                # Reasoning
                st.caption(f"💡 {m.reasoning}")
            with cols[1]:
                st.metric("Score", f"{m.rerank_score:.2f}")
                st.caption(f"Source: {m.retrieval_source}")

    # Coverage
    if result.coverage and result.coverage.requirements:
        st.markdown("### ✅ Coverage Analysis")
        cov_pct = result.coverage.coverage_pct
        st.progress(cov_pct, text=f"{cov_pct:.0%} of requirements covered")

        for req in result.coverage.requirements:
            icon = "❌" if req.is_gap else "✓"
            color = "red" if req.is_gap else "green"
            with st.container(border=True):
                st.markdown(f"{icon} **{req.requirement}**")
                if req.covered_by:
                    st.caption(f"Covered by: {', '.join(req.covered_by)}")
                if req.reasoning:
                    st.caption(f"💭 {req.reasoning}")

        if result.coverage.gaps:
            st.warning(f"⚠️ {len(result.coverage.gaps)} gaps to fill")


# ─── Eval tab ──────────────────────────────────────────────
def eval_tab(model):
    gt_path = settings.data_dir / "ground_truth.json"
    if not gt_path.exists():
        st.warning("No ground truth. Run labeler.py.")
        return

    gt = read_json(gt_path)
    n_labels = len(gt.get("labels", []))

    # Count criteria with evidence
    crit_set = set()
    for lbl in gt.get("labels", []):
        crit_set.update(lbl.get("kdclgd_criteria", []))

    st.metric("Labeled docs", n_labels)
    st.metric("Criteria with evidence", len(crit_set))

    if len(crit_set) < 3:
        st.warning("Need ≥ 3 criteria with evidence to run eval.")
        return

    max_crit = st.slider("Max criteria to evaluate", 1, min(len(crit_set), 20), min(len(crit_set), 10))

    if st.button("🚀 Run evaluation", type="primary"):
        criteria = load_criteria()
        finder = EvidenceFinder(criteria_data=criteria, model=model)
        with st.spinner(f"Running eval on {max_crit} criteria..."):
            out = run_evaluation(finder, max_criteria=max_crit, verbose=False)

        m = out["metrics"]
        st.success(f"✅ Evaluated {m.n_queries} criteria")

        col1, col2, col3 = st.columns(3)
        col1.metric(
            "Precision@5", f"{m.precision_at_5:.1%}",
            delta=f"target 80%",
            delta_color="normal" if m.precision_at_5 >= 0.80 else "inverse",
        )
        col2.metric(
            "Recall@5", f"{m.recall_at_5:.1%}",
            delta=f"target 70%",
            delta_color="normal" if m.recall_at_5 >= 0.70 else "inverse",
        )
        col3.metric(
            "Avg cost/query",
            f"{m.total_cost_vnd/max(m.n_queries,1):,.0f} VND",
        )

        with st.expander("Full report", expanded=True):
            st.markdown(out["report"])


if __name__ == "__main__":
    main()
