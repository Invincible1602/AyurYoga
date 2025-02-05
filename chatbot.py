from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv  

# Load environment variables from .env file
load_dotenv()
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Hugging Face API URL
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

# Load FAISS Index & Text Data
INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Load sentence-transformers model
model = SentenceTransformer(EMBEDDING_MODEL)

# Load index & data
with open(INDEX_PATH, "rb") as f:
    index = pickle.load(f)
with open(DATA_PATH, "rb") as f:
    text_data = pickle.load(f)

app = Flask(__name__)
CORS(app)

def search_similar_text(query, top_k=3):
    """Searches for similar text in FAISS index."""
    query_embedding = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, top_k)
    retrieved_text = [text_data[i] for i in indices[0]]
    return retrieved_text

def query_huggingface(prompt):
    """Query Hugging Face model with retrieved context."""
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    
    retrieved_text = search_similar_text(prompt)
    
    if not retrieved_text or all(len(text.strip()) == 0 for text in retrieved_text):
        return "Oops, I couldn't find relevant information in my knowledge base. Could you please rephrase your question or ask about something else? I'm here to help!"

    # Format retrieved context in a structured way
    formatted_context = "\n".join([f"{i+1}. {text}" for i, text in enumerate(retrieved_text)])
    
    # Construct a more refined prompt
    full_prompt = (
        "You are an expert in yoga, health, and wellness. "
        "Use the provided context to answer the user's question clearly and concisely.\n\n"
        f"Context:\n{formatted_context}\n\n"
        f"User Query: {prompt}\n"
        "Provide a detailed and structured response, including key points if necessary."
    )

    payload = {"inputs": full_prompt}

    response = requests.post(HF_API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        generated_text = response.json()[0].get("generated_text", "").strip()
        
        if not generated_text:
            return "Hmm, I couldn't find a precise answer. Could you try rephrasing your question or asking about something else? I'll do my best to assist!"

        return f"Here's what I found: {generated_text} Let me know if you'd like more details or have any follow-up questions!"

    else:
        return f"I'm having a little trouble connecting to my knowledge base right now (Error {response.status_code}). Can you please try again later? Thanks for your patience!"

@app.route("/")
def home():
    return "Welcome to your Yoga Chatbot! I'm here to assist you with all things yoga, health, and wellness. Feel free to ask me anything!"

@app.route("/get_response", methods=["POST"])
def get_response():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"response": "Hey there! Could you please ask me a question so I can assist you?"}), 400

    user_input = data["message"]
    bot_response = query_huggingface(user_input)
    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(port=5000)
