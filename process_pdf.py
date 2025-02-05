import fitz  # PyMuPDF
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle

PDF_PATH = "2100-Asanas.pdf"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"

# Load Sentence Transformer model
model = SentenceTransformer(EMBEDDING_MODEL)

def extract_text_from_pdf(pdf_path):
    """Extracts text from PDF and returns a list of text chunks."""
    doc = fitz.open(pdf_path)
    text_chunks = [page.get_text("text") for page in doc]
    return text_chunks

def create_embeddings(text_chunks):
    """Generates embeddings and stores them in FAISS for fast retrieval."""
    embeddings = model.encode(text_chunks, convert_to_numpy=True)
    
    # Create FAISS index
    index = faiss.IndexFlatL2(embeddings.shape[1])  
    index.add(embeddings)
    
    # Save index and text data
    with open(INDEX_PATH, "wb") as f:
        pickle.dump(index, f)
    with open(DATA_PATH, "wb") as f:
        pickle.dump(text_chunks, f)

    print(f"✅ Embeddings created and stored in FAISS!")

# Run extraction & embedding
text_data = extract_text_from_pdf(PDF_PATH)
create_embeddings(text_data)
