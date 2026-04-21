"""Streamlit UI for MVP-1 Document Classifier.

Tabs:
  1. Classify — upload a doc or select from corpus, see classification
  2. Corpus browser — scan all 63 OK docs, classify on demand
  3. Evaluation — run batch eval on ground truth, show metrics

Run: streamlit run apps/mvp1_classifier.py
"""

import json
import sys
from datetime import datetime
from pathlib import Path

# Make src/ importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import streamlit as st

from university_quality_os.config import settings
from university_quality_os.mvp1 import DocumentClassifier, DocumentInput
from university_quality_os.mvp1.evaluator import run_evaluation
from university_quality_os.mvp1.metrics import format_report
from university_quality_os.utils import read_json, read_jsonl, write_json


st.set_page_config(
    page_title="Quality OS — Classifier",
    page_icon="🏷️",
    layout="wide",
)


# ─── Cached loaders ────────────────────────────────────────
@st.cache_data
def load_docs():
    path = settings.extracted_dir / "iso_texts.jsonl"
    if not path.exists():
        return []
    return [d for d in read_jsonl(path) if d["extract_status"] == "ok"]


@st.cache_data
def load_criteria():
    path = settings.data_dir / "criteria.json"
    return read_json(path) if path.exists() else None


@st.cache_data
def load_processes():
    path = settings.data_dir / "iso_processes.json"
    return read_json(path) if path.exists() else None


@st.cache_resource
def get_classifier(model: str):
    """Cached classifier instance."""
    criteria = load_criteria()
    processes = load_processes()
    return DocumentClassifier(
        criteria_data=criteria,
        processes_data=processes,
        model=model,
    )


def save_feedback(doc_id: str, result_dict: dict, feedback: dict):
    """Append user feedback to log."""
    log_path = settings.data_dir / "classifier_feedback.jsonl"
    record = {
        "ts": datetime.now().isoformat(),
        "doc_id": doc_id,
        "result": result_dict,
        "feedback": feedback,
    }
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ─── Main ──────────────────────────────────────────────────
def main():
    st.title("🏷️ Document Classifier — MVP-1")
    st.caption("Phân loại document → ISO process + KĐCLGD criteria")

    # Validate prereqs
    docs = load_docs()
    criteria = load_criteria()
    processes = load_processes()

    issues = []
    if not docs:
        issues.append("❌ No extracted docs. Run `scripts/02_extract_text.py`.")
    if not criteria:
        issues.append("❌ criteria.json missing. Run `scripts/04_build_criteria.py` or `04b`.")
    if not processes:
        issues.append("❌ iso_processes.json missing. Run `scripts/03_build_iso_metadata.py`.")
    if not settings.anthropic_api_key or settings.anthropic_api_key.startswith("sk-ant-xxx"):
        issues.append("⚠️ ANTHROPIC_API_KEY not set — classification will fail. Update .env.")

    if issues:
        for i in issues:
            st.error(i) if "❌" in i else st.warning(i)

    # Sidebar
    with st.sidebar:
        st.header("Settings")
        model_choice = st.radio(
            "Model",
            options=[settings.claude_model_primary, settings.claude_model_fast],
            format_func=lambda x: f"Sonnet (quality)" if "sonnet" in x else "Haiku (fast/cheap)",
            index=1,  # Default Haiku for testing (cheaper)
        )

        st.divider()
        st.metric("Docs available", len(docs))
        st.metric("Criteria", criteria.get("total_criteria", 0) if criteria else 0)
        st.metric("Processes", processes.get("total", 0) if processes else 0)

    # Tabs
    tab_classify, tab_corpus, tab_eval = st.tabs([
        "🔍 Classify one doc",
        "📚 Corpus browser",
        "📊 Evaluation",
    ])

    with tab_classify:
        classify_tab(docs, model_choice, criteria, processes)

    with tab_corpus:
        corpus_tab(docs)

    with tab_eval:
        eval_tab(model_choice)


# ─── Tab: Classify one ─────────────────────────────────────
def classify_tab(docs, model: str, criteria: dict, processes: dict):
    """Pick a doc → classify → show result."""

    col_pick, col_info = st.columns([3, 1])
    with col_pick:
        # Organize by dept
        dept_filter = st.selectbox(
            "Filter by department",
            ["All"] + sorted({d["dept"] for d in docs}),
        )

    candidates = docs if dept_filter == "All" else [d for d in docs if d["dept"] == dept_filter]

    if not candidates:
        st.info("No docs match filter.")
        return

    doc_options = {
        f"[{d['dept']}] {d['filename'][:60]}": d for d in candidates[:100]
    }
    picked = st.selectbox("Pick doc", list(doc_options.keys()))
    doc = doc_options[picked]

    # Metadata
    with col_info:
        st.metric("Text length", f"{doc['text_len']:,}")
        st.metric("Pages", doc["npages"])

    # Preview
    with st.expander("📄 Document preview", expanded=False):
        st.caption(doc["path"])
        st.text_area("Text", value=doc["text"][:3000], height=300, disabled=True)

    # Classify button
    if st.button("🏷️ Classify", type="primary", use_container_width=False):
        classifier = get_classifier(model)
        with st.spinner(f"Calling {model}..."):
            result = classifier.classify(DocumentInput.from_jsonl_record(doc))

        # Store in session so feedback buttons work
        st.session_state.last_result = result
        st.session_state.last_doc = doc

    # Show last result
    if "last_result" in st.session_state and st.session_state.last_doc["id"] == doc["id"]:
        show_result(st.session_state.last_result, doc)


