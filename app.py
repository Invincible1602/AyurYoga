import os
import streamlit as st
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms import HuggingFaceHub
from langchain.chains import LLMChain
import fitz  # PyMuPDF for PDF extraction
from transformers import pipeline

# Load environment variables from the .env file
load_dotenv()

# Set the API keys from environment variables
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["HUGGINGFACE_API_KEY"] = os.getenv("HUGGINGFACE_API_KEY")

# Prompt template for the assistant
prompt = ChatPromptTemplate(
    [
        ("system", "You are a helpful assistant. Please respond to the user's queries based on the provided document."),
        ("user", "Question: {question}\nDocument text: {document_text}")
    ]
)

# Streamlit app setup
st.title('Langchain Demo with Hugging Face & OpenAI API')

# File uploader for PDF input
uploaded_pdf = st.file_uploader("Upload a PDF document", type="pdf")

# Text input for user query
input_text = st.text_input("Ask a question based on the PDF document")

# Function to extract text from a PDF file
def extract_pdf_text(pdf_file):
    doc = fitz.open(pdf_file)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Function to summarize the PDF content
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(text):
    return summarizer(text, max_length=500, min_length=100, do_sample=False)[0]['summary_text']

# Function to split text into manageable chunks
MAX_TOKENS = 5000  # Adjust this limit based on the model's token limit

def split_text(text):
    # Split the text into chunks of MAX_TOKENS characters
    return [text[i:i + MAX_TOKENS] for i in range(0, len(text), MAX_TOKENS)]

# Check if the user uploaded a PDF and entered a query
if uploaded_pdf and input_text:
    # Extract text from the uploaded PDF
    pdf_text = extract_pdf_text(uploaded_pdf)

    # Summarize the PDF content to reduce size
    summarized_text = summarize_text(pdf_text)

    # Split the summarized text into chunks (if necessary)
    chunks = split_text(summarized_text)

    # Setup the Hugging Face model using the Hugging Face Hub
    llm = HuggingFaceHub(
        repo_id="mistralai/Mistral-7B-Instruct-v0.3",
        model_kwargs={'temperature': 0.6, 'max_length': 500},
        huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY")  # Use the environment variable
    )

    # Create a chain using the prompt template and LLM
    chain = LLMChain(prompt=prompt, llm=llm)

    # Use the first chunk (or the relevant chunk if you have multiple) for the query
    document_chunk = chunks[0]  # You can enhance this with more sophisticated relevance detection

    # Generate a response from the model, providing the summarized document chunk as context
    response = chain.run(question=input_text, document_text=document_chunk)

    # Display the result in the Streamlit app
    st.write("Answer: ", response)
