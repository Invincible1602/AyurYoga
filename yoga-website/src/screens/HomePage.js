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
      paddingTop: '0px',
    },
    carousel: {
      maxWidth: '100%',
      margin: '0 auto',
      userSelect: 'none',
    },
    imageContainer: {
      width: '100%',
      height: '100%',
    },
    carouselImage: {
      maxHeight: '600px',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    carouselCaption: {
      backgroundColor: '#22222270',
      padding: '20px',
      bottom: '40px',
      color: '#fff',
      textAlign: 'left',
      maxWidth: '50%',
      borderRadius: '4px',
      backdropFilter: 'blur(3px)',
    },
    container: {
      backgroundColor: '#f8f9fa',
      padding: '80px 20px',
      textAlign: 'center',
      animation: 'fadeIn 1.5s ease-in-out',
    },
    heading: {
      fontSize: '3rem',
      color: '#2c3e50',
      marginBottom: '20px',
      animation: 'fadeIn 2s ease-in-out',
    },
    paragraph: {
      fontSize: '1.3rem',
      color: '#7f8c8d',
      marginBottom: '40px',
      maxWidth: '800px',
      margin: '0 auto 40px',
      animation: 'fadeIn 2.5s ease-in-out',
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
    infoSection: {
      backgroundColor: '#f8f9fa',
      padding: '20px 20px',
      textAlign: 'center',
      animation: 'fadeIn 2s ease-in-out',
      marginTop: '20px',
      marginBottom: '20px'
    },
    infoHeading: {
      fontSize: '2.5rem',
      color: '#2c3e50',
      marginBottom: '20px',
    },
    infoParagraph: {
      fontSize: '1.2rem',
      color: '#7f8c8d',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    ayurvedaSection: {
      backgroundColor: '#e9ecef',
      padding: '60px 20px',
      textAlign: 'center',
      animation: 'fadeIn 2s ease-in-out',
    },
    ayurvedaHeading: {
      fontSize: '2.5rem',
      color: '#2c3e50',
      marginBottom: '20px',
    },
    ayurvedaParagraph: {
      fontSize: '1.2rem',
      color: '#7f8c8d',
      maxWidth: '800px',
      margin: '0 auto 40px',
      lineHeight: '1.6',
    },
    ayurvedaCardsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      marginTop: '40px',
    },
    ayurvedaCard: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '300px',
      transition: 'transform 0.3s ease',
      animation: 'slideIn 1s ease forwards',
    },
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 
          40% { transform: translateY(-10px); } 
          60% { transform: translateY(-5px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-button:hover {
          animation: bounce 0.5s;
        }
        .ayurveda-card:hover {
          transform: scale(1.05);
        }
      `}</style>
      <main style={styles.mainContent}>
        {/* Main Image Carousel */}
        <div style={styles.carousel}>
          <Carousel 
            showArrows={true} 
            showThumbs={false} 
            infiniteLoop={true} 
            autoPlay={true} 
            interval={5000}
            showStatus={false}
            emulateTouch
          >
            <div style={styles.imageContainer}>
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
            <div style={styles.imageContainer}>
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
            <div style={styles.imageContainer}>
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
          <h1 style={styles.heading}>Welcome to AyurYoga</h1>
          <p style={styles.paragraph}>
            Embark on a transformative journey with AyurYoga. Our platform offers personalized yoga recommendations 
            tailored to your unique health needs, helping you achieve balance, strength, and inner peace.
          </p>
          <button
            style={styles.button}
            className="animated-button"
            onClick={handleNavigateToRecommender}
          >
            Get Personalized Recommendations
          </button>
        </div>

        {/* Yoga Info Slideshow with Enhanced Content */}
        <div style={styles.infoSection}>
          <Carousel 
            showArrows={true}
            showThumbs={false}
            showIndicators={false}
            infiniteLoop={true}
            autoPlay={true}
            interval={2500}
            showStatus={false}
            emulateTouch
          >
            <div>
              <h2 style={styles.infoHeading}>About Yoga</h2>
              <p style={styles.infoParagraph}>
                Yoga is an ancient practice rooted in Indian philosophy, blending physical postures, breath control, and meditation.
                With centuries of evolution, it is not just a form of exercise but a path to inner peace. Its holistic approach nurtures
                both the body and mind by emphasizing the connection between breath, movement, and mindfulness.
              </p>
            </div>
            <div>
              <h2 style={styles.infoHeading}>Why Practice Yoga</h2>
              <p style={styles.infoParagraph}>
                Yoga isn’t only about physical exercise; it is a journey of self-discovery and mental clarity. It helps reduce stress,
                fosters mindfulness, and builds a deeper connection between mind and body. Regular practice also cultivates discipline,
                improves flexibility, and enhances overall cognitive focus.
              </p>
            </div>
            <div>
              <h2 style={styles.infoHeading}>Benefits of Yoga</h2>
              <p style={styles.infoParagraph}>
                Regular yoga practice enhances flexibility, strengthens muscles, improves posture, and boosts overall well-being.
                It supports stress reduction, promotes cardiovascular health, and improves concentration. Many practitioners report increased
                energy levels and a more balanced lifestyle through consistent practice.
              </p>
            </div>
          </Carousel>
        </div>

        {/* Ayurveda Section with Cards */}
        <div style={styles.ayurvedaSection}>
          <h2 style={styles.ayurvedaHeading}>Discover Ayurveda</h2>
          <p style={styles.ayurvedaParagraph}>
            Ayurveda, the ancient science of life, originates from India and offers holistic approaches for balancing body, mind, and spirit.
            Embrace natural healing, nutritional wisdom, and lifestyle practices to achieve overall wellness and longevity.
          </p>
          <div style={styles.ayurvedaCardsContainer}>
            <div style={styles.ayurvedaCard} className="ayurveda-card">
              <h3>Holistic Healing</h3>
              <p>
                Ayurveda focuses on balancing your body systems with natural remedies and lifestyle changes.
              </p>
            </div>
            <div style={styles.ayurvedaCard} className="ayurveda-card">
              <h3>Natural Nutrition</h3>
              <p>
                Discover how food and herbs can be used to maintain your health and boost immunity.
              </p>
            </div>
            <div style={styles.ayurvedaCard} className="ayurveda-card">
              <h3>Mind-Body Balance</h3>
              <p>
                Learn mindfulness practices and exercises that align your physical and mental well-being.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;
