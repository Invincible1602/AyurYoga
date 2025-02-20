from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv  
import logging

# Load environment variables
load_dotenv()
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

RELEVANCE_THRESHOLD = 1.0
TOP_K = 3  # Number of results to retrieve

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load SentenceTransformer model
model = SentenceTransformer(EMBEDDING_MODEL)

# Load FAISS index & text data with error handling
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

# Flask App Initialization
app = Flask(__name__)
CORS(app)

def search_similar_text(query):
    """Search for similar text using FAISS."""
    if index is None:
        logging.error("FAISS index is not loaded.")
        return []

    query_embedding = model.encode([query], convert_to_numpy=True)

    # Ensure query_embedding has correct shape (1, d)
    query_embedding = np.array(query_embedding).reshape(1, -1)

    try:
        distances, indices = index.search(query_embedding, TOP_K)
        relevant_texts = [text_data[i] for i, d in zip(indices[0], distances[0]) if d <= RELEVANCE_THRESHOLD]
        logging.info(f"Retrieved {len(relevant_texts)} relevant texts for query: {query}")
        return relevant_texts
    except Exception as e:
        logging.error(f"Error in FAISS search: {e}")
        return []

def query_huggingface(prompt):
    """Query Hugging Face model with relevant context."""
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
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=15)
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

@app.route("/")
def home():
    return "Welcome to your Yoga Chatbot! Ask me anything about yoga, health, and wellness."

@app.route("/get_response", methods=["POST"])
def get_response():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"response": "Hey there! Please ask me a question so I can assist you."}), 400

    user_input = data["message"]
    bot_response = query_huggingface(user_input)
    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
