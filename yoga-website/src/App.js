import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./screens/HomePage";
import Recommender from "./screens/Recommender";
import About from "./screens/About";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import Chatbot from "./screens/Chatbot";
import YogaImageGenerator from "./screens/YogaImageGenerator"; // New component
import { AuthProvider } from "./utils/AuthProvider";
import ProtectedRoute from "./utils/ProtectedRoute";
import YogaShorts from "./screens/YogaShorts";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route
              path="/yoga-image-generator"
              element={
                <ProtectedRoute>
                  <YogaImageGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommender"
              element={
                <ProtectedRoute>
                  <Recommender />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shorts"
              element={
                <ProtectedRoute>
                  <YogaShorts />
                </ProtectedRoute>
              }
            />
            {/* Fallback route for unmatched URLs */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
