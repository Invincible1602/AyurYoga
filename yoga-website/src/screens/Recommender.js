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
  const token = localStorage.getItem('token'); // Make sure the login stores token under "token"
  if (!token) throw new Error('No token found. Please login.');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  return axios.get(`${API_BASE_URL}/recommend/`, {
    params: { disease },
    headers: { Authorization: `Bearer ${token}` },
  });
};

const Recommender = () => {
  const [selectedDisease, setSelectedDisease] = useState(diseases[0]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Yoga Asana Recommendations
      </h1>
      <div style={{ marginBottom: '16px' }}>
        <select
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          {diseases.map((disease, idx) => (
            <option key={idx} value={disease}>
              {disease}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <button
          onClick={fetchRecommendations}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#319795',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {results.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '16px',
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Asana Name: {item['Asana Name']}
              </p>
              {item['Reasons Not to Perform'] && item['Reasons Not to Perform'].length > 0 && (
                <div style={{ marginLeft: '16px' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '4px' }}>
                    Reasons Not to Perform:
                  </p>
                  {item['Reasons Not to Perform'].map((reason, rIdx) => (
                    <p key={rIdx} style={{ marginLeft: '8px' }}>
                      - {reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommender;
