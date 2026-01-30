from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import FAISS_INDEX_PATH, EMBEDDINGS_MODEL, SIMILARITY_TOP_K

_vectorstore = None


def load_vectorstore():
    global _vectorstore
    print("Carregando modelo de embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
    print("Carregando índice FAISS...")
    _vectorstore = FAISS.load_local(
        FAISS_INDEX_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )
    print(f"FAISS vectorstore loaded: {FAISS_INDEX_PATH}")
    return _vectorstore


def search_similar(query, k=None):
    if k is None:
        k = SIMILARITY_TOP_K
    if _vectorstore is None:
        raise RuntimeError("Vectorstore não carregado. Chame load_vectorstore() primeiro.")
    # multilingual-e5 requires "query: " prefix for queries
    prefixed_query = f"query: {query}"
    docs = _vectorstore.similarity_search(prefixed_query, k=k)
    results = []
    for doc in docs:
        # Remove "passage: " prefix added during indexing
        content = doc.page_content
        if content.startswith("passage: "):
            content = content[9:]
        results.append({
            "content": content,
            "source": doc.metadata.get("source", ""),
            "doc_type": doc.metadata.get("doc_type", ""),
            "page": doc.metadata.get("page", 0),
            "article": doc.metadata.get("article"),
            "chunk_index": doc.metadata.get("chunk_index", 0),
        })
    return results


def build_context(search_results):
    context_parts = []
    for i, result in enumerate(search_results, 1):
        header = f"[Fonte {i}] "
        if result["doc_type"] == "clt":
            header += f"CLT - Página {result['page']}"
            if result.get("article"):
                header += f" - {result['article']}"
        elif result["doc_type"] == "trt3":
            header += f"TRT3/MG - Página {result['page']}"
        else:
            header += f"{result['source']} - Página {result['page']}"
        context_parts.append(f"{header}\n{result['content']}")
    return "\n\n---\n\n".join(context_parts)
