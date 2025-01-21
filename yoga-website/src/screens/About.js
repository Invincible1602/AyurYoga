import React, { Component } from 'react';
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
    flexDirection: 'column',  // Center content vertically
    alignItems: 'center',      // Center content horizontally
    height: '100vh',           // Full viewport height
    backgroundColor: '#f8f9fa', // Light background color for the page
    padding: '20px',
  },
  heading: {
    fontSize: '2rem',  // Adjusted font size for the title
    color: '#0000ff',  // Accent color
    textDecoration: 'none',
    marginBottom: '20px',  // Space below the heading
  },
  paragraph: {
    fontSize: '1.2rem',
    color: '#555',      // Slightly muted color for text
    lineHeight: '1.6',   // Line spacing for readability
    marginBottom: '30px',
    textAlign: 'center',  // Centered text for better layout
    maxWidth: '800px',    // Limit width of the text for better readability
  },
  subHeading: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '10px',
  },
  teamMember: {
    fontSize: '1.1rem',
    color: '#555',
    marginBottom: '15px',
  },
};

export default class About extends Component {
  render() {
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
      </div>
        </>
    );
  }
}
