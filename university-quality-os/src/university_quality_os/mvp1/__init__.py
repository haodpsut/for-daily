"""MVP-1 — Document Classifier Agent.

Given a document (extracted text + metadata), classify:
- ISO process (top-3 with confidence)
- KĐCLGD criteria (top-5 with confidence)
- Citation reasoning for each

See: de-an-thanh-lap-cong-ty/mvp/mvp-01-document-classifier.md
"""

from .classifier import DocumentClassifier
from .schemas import ClassificationResult, ClassificationItem, DocumentInput

__all__ = ["DocumentClassifier", "ClassificationResult", "ClassificationItem", "DocumentInput"]
