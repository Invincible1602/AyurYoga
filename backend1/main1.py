import os
import logging
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException, Depends, status, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from simple_image_download import simple_image_download as simp
from sentence_transformers import SentenceTransformer
from ollama import chat
import faiss

load_dotenv()

# -------------------------------
# Configuration & Initialization
# -------------------------------
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

# -------------------------------
# Minimal Authentication Setup (for protected endpoints)
# -------------------------------
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        db_user = db.query(UserModel).filter(UserModel.username == username).first()
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is expired",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return username

# -------------------------------
# Image Search Endpoint Setup
# -------------------------------
@app.get("/search-images", response_model=list)
def search_images(prompt: str, current_user: str = Depends(get_current_user)):
    allowed_keywords = [
        "yoga", "asana", "pose", "ayurveda", "ayurvedic", "pranayama",
        "surya namaskar", "kapalbhati", "bhastrika", "anulom vilom",
    ]
    if not any(keyword in prompt.lower() for keyword in allowed_keywords):
        raise HTTPException(
            status_code=400,
            detail="Prompt must include one of the allowed keywords."
        )
    
    try:
        downloader = simp.simple_image_download()
        results = downloader.urls(prompt, 3)
        image_urls = []
        if isinstance(results, list):
            image_urls = results
        elif isinstance(results, dict):
            for key, urls in results.items():
                image_urls = urls
                break
        else:
            raise ValueError("No images found")
        if not image_urls:
            raise HTTPException(status_code=404, detail="No images found for the prompt")
        return image_urls
    except Exception as e:
        logging.error("Error searching images: " + str(e))
        raise HTTPException(status_code=500, detail="Error searching images")

# -------------------------------
# Chatbot (FAISS & Ollama) Setup with Lazy-Loading
# -------------------------------
INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RELEVANCE_THRESHOLD = 1.0
TOP_K = 3

# Global placeholders (loaded lazily)
_index = None
_text_data = None
_model = None

def load_model_and_index():
    global _model, _index, _text_data
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    if _index is None or not _text_data:
        if os.path.exists(INDEX_PATH) and os.path.exists(DATA_PATH):
            with open(INDEX_PATH, "rb") as f:
                _index = pickle.load(f)
            with open(DATA_PATH, "rb") as f:
                _text_data = pickle.load(f)
            if not isinstance(_index, faiss.IndexFlatL2):
                raise ValueError("Loaded FAISS index is not a valid IndexFlatL2 object")
            logging.info("FAISS index and text data loaded successfully!")
        else:
            raise FileNotFoundError("FAISS index or text data file is missing.")
    return _model, _index, _text_data

def search_similar_text_chat(query: str):
    try:
        model, index, text_data = load_model_and_index()
    except Exception as e:
        logging.info("Error loading model/index: " + str(e))
        return []
    query_embedding = model.encode([query], convert_to_numpy=True)
    query_embedding = np.array(query_embedding).reshape(1, -1)
    try:
        distances, indices = index.search(query_embedding, TOP_K)
        relevant_texts = [
            text_data[i] for i, d in zip(indices[0], distances[0])
            if d <= RELEVANCE_THRESHOLD
        ]
        logging.info(f"Retrieved {len(relevant_texts)} relevant texts for query: {query}")
        return relevant_texts
    except Exception as e:
        logging.info(f"Error in FAISS search: {e}")
        return []

def query_chatbot(prompt: str) -> str:
    retrieved_text = search_similar_text_chat(prompt)
    if not retrieved_text:
        return ("Sorry, no relevant response found. "
                "If you are directly searching for an asana, try specifying it with a yoga pose name.")
    formatted_context = "\n".join([f"{i+1}. {text}" for i, text in enumerate(retrieved_text)])
    full_prompt = (
        "You are an expert in yoga, health, and wellness. "
        "Use the provided context to answer the user's question clearly and concisely.\n\n"
        f"Context:\n{formatted_context}\n\n"
        f"User Query: {prompt}\n"
        "Provide a structured response including key points."
    )
    try:
        response = chat(
            model='llama3.1',
            messages=[{'role': 'user', 'content': full_prompt}],
        )
        generated_text = response.get("message", {}).get("content", "").strip()
        if generated_text:
            return generated_text
        else:
            raise ValueError("Empty response from model.")
    except Exception as e:
        logging.info("Ollama query error: " + str(e))
        return "I'm experiencing issues with the local model. Please try again later."

# -------------------------------
# API Endpoint for Chatbot Response
# -------------------------------
@app.post("/get_response")
def get_response(data: dict):
    if not data or "message" not in data:
        raise HTTPException(status_code=400, detail="Please provide a valid question.")
    user_input = data["message"]
    bot_response = query_chatbot(prompt=user_input)
    return {"response": bot_response}

# -------------------------------
# Root Endpoint
# -------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the AyurYoga Backend (Image & Chatbot)!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main1:app", host="0.0.0.0", port=8001, reload=True)
