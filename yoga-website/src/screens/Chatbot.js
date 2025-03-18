import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError("Please enter a valid question.");
      return;
    }
    setError("");
    setLoading(true);
    setBotResponse("");

    try {
      // Use the chat backend URL from environment variables or default to localhost with protocol
      const backendURL =
        process.env.REACT_APP_CHAT_BACKEND_URL ||
        "http://localhost:8000";
      const response = await axios.post(`${backendURL}/get_response`, {
        message: userInput,
      });

      if (response.data && response.data.response) {
        setBotResponse(response.data.response);
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err) {
      if (err.response) {
        setError(`Server error: ${err.response.statusText}`);
      } else if (err.request) {
        setError("Network error: Could not reach the server.");
      } else {
        setError("Error communicating with the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inject keyframes for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div style={styles.container}>
        <h1 style={styles.header}>Yoga Chatbot</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Ask a question about yoga or medical knowledge"
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Loading..." : "Ask"}
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
        {botResponse && (
          <div style={styles.responseCard}>
            <h2 style={styles.responseHeader}>Bot Response</h2>
            <p style={styles.responseText}>{botResponse}</p>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    animation: "fadeIn 1s ease-in-out",
  },
  header: {
    color: "#333",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  button: {
    padding: "12px 25px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  error: {
    color: "red",
    marginTop: "10px",
    fontWeight: "bold",
  },
  responseCard: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
    animation: "slideIn 0.5s ease-out",
  },
  responseHeader: {
    margin: "0 0 10px 0",
    fontSize: "18px",
    color: "#007BFF",
  },
  responseText: {
    fontSize: "16px",
    color: "#333",
    lineHeight: "1.6",
  },
};

export default Chatbot;
