# AyurYoga

AyurYoga is a web application that provides personalized yoga recommendations and a conversational chatbot to answer questions about yoga, health, and wellness. Built with a FastAPI backend and a React frontend, the application offers secure JWT-based authentication, efficient similarity search using FAISS, and leverages a Hugging Face model to generate dynamic responses.

## Features

- **User Authentication:**  
  Secure registration and login using JWT. Protected routes are accessible only when authenticated.

- **Yoga Recommendations:**  
  Get personalized yoga asana recommendations based on your health conditions and preferences.

- **Chatbot Interface:**  
  Ask questions related to yoga, health, and wellness. The chatbot retrieves relevant context via FAISS and generates structured responses using a Hugging Face model.

- **Efficient Similarity Search:**  
  FAISS is used to quickly search and retrieve relevant context from precomputed text data.

## Tech Stack

### Backend

- **FastAPI** – for building the API endpoints.
- **Python** – primary programming language.
- **FAISS** – for efficient similarity search.
- **SentenceTransformer** – for encoding text data.
- **Hugging Face Inference API** – for generating dynamic responses.
- **JWT** – for secure authentication (using jose and passlib).

### Frontend

- **React** – for building the user interface.
- **React Router** – for handling client-side routing.
- **Axios** – for making HTTP requests.


## Installation

### Prerequisites

- **Backend:** Python 3.8+ and pip
- **Frontend:** Node.js and npm

### Backend Setup

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>/backend
   ```
   

2. **Create a virtual environment and install dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   

4. **Ensure required files are in place:**
   - `faiss_index.pkl`
   - `text_data.pkl`
   - `yoga_asanas_and_diseases.csv`

6. **Create a \`.env\` file in the backend folder with the following variables:**
   ```env
   SECRET_KEY=your_secret_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```
   

7. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port=8000 --reload
   ```
   

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../yoga-website
   ```
   

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```
   

4. **Create a \`.env\` file in the frontend directory with:**
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8000
   ```

6. **Start the React development server:**
   ```bash
   npm start
   ```
   

## Usage

- **Signup:**  
  Create a new account via the signup page.

- **Login:**  
  Log in with your credentials. The token will be saved in localStorage and the authentication context will update immediately—no refresh needed!

- **Yoga Recommendations:**  
  Access the recommender page to receive personalized yoga asana suggestions based on selected health conditions.

- **Chatbot:**  
  Ask any questions about yoga, health, or wellness via the chatbot page. The chatbot uses FAISS to retrieve relevant context and generates responses via a Hugging Face model.

## Folder Structure

```bash
├── backend
│   ├── main.py                     # FastAPI backend code
│   ├── faiss_index.pkl             # FAISS index file
│   ├── text_data.pkl               # Text data for FAISS search
│   ├── yoga_asanas_and_diseases.csv# CSV file with asanas and diseases
│   ├── .env                        # Environment variables for backend
│   └── requirements.txt
└── yoga-website
    ├── src
    │   ├── App.js                  # Main React app
    │   ├── screens                 # React screens (HomePage, Recommender, Chatbot, LoginScreen, SignupScreen, About)
    │   └── utils                   # AuthProvider, ProtectedRoute, API utilities
    ├── public
    └── package.json
```


## Troubleshooting

- **Token Not Updating After Login:**  
  Ensure the token is stored under the same key (e.g., "token") and that the AuthProvider decodes the token and updates the user state immediately.

- **"Could Not Validate Credentials" Error:**  
  Verify that your protected routes receive the token in the Authorization header or query parameters. The backend’s \`get_current_user\` dependency now accepts tokens from both sources.

- **FAISS or Model Loading Errors:**  
  Make sure the required FAISS index and text data files exist and are in the correct format.

- **CORS Issues:**  
  Adjust the CORS middleware in FastAPI as needed for your production environment.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Hugging Face](https://huggingface.co/)
- [FAISS](https://github.com/facebookresearch/faiss)
- [SentenceTransformers](https://www.sbert.net/)
