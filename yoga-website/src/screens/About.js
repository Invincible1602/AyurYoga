import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    padding: '15px 30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  navbarBrand: {
    fontSize: '2rem',
    color: '#fff',
    textDecoration: 'none',
    marginRight: '50px',
    fontWeight: 'bold',
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    padding: 0,
    marginLeft: 'auto',
  },
  navLink: {
    color: '#fff',
    fontSize: '1.1rem',
    textDecoration: 'none',
    marginRight: '25px',
    transition: 'color 0.3s ease',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',  
    alignItems: 'center',      
    height: '100vh',           
    backgroundColor: '#f8f9fa', 
    padding: '20px',
  },
  heading: {
    fontSize: '2rem',
    color: '#0000ff',
    textDecoration: 'none',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '1.2rem',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '30px',
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
        // Assuming the backend returns an object like { message: "..." }
        setBackendMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching backend message:", error);
      }
    };
    fetchBackendMessage();
  }, []);

  return (
    <>
      {/* About Content */}
      <div style={styles.container}>
        <h1 style={styles.heading}>About Us</h1>
        <p style={styles.paragraph}>
          Welcome to Yoga Bliss! We are a team of passionate yoga instructors and wellness enthusiasts dedicated to helping you achieve balance and tranquility in your life.
        </p>
        <p style={styles.paragraph}>
          Our mission is to provide personalized yoga recommendations that suit your individual needs, promoting physical, mental, and emotional well-being. Whether you're a beginner or experienced, we are here to guide you every step of the way.
        </p>
        <p style={styles.paragraph}>
          Join us in your yoga journey to find peace, strength, and balance. We are committed to making yoga accessible for everyone.
        </p>
        {backendMessage && (
          <p style={{...styles.paragraph, fontStyle: 'italic'}}>
            Backend says: {backendMessage}
          </p>
        )}
      </div>
    </>
  );
};

export default About;
