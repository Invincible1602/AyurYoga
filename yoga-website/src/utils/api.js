
import axios from 'axios';


const API_BASE_URL = 'http://localhost:8000'; 

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login/`, { username, password });
    
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
    
    const response = await axios.get(`${API_BASE_URL}/recommend/`, {
      params: { disease, token },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
