import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { AuthContext } from '../utils/AuthProvider';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  // Assuming your JWT payload has a "sub" or "email" field
  const userEmail = user ? (user.email || user.sub) : null;

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token
    setUser(null); // Clear the user from context
    alert('Logged out successfully!');
    navigate('/login');
  };

  const handleNavigateToRecommender = () => {
    navigate('/recommender');
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
    mainContent: {
      paddingTop: '80px', // To account for fixed navbar
    },
    carousel: {
      maxWidth: '100%',
      margin: '0 auto',
    },
    carouselImage: {
      maxHeight: '600px',
      width: '100%',
      objectFit: 'cover',
    },
    carouselCaption: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: '20px',
      bottom: '40px',
      color: '#fff',
      textAlign: 'left',
      maxWidth: '50%',
      borderRadius: '4px',
    },
    container: {
      backgroundColor: '#f8f9fa',
      padding: '80px 20px',
      textAlign: 'center',
    },
    heading: {
      fontSize: '3rem',
      color: '#2c3e50',
      marginBottom: '20px',
    },
    paragraph: {
      fontSize: '1.3rem',
      color: '#7f8c8d',
      marginBottom: '40px',
      maxWidth: '800px',
      margin: '0 auto 40px',
    },
    button: {
      padding: '15px 30px',
      fontSize: '1.2rem',
      backgroundColor: '#3498db',
      border: 'none',
      cursor: 'pointer',
      color: '#fff',
      borderRadius: '30px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <Link to="/" style={styles.navbarBrand}>Yoga Bliss</Link>
          <ul style={styles.navLinks}>
            <li>
              <Link to="/" style={styles.navLink}>Home</Link>
            </li>
            <li>
              <Link to="/recommender" style={styles.navLink}>Recommendations</Link>
            </li>
            <li>
              <Link to="/about" style={styles.navLink}>About</Link>
            </li>
            <li>
              <Link to="/chatbot" style={styles.navLink}>Chatbot</Link>
            </li>
            {userEmail ? (
              <>
                <li>
                  <span style={{ ...styles.navLink, cursor: 'pointer' }} onClick={handleLogout}>Logout</span>
                </li>
                <li>
                  <span style={styles.navLink}>Welcome, {userEmail}</span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={styles.navLink}>Login</Link>
                </li>
                <li>
                  <Link to="/signup" style={styles.navLink}>Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main style={styles.mainContent}>
        {/* Carousel */}
        <div style={styles.carousel}>
          <Carousel 
            showArrows={true} 
            showThumbs={false} 
            infiniteLoop={true} 
            autoPlay={true} 
            interval={5000}
            showStatus={false}
          >
            <div>
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b" 
                alt="Yoga pose 1" 
                style={styles.carouselImage} 
              />
              <div className="legend" style={styles.carouselCaption}>
                <h2>Discover Inner Peace</h2>
                <p>Embark on a journey of self-discovery through yoga</p>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1588286840104-8957b019727f" 
                alt="Yoga pose 2" 
                style={styles.carouselImage} 
              />
              <div className="legend" style={styles.carouselCaption}>
                <h2>Improve Flexibility</h2>
                <p>Enhance your strength and flexibility with our guided sessions</p>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773" 
                alt="Yoga pose 3" 
                style={styles.carouselImage} 
              />
              <div className="legend" style={styles.carouselCaption}>
                <h2>Find Your Balance</h2>
                <p>Achieve harmony of body and mind through our yoga practices</p>
              </div>
            </div>
          </Carousel>
        </div>

        {/* Main Content */}
        <div style={styles.container}>
          <h1 style={styles.heading}>Welcome to Yoga Bliss</h1>
          <p style={styles.paragraph}>
            Embark on a transformative journey with Yoga Bliss. Our platform offers personalized yoga recommendations 
            tailored to your unique health needs, helping you achieve balance, strength, and inner peace.
          </p>
          <button
            style={styles.button}
            onClick={handleNavigateToRecommender}
          >
            Get Personalized Recommendations
          </button>
        </div>
      </main>
    </>
  );
};

export default HomePage;
