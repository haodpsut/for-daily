"""Ground Truth Labeling App.

Streamlit app for Hảo to manually label 20+ documents.
Each label = (doc → list of ISO processes + list of KĐCLGD criteria).

Run: streamlit run scripts/labeler.py
"""

import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import streamlit as st

from university_quality_os.config import settings
from university_quality_os.utils import read_json, read_jsonl


st.set_page_config(
    page_title="Quality OS — Ground Truth Labeler",
    page_icon="📝",
    layout="wide",
)


# ─── Cache loaders ────────────────────────────────────────
@st.cache_data
def load_docs():
    path = settings.extracted_dir / "iso_texts.jsonl"
    if not path.exists():
        return []
    docs = list(read_jsonl(path))
    # Only successfully extracted docs
    return [d for d in docs if d["extract_status"] == "ok" and d["text_len"] > 200]


@st.cache_data
def load_criteria():
    path = settings.data_dir / "criteria.json"
    if not path.exists():
        return None
    return read_json(path)


@st.cache_data
def load_processes():
    path = settings.data_dir / "iso_processes.json"
    if not path.exists():
        return None
    return read_json(path)


def load_labels():
    path = settings.data_dir / "ground_truth.json"
    if not path.exists():
        return {"labels": [], "metadata": {"target_count": 20}}
    return read_json(path)


def save_labels(data):
    path = settings.data_dir / "ground_truth.json"
    data["metadata"]["last_updated"] = datetime.now().isoformat()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─── Main ────────────────────────────────────────────────
def main():
    st.title("📝 Ground Truth Labeler")
    st.caption("Label documents để tạo test set cho MVP-1 evaluation")

    # Load data
    docs = load_docs()
    criteria_data = load_criteria()
    processes_data = load_processes()
    labels_data = load_labels()

    # Validate prerequisites
    issues = []
    if not docs:
        issues.append("❌ No extracted docs. Run `scripts/02_extract_text.py` first.")
    if not criteria_data:
        issues.append("❌ No criteria.json. Run `scripts/04_build_criteria.py` first.")
    if not processes_data:
        issues.append("❌ No iso_processes.json. Run `scripts/03_build_iso_metadata.py` first.")

    if issues:
        for i in issues:
            st.error(i)
        st.stop()

    # Sidebar — progress
    with st.sidebar:
        st.header("Progress")
        n_labeled = len(labels_data["labels"])
        target = labels_data["metadata"]["target_count"]

        st.metric("Labeled", f"{n_labeled} / {target}")
        st.progress(min(n_labeled / target, 1.0))

        if n_labeled >= target:
            st.success("🎉 Target reached!")

        st.divider()

        # Mode selector
        mode = st.radio(
            "Mode",
            ["Label new doc", "Review labels", "Stats"],
            label_visibility="collapsed",
        )

        st.divider()

        # Quick stats
        st.subheader("Stats")
        if labels_data["labels"]:
            depts_labeled = set(
                next((d["dept"] for d in docs if d["id"] == lbl["doc_id"]), None)
                for lbl in labels_data["labels"]
            )
            st.text(f"Dept covered: {len(depts_labeled)} / 11")

            n_crit_per = [len(lbl["kdclgd_criteria"]) for lbl in labels_data["labels"]]
            avg_crit = sum(n_crit_per) / max(len(n_crit_per), 1)
            st.text(f"Avg crit/doc: {avg_crit:.1f}")

    # Main panel
    if mode == "Label new doc":
        label_panel(docs, criteria_data, processes_data, labels_data)
    elif mode == "Review labels":
        review_panel(docs, criteria_data, processes_data, labels_data)
    else:
        stats_panel(docs, criteria_data, processes_data, labels_data)


