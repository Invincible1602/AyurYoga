import os
import difflib
import pickle
import logging
import numpy as np
import pandas as pd
from typing import List, Optional
from datetime import datetime, timedelta
import requests

from fastapi import FastAPI, HTTPException, Depends, status, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from passlib.context import CryptContext
from jose import JWTError, jwt

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from dotenv import load_dotenv

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
# Authentication Setup
# -------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
users_db = {}  # Simple in-memory user "database"

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

# Updated dependency: get token from query parameter or Authorization header
async def get_current_user(
    token: Optional[str] = Query(None, description="JWT token as query parameter"),
    authorization: Optional[str] = Header(None)
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
        if username is None or username not in users_db:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return username

# -------------------------------
# Recommendation Setup
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
# Chatbot Setup with FAISS Integration
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

def search_similar_text(query: str):
    if index is None:
        logging.error("FAISS index is not loaded.")
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
        logging.error(f"Error in FAISS search: {e}")
        return []

def query_huggingface(prompt: str) -> str:
    HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
    if not HF_API_KEY:
        logging.error("Hugging Face API key is missing.")
        return "Sorry, I can't process your request right now."
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    retrieved_text = search_similar_text(prompt)
    if not retrieved_text:
        return "Sorry, no relevant response found."
    formatted_context = "\n".join([f"{i+1}. {text}" for i, text in enumerate(retrieved_text)])
    full_prompt = (
        "You are an expert in yoga, health, and wellness. "
        "Use the provided context to answer the user's question clearly and concisely.\n\n"
        f"Context:\n{formatted_context}\n\n"
        f"User Query: {prompt}\n"
        "Provide a structured response including key points."
    )
    payload = {"inputs": full_prompt}
    try:
        response = requests.post("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
                                 headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and result and "generated_text" in result[0]:
                generated_text = result[0]["generated_text"].strip()
                return generated_text if generated_text else "Sorry, I couldn't generate a response."
        logging.error(f"Hugging Face API response error: {response.status_code} {response.text}")
        return "I'm experiencing technical difficulties. Please try again later."
    except requests.exceptions.RequestException as e:
        logging.error(f"Request error to Hugging Face API: {e}")
        return "I'm experiencing connectivity issues. Please try again later."

# -------------------------------
# API Endpoints
# -------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the AyurYoga FastAPI backend!"}

@app.post("/register/", response_model=dict)
def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[user.username] = get_password_hash(user.password)
    return {"message": "User registered successfully"}

@app.post("/login/", response_model=Token)
def login(user: User):
    if user.username not in users_db or not verify_password(user.password, users_db[user.username]):
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
