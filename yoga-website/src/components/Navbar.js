import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthProvider';

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const userEmail = user ? (user.email || user.sub) : null;

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setUser(null); 
    alert('Logged out successfully!');
    navigate('/login');
  };

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
      animation: 'fadeInDown 0.5s ease-out',
      marginBottom: '20px', 
      paddingBottom: '10px',  
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
      cursor: 'pointer',
    },
  };

  return (
    <>
      {/* Keyframes for fadeInDown and hover animation classes */}
      <style>{`
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
        .nav-link:hover {
          transform: scale(1.1);
          color: #1abc9c !important;
          transition: transform 0.3s ease, color 0.3s ease;
        }
      `}</style>
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <Link to="/" style={styles.navbarBrand} className="nav-link">AyurYoga</Link>
          <ul style={styles.navLinks}>
            <li>
              <Link to="/recommender" style={styles.navLink} className="nav-link">Recommendations</Link>
            </li>
            
            <li>
              <Link to="/chatbot" style={styles.navLink} className="nav-link">Chatbot</Link>
            </li>
            <li>
              <Link to="/yoga-image-generator" style={styles.navLink} className="nav-link">Yoga Image Generator</Link>
            </li>
            <li>
              <Link to="/shorts" style={styles.navLink} className="nav-link">Shorts</Link>
            </li>
            <li>
              <Link to="/about" style={styles.navLink} className="nav-link">About</Link>
            </li>
            {userEmail ? (
              <>
                <li>
                  <span style={styles.navLink} className="nav-link" onClick={handleLogout}>Logout</span>
                </li>
                <li>
                  <span style={styles.navLink} className="nav-link">Welcome, {userEmail}</span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={styles.navLink} className="nav-link">Login</Link>
                </li>
                <li>
                  <Link to="/signup" style={styles.navLink} className="nav-link">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      {/* Spacer div to offset the fixed navbar */}
      <div style={{ height: '80px', marginBottom: '20px' }}></div>
    </>
  );
};

export default Navbar;
