import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"  # Disable parallelism to avoid tokenizers warnings
import logging
import pickle
import gzip
import numpy as np
import faiss
from fastapi import FastAPI, HTTPException, Depends, status, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from simple_image_download import simple_image_download as simp
from sentence_transformers import SentenceTransformer
from langchain.llms import HuggingFaceHub

# Load environment variables
load_dotenv()

# Configuration & Initialization
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in the environment variables.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="AyurYoga Backend - Image & Chatbot")

origins = [
    "https://invincible1602.github.io",
    "http://localhost:3000",
    "http://192.168.29.55:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Setup (Simplified)
DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from fastapi import Header

async def get_current_user(
    token: str = Query(None, description="JWT token as query parameter"),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if token is None and authorization:
        token = authorization.split("Bearer ")[-1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        db_user = db.query(UserModel).filter(UserModel.username == username).first()
        if db_user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return username

# -------------------------------
# FAISS & Text Data Setup
# -------------------------------
INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl.gz"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RELEVANCE_THRESHOLD = 1.0
TOP_K = 3

# Global Variables
_index = None
_text_data = None
_model = None

def load_model_and_index():
    """Loads the Sentence Transformer model, FAISS index, and text data."""
    global _model, _index, _text_data

    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)

    # Load compressed text data
    if os.path.exists(DATA_PATH):
        logging.info("Loading compressed text data...")
        with gzip.open(DATA_PATH, "rb") as f:
            _text_data = pickle.load(f)
        logging.info(f"Loaded {len(_text_data)} text entries successfully.")
    else:
        raise FileNotFoundError(f"Text data file '{DATA_PATH}' is missing.")

    # Load FAISS index
    if os.path.exists(INDEX_PATH):
        logging.info("Loading FAISS index...")
        with open(INDEX_PATH, "rb") as f:
            _index = pickle.load(f)
        if not (hasattr(_index, "search") and callable(_index.search)):
            raise ValueError("Loaded FAISS index is not a valid index object")
        logging.info("FAISS index loaded successfully.")
    else:
        raise FileNotFoundError(f"FAISS index file '{INDEX_PATH}' is missing.")

    return _model, _index, _text_data

def search_similar_text_chat(query: str):
    """Finds the most similar text to a query using FAISS."""
    try:
        model, index, text_data = load_model_and_index()
    except Exception as e:
        logging.info(f"Error loading model/index: {e}")
        return []

    query_embedding = model.encode([query], convert_to_numpy=True).reshape(1, -1)

    try:
        distances, indices = index.search(query_embedding, TOP_K)
        relevant_texts = [
            text_data[i] for i, d in zip(indices[0], distances[0]) if d <= RELEVANCE_THRESHOLD
        ]
        logging.info(f"Retrieved {len(relevant_texts)} relevant texts for query: {query}")
        return relevant_texts
    except Exception as e:
        logging.info(f"Error in FAISS search: {e}")
        return []

# Instantiate the model using HuggingFaceHub with the specified parameters
llm = HuggingFaceHub(
    repo_id="mistralai/Mistral-7B-Instruct-v0.3",
    model_kwargs={'temperature': 0.6, 'max_length': 500},
    huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY")
)

def query_chatbot(prompt: str) -> str:
    """Generates a chatbot response based on retrieved text data."""
    retrieved_text = search_similar_text_chat(prompt)
    if not retrieved_text:
        return "Sorry, no relevant response found. Try specifying the name of a yoga pose."

    formatted_context = "\n".join([f"{i+1}. {text}" for i, text in enumerate(retrieved_text)])
    full_prompt = (
        "You are an expert in yoga, health, and wellness. "
        "Use the provided context to answer the user's question clearly and concisely.\n\n"
        f"Context:\n{formatted_context}\n\n"
        f"User Query: {prompt}\n"
        "Provide a structured response including key points."
    )

    try:
        generated_text = llm.invoke(full_prompt)
        return generated_text if generated_text else "I'm experiencing issues with the chatbot model."
    except Exception as e:
        logging.info(f"HuggingFaceHub query error: {e}")
        return "I'm experiencing issues with the chatbot model."

# -------------------------------
# API Endpoints
# -------------------------------
@app.post("/get_response")
def get_response(data: dict):
    """API endpoint to get chatbot responses."""
    if not data or "message" not in data:
        raise HTTPException(status_code=400, detail="Please provide a valid question.")
    user_input = data["message"]
    bot_response = query_chatbot(prompt=user_input)
    return {"response": bot_response}

@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "Welcome to the AyurYoga Backend!"}

# -------------------------------
# Main: Running the API with Uvicorn
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main1:app", host="0.0.0.0", port=8000, reload=True)