def show_result(result, doc):
    """Render classification result nicely."""
    st.divider()
    st.subheader("Classification result")

    if result.parse_error:
        st.error(f"Error: {result.parse_error}")
        if result.raw_response:
            with st.expander("Raw response"):
                st.code(result.raw_response)
        return

    # Metrics row
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Latency", f"{result.latency_ms:,} ms")
    col2.metric("Input tokens", f"{result.tokens_input:,}")
    col3.metric("Output tokens", f"{result.tokens_output:,}")
    col4.metric("Cost", f"{result.cost_vnd:,.0f} VND")

    # ISO processes
    st.markdown("### 📋 ISO Processes (top-3)")
    if not result.iso_processes:
        st.info("No matches found")
    for i, item in enumerate(result.iso_processes):
        with st.container(border=True):
            cols = st.columns([1, 3, 5])
            cols[0].markdown(f"**`{item.id}`**")
            cols[1].markdown(f"**{item.name[:60]}**")
            cols[2].progress(item.confidence, text=f"{item.confidence:.0%}")
            st.caption(f"💡 {item.reasoning}")

    # KĐCLGD criteria
    st.markdown("### 📐 KĐCLGD Criteria (top-5)")
    if not result.kdclgd_criteria:
        st.info("No matches found")
    for item in result.kdclgd_criteria:
        with st.container(border=True):
            cols = st.columns([1, 3, 5])
            cols[0].markdown(f"**`{item.id}`**")
            cols[1].markdown(f"**{item.name[:60]}**")
            cols[2].progress(item.confidence, text=f"{item.confidence:.0%}")
            st.caption(f"💡 {item.reasoning}")

    # Feedback buttons
    st.divider()
    st.markdown("### 💬 Feedback")
    col1, col2, col3 = st.columns(3)
    fb = None
    with col1:
        if st.button("✅ Correct", use_container_width=True):
            fb = {"iso_correct": "correct", "kdclgd_correct": "correct"}
    with col2:
        if st.button("⚠️ Partial", use_container_width=True):
            fb = {"iso_correct": "partial", "kdclgd_correct": "partial"}
    with col3:
        if st.button("❌ Wrong", use_container_width=True):
            fb = {"iso_correct": "wrong", "kdclgd_correct": "wrong"}

    notes = st.text_input("Notes (optional)")

    if fb is not None:
        fb["notes"] = notes
        save_feedback(doc["id"], result.model_dump(mode="json"), fb)
        st.toast(f"Feedback saved: {fb['iso_correct']}", icon="💾")


# ─── Tab: Corpus browser ──────────────────────────────────
def corpus_tab(docs):
    """Quick stats + filterable table of all docs."""
    import pandas as pd

    st.caption(f"{len(docs)} successfully extracted documents")

    # Summary table
    rows = []
    for d in docs:
        rows.append({
            "Dept": d["dept"],
            "Filename": d["filename"][:50],
            "Ext": d["ext"],
            "Pages": d["npages"],
            "Text length": d["text_len"],
        })

    df = pd.DataFrame(rows)

    # Filters
    col1, col2 = st.columns(2)
    with col1:
        dept = st.multiselect("Departments", sorted(df["Dept"].unique()))
    with col2:
        min_len = st.number_input("Min text length", 0, 100000, 0, 500)

    filtered = df
    if dept:
        filtered = filtered[filtered["Dept"].isin(dept)]
    filtered = filtered[filtered["Text length"] >= min_len]

    st.dataframe(filtered, use_container_width=True, height=400)


# ─── Tab: Evaluation ──────────────────────────────────────
def eval_tab(model: str):
    """Run batch evaluation on ground truth."""

    gt_path = settings.data_dir / "ground_truth.json"
    if not gt_path.exists():
        st.warning("No ground truth yet. Run `scripts/labeler.py` first to label ≥ 20 docs.")
        return

    gt = read_json(gt_path)
    n_labels = len(gt.get("labels", []))

    st.metric("Labeled docs", n_labels)

    if n_labels < 5:
        st.warning(f"Only {n_labels} labels — need ≥ 5 to run eval meaningfully.")
        return

    # Run button
    max_docs = st.slider("Max docs to evaluate", 1, n_labels, min(n_labels, 10))

    if st.button("🚀 Run evaluation", type="primary"):
        classifier = get_classifier(model)
        with st.spinner(f"Running classifier on {max_docs} docs ({model})..."):
            out = run_evaluation(classifier, max_docs=max_docs, verbose=False)

        m = out["metrics"]

        # Summary
        st.success(f"✅ Evaluated {m.n_docs} docs")

        col1, col2, col3 = st.columns(3)
        col1.metric(
            "ISO P@1",
            f"{m.iso_precision_at_1:.1%}",
            f"target 70%",
            delta_color="normal" if m.iso_precision_at_1 >= 0.70 else "inverse",
        )
        col2.metric(
            "KĐCLGD R@5",
            f"{m.kdclgd_recall_at_5:.1%}",
            f"target 80%",
            delta_color="normal" if m.kdclgd_recall_at_5 >= 0.80 else "inverse",
        )
        col3.metric(
            "Avg cost",
            f"{m.total_cost_vnd/max(m.n_docs,1):,.0f} VND",
            f"target <1000",
        )

        with st.expander("Full report", expanded=True):
            st.markdown(out["report"])

        with st.expander("Per-doc details"):
            import pandas as pd
            st.dataframe(pd.DataFrame(out["per_doc"]), use_container_width=True)


if __name__ == "__main__":
    main()
