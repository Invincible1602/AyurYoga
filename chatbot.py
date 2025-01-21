from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Hugging Face API settings
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

def query_huggingface(prompt: str) -> str:
    """Query the Hugging Face model and return the response."""
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}"
    }
    payload = {
        "inputs": prompt
    }

    response = requests.post(HF_API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()[0].get('generated_text', "No response received.")  # Safely get generated text
    else:
        return f"Error: {response.status_code} - {response.text}"

@app.route("/")
def home():
    return "Yoga Chatbot is running!"

@app.route("/get_response", methods=["POST"])
def get_response():
    data = request.get_json()
    print("Received data:", data)  # Debugging log
    if not data or "message" not in data:
        return jsonify({"response": "Please provide a valid question."}), 400

    user_input = data["message"]
    bot_response = query_huggingface(prompt=user_input)
    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(port=5000)
