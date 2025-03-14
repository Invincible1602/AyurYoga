import axios from 'axios';

// Base URLs for the two separate backend services
const API_AUTH_BASE_URL = 'http://localhost:8000'; // For auth & recommendation endpoints
const API_CHAT_BASE_URL = 'http://localhost:8001'; // For image search & chatbot endpoints

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_AUTH_BASE_URL}/register/`, { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_AUTH_BASE_URL}/login/`, { username, password });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRecommendations = async (disease) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }
  try {
    const response = await axios.get(`${API_AUTH_BASE_URL}/recommend/`, {
      params: { disease, token },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// New functions for endpoints in main1.py

export const searchImages = async (prompt) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }
  try {
    const response = await axios.get(`${API_CHAT_BASE_URL}/search-images`, {
      params: { prompt, token },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatResponse = async (message) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }
  try {
    const response = await axios.post(`${API_CHAT_BASE_URL}/get_response`, { message }, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
