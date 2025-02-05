import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBotResponse("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/get_response", {
        message: userInput,
      });
      setBotResponse(response.data.response);
    } catch (err) {
      setBotResponse("Error communicating with the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <Link to="/" style={styles.navbarBrand}>Yoga Bliss</Link>
          <ul style={styles.navLinks}>
            <li><Link to="/" style={styles.navLink}>Home</Link></li>
            <li><Link to="/recommender" style={styles.navLink}>Recommendations</Link></li>
            <li><Link to="/about" style={styles.navLink}>About</Link></li>
            
          </ul>
        </div>
      </nav>
      
      <div style={styles.container}>
        <h1 style={styles.header}>🧘 Yoga Chatbot</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Ask about yoga or medical knowledge..."
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? <div style={styles.spinner}></div> : "Ask"}
          </button>
        </form>

        {botResponse && (
          <div style={styles.responseCard}>
            <h2 style={styles.responseHeader}>🤖 Bot Response:</h2>
            <p style={styles.responseText}>{botResponse}</p>
          </div>
        )}
      </div>
    </>
  );
};

// Styles Object
const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    padding: '15px 30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navbarContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navbarBrand: {
    fontSize: '2rem',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    padding: 0,
    margin: 0,
  },
  navLink: {
    color: '#fff',
    fontSize: '1.1rem',
    textDecoration: 'none',
    marginLeft: '25px',
    transition: 'color 0.3s ease',
  },
  container: {
    maxWidth: "600px",
    margin: "100px auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
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
    border: "2px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s ease-in-out",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  responseCard: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f1f1f1",
    borderRadius: "10px",
    textAlign: "left",
  },
  responseHeader: {
    fontSize: "18px",
    color: "#007bff",
    marginBottom: "8px",
  },
  responseText: {
    fontSize: "16px",
    color: "#333",
    lineHeight: "1.6",
  },
};

export default Chatbot;
