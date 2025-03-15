import os
import difflib
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
from jose.exceptions import ExpiredSignatureError 
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# New import for image search functionality:
from simple_image_download import simple_image_download as simp

load_dotenv()

# -------------------------------
# Configuration & Initialization
# -------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in the environment variables.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="AyurYoga Backend - Auth, Recommendation & Image Search")

origins = [
    "https://invincible1602.github.io",  # Deployed frontend
    "http://localhost:3000",              # Local development
    "http://192.168.29.55:3000",            # Local network testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

async def get_current_user(
    token: Optional[str] = Query(None, description="JWT token as query parameter"),
    authorization: Optional[str] = Header(None),
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
# API Endpoints for Authentication, Recommendation & Image Search
# -------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the AyurYoga Backend (Auth, Recommendation & Image Search)!"}

@app.post("/register/", response_model=dict)
def register(user: User, db: Session = Depends(get_db)):
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

# -------------------------------
# IMAGE SEARCH ENDPOINT
# -------------------------------
@app.get("/search-images", response_model=List[str])
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
