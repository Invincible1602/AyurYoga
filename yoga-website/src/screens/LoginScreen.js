import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure you import the named export
import { AuthContext } from '../utils/AuthProvider';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    padding: '20px 30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: '10px',
    color: '#3498db',
    textDecoration: 'none',
  },
};

const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);  // Get setUser from context
  const navigate = useNavigate();
  const location = useLocation();
  
  // If redirected, this holds the intended destination
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      // Save the token under a consistent key
      localStorage.setItem('token', data.access_token);
      // Decode the token and update the auth context
      const decodedUser = jwtDecode(data.access_token);
      setUser(decodedUser);
      
      alert('Login successful!');
      // Redirect to the originally intended route
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        <h2 style={styles.heading}>Login</h2>
        <input
          type="text"
          placeholder="Username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
        <Link to="/signup" style={styles.link}>Don't have an account? Sign up</Link>
      </form>
    </div>
  );
};

export default LoginScreen;
