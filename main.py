import os
import difflib
import pickle
import logging
import numpy as np
import pandas as pd
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError  # For expired tokens
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from ollama import chat  # Use the Ollama chat function
from simple_image_download import simple_image_download as simp  # For Yoga Image Generator

# SQLAlchemy Imports for Database Integration
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Load environment variables
load_dotenv()

# -------------------------------
# Configuration & Initialization
# -------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in the environment variables.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="AyurYoga Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Database Setup (SQLite + SQLAlchemy)
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

Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# Authentication Setup
# -------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# We no longer use an in-memory users_db

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Updated dependency: get token from query parameter or Authorization header and check in DB.
async def get_current_user(
    token: Optional[str] = Query(None, description="JWT token as query parameter"),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if token is None and authorization:
        # Expect header in format "Bearer <token>"
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
        # Check if user exists in the database
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
# Recommendation Setup (unchanged)
# -------------------------------
try:
    df = pd.read_csv("yoga_asanas_and_diseases.csv")
except Exception as e:
    raise RuntimeError("Could not load CSV file. Please ensure 'yoga_asanas_and_diseases.csv' exists.") from e

selected_features = [
    'Disease 1', 'Disease 2', 'Disease 3', 'Disease 4', 'Disease 5',
    'Should Not Perform Reason 1', 'Should Not Perform Reason 2',
    'Should Not Perform 3', 'Should Not Perform 4', 'Should Not Perform 5'
]
for feature in selected_features:
    if feature in df.columns:
        df[feature] = df[feature].fillna("")
    else:
        df[feature] = ""

if "Index" not in df.columns:
    df["Index"] = df.index

combined_features = (
    df['Disease 1'] + " " +
    df['Disease 2'] + " " +
    df['Disease 3'] + " " +
    df['Disease 4'] + " " +
    df['Disease 5'] + " " +
    df['Should Not Perform Reason 1'] + " " +
    df['Should Not Perform Reason 2'] + " " +
    df['Should Not Perform 3'] + " " +
    df['Should Not Perform 4'] + " " +
    df['Should Not Perform 5']
)

vectorizer = TfidfVectorizer()
feature_vectors = vectorizer.fit_transform(combined_features)
similarity = cosine_similarity(feature_vectors)

def suggest_asanas(name: str) -> List[dict]:
    suggested_asanas = set()
    results = []
    for column in ['Disease 1', 'Disease 2', 'Disease 3', 'Disease 4', 'Disease 5']:
        matches = difflib.get_close_matches(name, df[column].tolist(), n=1)
        if matches:
            close_match = matches[0]
            indices = df[df[column] == close_match]['Index'].values
            if len(indices) > 0:
                sim_scores = list(enumerate(similarity[indices[0]]))
                sorted_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
                count = 0
                for idx, score in sorted_scores:
                    asana_info = df[df['Index'] == idx]
                    if not asana_info.empty:
                        asana_name = asana_info['Asana Name'].values[0] if "Asana Name" in asana_info.columns else f"Asana_{idx}"
                        reasons = []
                        for j in range(1, 6):
                            col_name = f"Should Not Perform Reason {j}"
                            if col_name in asana_info.columns:
                                reason = asana_info[col_name].values[0]
                                if reason:
                                    reasons.append(reason)
                        asana_tuple = (asana_name, tuple(reasons))
                        if asana_tuple not in suggested_asanas:
                            suggested_asanas.add(asana_tuple)
                            if count < 20:
                                results.append({
                                    "Asana Name": asana_name,
                                    "Reasons Not to Perform": reasons
                                })
                                count += 1
                if results:
                    break
    return results

# -------------------------------
# Chatbot Setup with FAISS Integration (unchanged)
# -------------------------------
import faiss
logging.basicConfig(level=logging.INFO)

INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RELEVANCE_THRESHOLD = 1.0
TOP_K = 3

from sentence_transformers import SentenceTransformer
model = SentenceTransformer(EMBEDDING_MODEL)

try:
    if os.path.exists(INDEX_PATH) and os.path.exists(DATA_PATH):
        with open(INDEX_PATH, "rb") as f:
            index = pickle.load(f)
        with open(DATA_PATH, "rb") as f:
            text_data = pickle.load(f)
        if not isinstance(index, faiss.IndexFlatL2):
            raise ValueError("Loaded FAISS index is not a valid IndexFlatL2 object")
        logging.info("FAISS index and text data loaded successfully!")
    else:
        raise FileNotFoundError("FAISS index or text data file is missing.")
except Exception as e:
    logging.error(f"Error loading FAISS index or text data: {e}")
    index, text_data = None, []

def search_similar_text_chat(query: str):
    if index is None:
        logging.info("FAISS index is not loaded.")
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

def query_huggingface(prompt: str) -> str:
    """
    Query the local Llama 3.1 model using the Ollama library.
    (Note: Despite the function name, it now uses Ollama.)
    """
    retrieved_text = search_similar_text_chat(prompt)
    if not retrieved_text:
        return "Sorry, no relevant response found. If you are directly searching for asana, then write it with yoga asana like Navasana yoga pose"
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
            raise ValueError("Empty response from model with full prompt.")
    except Exception as e:
        logging.info("Ollama query error: " + str(e))
        return "I'm experiencing issues with the local model. Please try again later."

# -------------------------------
# API Endpoints
# -------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the AyurYoga FastAPI backend!"}

@app.post("/register/", response_model=dict)
def register(user: User, db: Session = Depends(get_db)):
    # Check if user already exists in the database
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = get_password_hash(user.password)
    new_user = UserModel(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@app.post("/login/", response_model=Token)
def login(user: User, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/recommend/", response_model=List[dict])
def recommend(disease: str, current_user: str = Depends(get_current_user)):
    valid_diseases = [
        'Anxiety', 'Digestive Issues', 'Poor Posture', 'Insomnia',
        'Asthma', 'Fatigue', 'Back Pain', 'Sciatica', 'Depression', 'Stress',
        'Endocrine Problems (Diabetes/Infertility/Thyroid)', 'Respiratory Diseases',
        'Muscular/Skeletal Problems', 'Urinary Issues', 'Nervous System (Brain Fever/Mental Disease)'
    ]
    if disease not in valid_diseases:
        raise HTTPException(status_code=400, detail="Unsupported disease. Please select a valid one.")
    suggestions = suggest_asanas(disease)
    if not suggestions:
        raise HTTPException(status_code=404, detail="No asana suggestions found for the selected disease.")
    return suggestions

@app.get("/search-images", response_model=List[str])
def search_images(prompt: str, current_user: str = Depends(get_current_user)):
    """
    Endpoint for the Yoga Image Generator.
    Validates that the prompt includes an allowed keyword and returns image URLs.
    """
    allowed_keywords = [
        "yoga", "asana", "pose", "ayurveda", "ayurvedic", "pranayama",
        "surya namaskar", "kapalbhati", "bhastrika", "anulom vilom",
    ]
    if not any(keyword in prompt.lower() for keyword in allowed_keywords):
        raise HTTPException(
            status_code=400,
            detail="Prompt must include one of the following keywords: yoga, asana, pose, ayurveda, ayurvedic, pranayama, surya namaskar"
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

@app.post("/get_response")
def get_response(data: dict):
    if not data or "message" not in data:
        raise HTTPException(status_code=400, detail="Please provide a valid question.")
    user_input = data["message"]
    bot_response = query_huggingface(prompt=user_input)
    return {"response": bot_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
