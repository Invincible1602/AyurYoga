import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthProvider";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const userEmail = user ? user.email || user.sub : null;

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT token
    setUser(null); // Clear user context
    alert("Logged out successfully!");
    navigate("/login");
  };

  const styles = {
    navbar: {
      backgroundColor: "#2c3e50",
      padding: "15px 30px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    navbarContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    navbarBrand: {
      fontSize: "2rem",
      color: "#fff",
      textDecoration: "none",
      fontWeight: "bold",
    },
    navLinks: {
      listStyle: "none",
      display: "flex",
      padding: 0,
      margin: 0,
    },
    navLink: {
      color: "#fff",
      fontSize: "1.1rem",
      textDecoration: "none",
      marginLeft: "25px",
      transition: "color 0.3s ease",
      cursor: "pointer",
    },
  };

  return (
    <>
      <nav style={styles.navbar} className="">
        <div style={styles.navbarContent}>
          <Link to="/" style={styles.navbarBrand} className="animate-fade">
            Yoga Bliss
          </Link>
          <ul style={styles.navLinks}>
            <li>
              <Link to="/" style={styles.navLink}>
                Home
              </Link>
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
            <li>
              <Link to="/chatbot" style={styles.navLink}>
                Chatbot
              </Link>
            </li>
            {userEmail ? (
              <>
                <li>
                  <span style={styles.navLink} onClick={handleLogout}>
                    Logout
                  </span>
                </li>
                <li>
                  <span style={styles.navLink}>Welcome, {userEmail}</span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={styles.navLink}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" style={styles.navLink}>
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <div style={{ paddingTop: "70px" }}></div>
    </>
  );
};

export default Navbar;
