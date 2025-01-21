import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './screens/HomePage';
import Recommender from './screens/Recommender';
import About from './screens/About';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { AuthProvider } from './utils/AuthProvider';
import Chatbot from './screens/Chatbot';
function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommender" element={<Recommender />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
