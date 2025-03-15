import React, { useState } from 'react';

const ALLOWED_KEYWORDS = [
  "yoga",
  "asana",
  "pose",
  "ayurveda",
  "ayurvedic",
  "pranayama",
  "surya namaskar",
  "kapalbhati",
  "bhastrika",
  "anulom vilom",
];

const isValidPrompt = (prompt) => {
  return ALLOWED_KEYWORDS.some(keyword =>
    prompt.toLowerCase().includes(keyword)
  );
};

// Use the chat backend URL from environment variables or default to the ngrok URL
const API_CHAT_BASE_URL = process.env.REACT_APP_CHAT_BACKEND_URL || 'https://cf85-2405-201-6004-63f0-599a-fed4-3d3b-c72f.ngrok-free.app';

const YogaImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setImages([]);

    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    if (!isValidPrompt(prompt)) {
      setError("Please include a keyword like 'yoga', 'asana', 'ayurveda', 'pranayama', or 'surya namaskar' in your prompt.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CHAT_BASE_URL}/search-images?prompt=${encodeURIComponent(prompt)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let errorMessage = "Network response was not ok";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setImages(data);
      } else {
        throw new Error("Received non-JSON response");
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Yoga Asana Finder</h1>
      <div>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter a yoga asana:"
          style={{ width: "300px", padding: "8px" }}
        />
        <button onClick={handleSearch} style={{ marginLeft: "10px", padding: "8px 12px" }}>
          Search Images
        </button>
      </div>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {loading && <p style={{ marginTop: "10px" }}>Searching for images, please wait...</p>}
      <div style={{ marginTop: "20px" }}>
        {images.map((url, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <img
              src={url}
              alt="Yoga Asana"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default YogaImageGenerator;
