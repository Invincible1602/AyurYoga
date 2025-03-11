import React, { useState } from 'react';
import axios from 'axios';

const diseases = [
  'Anxiety',
  'Digestive Issues',
  'Poor Posture',
  'Insomnia',
  'Asthma',
  'Fatigue',
  'Back Pain',
  'Sciatica',
  'Depression',
  'Stress',
  'Endocrine Problems (Diabetes/Infertility/Thyroid)',
  'Respiratory Diseases',
  'Muscular/Skeletal Problems',
  'Urinary Issues',
  'Nervous System (Brain Fever/Mental Disease)',
];

// Function to fetch recommendations with the token in the Authorization header
export const getRecommendations = async (disease) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please login.');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  return axios.get(`${API_BASE_URL}/recommend/`, {
    params: { disease },
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Helper function to generate a Wikipedia link for the asana
const getAsanaLink = (asanaName) => {
  // Replace spaces with underscores and encode the name
  const encodedName = encodeURIComponent(asanaName.replace(/ /g, '_'));
  return `https://en.wikipedia.org/wiki/${encodedName}`;
};

const Recommender = () => {
  const [selectedDisease, setSelectedDisease] = useState(diseases[0]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State to simulate hover effects
  const [buttonHovered, setButtonHovered] = useState(false);
  const [selectHovered, setSelectHovered] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getRecommendations(selectedDisease);
      setResults(response.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        'An error occurred while fetching recommendations.';
      setError(errorMsg);
      setResults([]);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Inline style objects
  const containerStyle = { maxWidth: '800px', margin: '0 auto', padding: '16px' };
  const titleStyle = {
    textAlign: 'center',
    marginBottom: '24px',
    // Animation for the heading: fades in from above
    animation: 'fadeInDown 1s ease-out',
  };

  const selectContainerStyle = { marginBottom: '16px' };
  const diseaseSelectBase = {
    width: '100%',
    padding: '8px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    transition: 'border-color 0.3s ease',
  };
  const diseaseSelectStyle = selectHovered
    ? { ...diseaseSelectBase, borderColor: '#319795' }
    : diseaseSelectBase;

  const buttonContainerStyle = { display: 'flex', justifyContent: 'center', marginBottom: '24px' };
  const fetchButtonBase = {
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#319795',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  };
  const fetchButtonStyle = buttonHovered
    ? { ...fetchButtonBase, backgroundColor: '#2c7a7b', transform: 'scale(1.05)' }
    : fetchButtonBase;

  const errorMessageStyle = { color: 'red', textAlign: 'center', marginBottom: '16px' };
  const resultsHeaderStyle = { textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' };
  const resultsListStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };

  const cardBaseStyle = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '16px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    // Animation for the card: slides in from the left
    animation: 'slideIn 0.5s ease-out',
  };
  const getCardStyle = (idx) =>
    hoveredCardIndex === idx
      ? { ...cardBaseStyle, transform: 'translateY(-5px)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }
      : cardBaseStyle;

  const asanaNameStyle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' };
  const reasonsContainerStyle = { marginLeft: '16px' };
  const reasonsHeaderStyle = { fontStyle: 'italic', marginBottom: '4px' };
  const reasonItemStyle = { marginLeft: '8px' };

  const topResults = results.slice(0, 20);

  return (
    <div style={containerStyle}>
      {/* Inline styles for keyframe animations */}
      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          a.asana-link {
            color: #319795;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          a.asana-link:hover {
            color: #2c7a7b;
            text-decoration: underline;
          }
        `}
      </style>
      <h1 style={titleStyle}>Yoga Asana Recommendations</h1>
      <div style={selectContainerStyle}>
        <select
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value)}
          style={diseaseSelectStyle}
          onMouseEnter={() => setSelectHovered(true)}
          onMouseLeave={() => setSelectHovered(false)}
        >
          {diseases.map((disease, idx) => (
            <option key={idx} value={disease}>
              {disease}
            </option>
          ))}
        </select>
      </div>
      <div style={buttonContainerStyle}>
        <button
          onClick={fetchRecommendations}
          style={fetchButtonStyle}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>
      {error && <div style={errorMessageStyle}>{error}</div>}
      {topResults.length > 0 && (
        <>
          <p style={resultsHeaderStyle}>Showing Top 20 Results</p>
          <div style={resultsListStyle}>
            {topResults.map((item, idx) => (
              <div
                key={idx}
                style={getCardStyle(idx)}
                onMouseEnter={() => setHoveredCardIndex(idx)}
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                <p style={asanaNameStyle}>
                  Asana Name:{' '}
                  <a
                    className="asana-link"
                    href={getAsanaLink(item['Asana Name'])}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item['Asana Name']}
                  </a>
                </p>
                {item['Reasons Not to Perform'] && item['Reasons Not to Perform'].length > 0 && (
                  <div style={reasonsContainerStyle}>
                    <p style={reasonsHeaderStyle}>Reasons Not to Perform:</p>
                    {item['Reasons Not to Perform'].map((reason, rIdx) => (
                      <p key={rIdx} style={reasonItemStyle}>
                        - {reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Recommender;
