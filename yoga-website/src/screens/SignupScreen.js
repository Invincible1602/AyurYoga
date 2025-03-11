import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    // Transparent gradient background for the signup box
    background: 'linear-gradient(135deg, rgba(232,245,233,0.7), rgba(200,230,201,0.7))',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '400px',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center children inside the form
    justifyContent: 'center',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
  },
  input: {
    width: '80%', // Fixed width for centered inputs
    padding: '12px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    padding: '8px 16px', // Smaller button styling
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '10px auto 0 auto', // Center the button
  },
  link: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#3498db',
    textDecoration: 'none',
  },
};

const SignupScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }
      
      await response.json();
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
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
      <form style={styles.form} className="animated-form" onSubmit={handleSignup}>
        <h2 style={styles.heading}>Sign Up</h2>
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
        <button type="submit" className="animated-button" style={styles.button}>Sign Up</button>
        <Link to="/login" style={styles.link}>Already have an account? Login</Link>
      </form>
    </div>
  );
};

export default SignupScreen;
