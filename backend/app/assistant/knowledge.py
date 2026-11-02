"""
TerraProof Assistant Knowledge Retrieval Engine
Searches and retrieves ground-truth sections from /data/knowledge markdown files.
"""

import os
import re
from typing import List, Dict, Any

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
KNOWLEDGE_DIR = os.path.join(REPO_ROOT, "data", "knowledge")

def load_all_knowledge_documents() -> List[Dict[str, str]]:
    """Loads all markdown knowledge documents from disk."""
    docs = []
    if not os.path.exists(KNOWLEDGE_DIR):
        return docs

    for fname in os.listdir(KNOWLEDGE_DIR):
        if fname.endswith(".md"):
            fpath = os.path.join(KNOWLEDGE_DIR, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                    docs.append({
                        "filename": fname,
                        "title": fname.replace(".md", "").replace("_", " ").title(),
                        "content": content
                    })
            except Exception as e:
                print(f"Error loading {fname}: {e}")
    return docs

def retrieve_relevant_knowledge(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """Simple keyword-scoring retrieval across knowledge docs."""
    docs = load_all_knowledge_documents()
    if not docs:
        return []

    tokens = set(re.findall(r"\w+", query.lower()))
    scored_docs = []

    for doc in docs:
        score = 0
        doc_lower = doc["content"].lower()
        title_lower = doc["title"].lower()

        for token in tokens:
            if len(token) <= 2:
                continue
            # Title matches have high weight
            if token in title_lower:
                score += 5
            score += doc_lower.count(token)

        if score > 0:
            # Extract first 400 characters of best matching section
            scored_docs.append({
                "filename": doc["filename"],
                "title": doc["title"],
                "score": score,
                "summary": doc["content"][:450].strip() + "..."
            })

    scored_docs.sort(key=lambda x: x["score"], reverse=True)
    return scored_docs[:top_k]