# ─── Label panel ─────────────────────────────────────────
def label_panel(docs, criteria_data, processes_data, labels_data):
    """Main labeling workflow."""

    # Find unlabeled docs
    labeled_ids = {lbl["doc_id"] for lbl in labels_data["labels"]}
    unlabeled = [d for d in docs if d["id"] not in labeled_ids]

    if not unlabeled:
        st.success("All available docs labeled! Switch to Review mode.")
        return

    # Pick: option to filter by dept
    all_depts = sorted({d["dept"] for d in unlabeled})

    col1, col2 = st.columns([3, 1])
    with col2:
        dept_filter = st.selectbox(
            "Dept filter",
            ["All"] + all_depts,
            help="Pick a specific department or All",
        )
    with col1:
        st.caption(f"Available: {len(unlabeled)} unlabeled docs")

    # Filter
    if dept_filter != "All":
        candidates = [d for d in unlabeled if d["dept"] == dept_filter]
    else:
        candidates = unlabeled

    if not candidates:
        st.warning("No docs match filter")
        return

    # Pick the doc — let user choose or first
    doc_options = {f"[{d['dept']}] {d['filename']}": d for d in candidates[:50]}
    selected_label = st.selectbox(
        "Choose doc to label",
        options=list(doc_options.keys()),
    )
    doc = doc_options[selected_label]

    st.divider()

    # ─── Doc preview ───
    col_meta, col_actions = st.columns([3, 1])
    with col_meta:
        st.subheader(doc["filename"])
        st.caption(
            f"Dept: {doc['dept']}  •  "
            f"Pages: {doc['npages']}  •  "
            f"Length: {doc['text_len']:,} chars  •  "
            f"Path: `{doc['path']}`"
        )

    with col_actions:
        st.metric("Doc text length", f"{doc['text_len']:,}")

    # Show text
    with st.expander("📄 Document content (preview)", expanded=True):
        preview_chars = st.slider("Preview length", 500, 8000, 3000, 500)
        st.text_area(
            "Content",
            value=doc["text"][:preview_chars],
            height=400,
            label_visibility="collapsed",
            disabled=True,
        )
        if doc["text_len"] > preview_chars:
            st.caption(f"… ({doc['text_len'] - preview_chars:,} more chars)")

    st.divider()

    # ─── Labels ───
    st.subheader("🏷️ Labels")

    # Flatten options
    all_processes = [(p["id"], p["name"], p["dept_full"]) for p in processes_data["processes"]]
    all_criteria = []
    for std in criteria_data["standards"]:
        for crit in std["criteria"]:
            all_criteria.append((crit["id"], crit["name"], std["name"]))

    # Sort processes: same dept first
    same_dept_first = sorted(
        all_processes,
        key=lambda x: (x[2] != "Phòng " + doc["dept"].replace("P.", "").replace("KHAO THI", "Khảo thí"), x[0]),
    )

    col_proc, col_crit = st.columns(2)

    with col_proc:
        st.markdown("**ISO Process** (chọn 1-3, ưu tiên cùng phòng)")
        proc_selected = st.multiselect(
            "Processes",
            options=same_dept_first,
            format_func=lambda x: f"{x[0]} — {x[1][:60]}",
            max_selections=3,
            label_visibility="collapsed",
            key=f"proc_{doc['id']}",
        )

    with col_crit:
        st.markdown("**KĐCLGD criteria** (chọn 1-10)")
        crit_selected = st.multiselect(
            "Criteria",
            options=all_criteria,
            format_func=lambda x: f"{x[0]} — {x[1][:50]} (Std: {x[2][:30]})",
            max_selections=10,
            label_visibility="collapsed",
            key=f"crit_{doc['id']}",
        )

    notes = st.text_area(
        "💭 Notes (optional)",
        placeholder="Tại sao? Pattern bạn thấy? Hints cho AI?",
        key=f"notes_{doc['id']}",
        height=80,
    )

    # ─── Save ───
    col_save, col_skip, _ = st.columns([1, 1, 4])
    with col_save:
        if st.button("💾 Save label", type="primary", use_container_width=True, disabled=not (proc_selected or crit_selected)):
            label = {
                "doc_id": doc["id"],
                "doc_path": doc["path"],
                "doc_filename": doc["filename"],
                "dept": doc["dept"],
                "iso_processes": [p[0] for p in proc_selected],
                "kdclgd_criteria": [c[0] for c in crit_selected],
                "notes": notes,
                "labeled_at": datetime.now().isoformat(),
            }
            labels_data["labels"].append(label)
            save_labels(labels_data)
            st.toast("Saved!", icon="✅")
            st.rerun()

    with col_skip:
        if st.button("⏭️ Skip", use_container_width=True):
            st.toast("Skipped", icon="⏭️")
            st.rerun()


# ─── Review panel ────────────────────────────────────────
def review_panel(docs, criteria_data, processes_data, labels_data):
    """Review and edit existing labels."""

    if not labels_data["labels"]:
        st.info("No labels yet. Switch to 'Label new doc' mode.")
        return

    st.subheader(f"Reviewing {len(labels_data['labels'])} labels")

    # Show as table
    rows = []
    for lbl in labels_data["labels"]:
        rows.append({
            "Doc": lbl["doc_filename"][:40],
            "Dept": lbl["dept"],
            "# Processes": len(lbl["iso_processes"]),
            "# Criteria": len(lbl["kdclgd_criteria"]),
            "Has notes": "✓" if lbl.get("notes") else "",
            "Labeled": lbl["labeled_at"][:10],
        })

    st.dataframe(rows, use_container_width=True, height=400)

    # Edit specific
    st.divider()
    st.subheader("Edit a label")

    label_options = {
        f"{lbl['doc_filename']} [{lbl['dept']}]": i
        for i, lbl in enumerate(labels_data["labels"])
    }
    selected = st.selectbox("Pick", list(label_options.keys()))

    if selected:
        idx = label_options[selected]
        lbl = labels_data["labels"][idx]
        with st.expander("Details", expanded=True):
            st.json(lbl)
            if st.button("🗑️ Delete this label", type="secondary"):
                labels_data["labels"].pop(idx)
                save_labels(labels_data)
                st.toast("Deleted", icon="🗑️")
                st.rerun()


# ─── Stats panel ─────────────────────────────────────────
def stats_panel(docs, criteria_data, processes_data, labels_data):
    """Statistics on labeling progress."""

    st.subheader("📊 Labeling Statistics")

    if not labels_data["labels"]:
        st.info("No labels yet")
        return

    # By dept
    from collections import Counter
    dept_counts = Counter(lbl["dept"] for lbl in labels_data["labels"])

    st.markdown("**Labels per department**")
    st.bar_chart(dept_counts)

    # Criteria coverage
    crit_counts = Counter()
    for lbl in labels_data["labels"]:
        for cid in lbl["kdclgd_criteria"]:
            crit_counts[cid] += 1

    st.markdown("**Criteria coverage** (which TC has labeled evidence)")
    st.write(f"Unique criteria covered: {len(crit_counts)} / 60")
    if crit_counts:
        top = crit_counts.most_common(15)
        st.bar_chart(dict(top))

    # Distribution
    st.markdown("**Criteria-per-doc distribution**")
    n_per = [len(lbl["kdclgd_criteria"]) for lbl in labels_data["labels"]]
    st.write(f"Min: {min(n_per)} | Max: {max(n_per)} | Avg: {sum(n_per)/len(n_per):.1f}")


if __name__ == "__main__":
    main()
