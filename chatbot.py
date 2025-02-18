from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv  


load_dotenv()
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")


HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"


INDEX_PATH = "faiss_index.pkl"
DATA_PATH = "text_data.pkl"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


RELEVANCE_THRESHOLD = 1.0


model = SentenceTransformer(EMBEDDING_MODEL)


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
    
    
    if distances[0][0] > RELEVANCE_THRESHOLD:
        return []
    
    retrieved_text = [text_data[i] for i in indices[0]]
    return retrieved_text

def query_huggingface(prompt):
    """Query Hugging Face model with retrieved context."""
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    
    retrieved_text = search_similar_text(prompt)
    
   
    if not retrieved_text or all(len(text.strip()) == 0 for text in retrieved_text):
        return "Sorry No response"

   
    formatted_context = "\n".join([f"{i+1}. {text}" for i, text in enumerate(retrieved_text)])
    
   
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
        result = response.json()
        if isinstance(result, list) and result and "generated_text" in result[0]:
            generated_text = result[0]["generated_text"].strip()
            if generated_text:
                return (
                    "Thank you for your question. Based on the context provided, here's a detailed response:\n\n"
                    f"{generated_text}\n\n"
                    "I hope this answers your query. Please let me know if you have any follow-up questions or need further clarification."
                )
        return "I'm sorry, I couldn't generate a detailed response. Could you please rephrase your question or provide more details?"
    else:
        return (
            f"I'm experiencing some technical difficulties connecting to my knowledge base (Error {response.status_code}). "
            "Could you please try again later? Thanks for your patience!"
        )

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
