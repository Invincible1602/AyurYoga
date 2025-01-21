import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const styles = {
  navbar: {
    backgroundColor: '#2c3e50', // Darker background for a sleek look
    padding: '15px 30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
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
  navLinkHover: {
    color: '#3498db',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',   // Horizontally center the content
    alignItems: 'center',       // Vertically center the content
    flexDirection: 'column',    // Stack the content vertically
    height: '100vh',            // Full viewport height
    backgroundColor: '#ecf0f1', // Light background for the main content
    padding: '30px 20px',
    borderRadius: '8px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for the container
  },
  heading: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '1.2rem',
    color: '#7f8c8d',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  iframe: {
    width: '80%',
    height: '600px',
    border: 'none',
    borderRadius: '8px', // Smooth corners for the iframe
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add a shadow around the iframe
  },
};

const Recommender = () => {
  return (
    <>
      <div style={styles.navbar}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <a href="/" style={styles.navbarBrand}>Yoga Bliss</a>
          <ul style={styles.navLinks}>
            <li>
              <a href="/" style={styles.navLink}>Home</a>
            </li>
            <li>
              <Link to="/recommender" style={styles.navLink}>
                Recommendations
              </Link>
            </li>
            <li>
              <Link to="/about" style={styles.navLink}>
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <Container style={styles.container} className="mt-5">
        <h2 style={styles.heading}>Yoga Asana Recommender</h2>
        <p style={styles.paragraph}>Select a disease and get personalized yoga suggestions!</p>
        <iframe
          src="http://localhost:8501"
          style={styles.iframe}
          title="Yoga Asana Recommender"
        ></iframe>
      </Container>
    </>
  );
};

export default Recommender;
