import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  heading: {
    fontSize: '2.5rem',
    color: '#00796b',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '1.2rem',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '20px',
    textAlign: 'center',
    maxWidth: '800px',
  },
};

const About = () => {
  const [backendMessage, setBackendMessage] = useState('');

  useEffect(() => {
    const fetchBackendMessage = async () => {
      try {
        const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${backendURL}/`);
        setBackendMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching backend message:", error);
      }
    };
    fetchBackendMessage();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Discover the Power of Yoga & Ayurveda</h1>
      <p style={styles.paragraph}>
        Welcome to **AyurYoga**, your gateway to holistic well-being through **yoga** and **Ayurveda**. 
        Our mission is to help you reconnect with your body, mind, and soul through time-tested yogic 
        practices and ancient Ayurvedic wisdom.
      </p>
      <p style={styles.paragraph}>
        **Yoga**, an ancient discipline, enhances flexibility, strength, and mental clarity. Whether you are 
        a beginner or an advanced practitioner, our carefully curated asanas and breathing techniques 
        (pranayama) will guide you toward inner peace.
      </p>
      <p style={styles.paragraph}>
        **Ayurveda**, the science of life, complements yoga by promoting balance through natural remedies, 
        diet, and mindful living. By understanding your body's unique constitution (*doshas*), you can 
        create a lifestyle that fosters harmony and vitality.
      </p>
      <p style={styles.paragraph}>
        Join us on a transformative journey where ancient wisdom meets modern wellness. Whether you're 
        seeking stress relief, physical fitness, or holistic healing, **Yoga Bliss** is here to support you.
      </p>
      {backendMessage && (
        <p style={{ ...styles.paragraph, fontStyle: 'italic' }}>
          Backend says: {backendMessage}
        </p>
      )}
    </div>
  );
};

export default About;
