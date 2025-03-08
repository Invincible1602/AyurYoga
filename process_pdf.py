import fitz  # PyMuPDF
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
import os

PDF_PATH = "2100-Asanas.pdf"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"

# Load Sentence Transformer model
model = SentenceTransformer(EMBEDDING_MODEL)

def extract_text_from_pdf(pdf_path):
    """Extracts text from PDF and returns a list of text chunks."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Error: PDF file '{pdf_path}' not found!")

    doc = fitz.open(pdf_path)
    text_chunks = [page.get_text("text") for page in doc if page.get_text("text").strip()]
    
    if not text_chunks:
        raise ValueError("Error: Extracted text is empty. Please check the PDF content.")

    return text_chunks

def create_embeddings(text_chunks):
    """Generates embeddings and stores them in FAISS for fast retrieval."""
    if not text_chunks:
        raise ValueError("Error: No text data to process.")

    embeddings = model.encode(text_chunks, convert_to_numpy=True)

    # Ensure embeddings are 2D
    embeddings = np.array(embeddings).astype('float32')

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
try:
    text_data = extract_text_from_pdf(PDF_PATH)
    create_embeddings(text_data)
except Exception as e:
    print(f"❌ Error: {e}")
