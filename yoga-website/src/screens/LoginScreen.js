import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../utils/AuthProvider';

const API_AUTH_BASE_URL = process.env.REACT_APP_AUTH_BACKEND_URL || 'http://localhost:8000';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #a8e063, #56ab2f)',
    padding: '20px',
  },
  form: {
    background: 'linear-gradient(135deg, rgba(232,245,233,0.7), rgba(200,230,201,0.7))',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '400px',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
  },
  input: {
    width: '80%',
    padding: '12px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '10px auto 0 auto',
  },
  link: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#3498db',
    textDecoration: 'none',
  },
};

const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      const decodedUser = jwtDecode(data.access_token);
      setUser(decodedUser);
      
      alert('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animated-form { animation: slideIn 0.5s ease-out; }
        .animated-input {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .animated-input:focus {
          transform: scale(1.02);
          box-shadow: 0 0 10px rgba(52,152,219,0.5);
          outline: none;
        }
        .animated-button {
          transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .animated-button:hover {
          background-color: #2980b9;
          transform: scale(1.05);
        }
      `}</style>
      <form style={styles.form} className="animated-form" onSubmit={handleLogin}>
        <h2 style={styles.heading}>Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="animated-input"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="animated-input"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="animated-button" style={styles.button}>Login</button>
        <Link to="/signup" style={styles.link}>Don't have an account? Sign up</Link>
      </form>
    </div>
  );
};

export default LoginScreen;