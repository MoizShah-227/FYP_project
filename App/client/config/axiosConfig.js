// axiosConfig.js
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5004", // Base URL of your Express server
  timeout: 10000,                   // Optional: timeout for requests
  headers: {
    "Content-Type": "application/json",

  },
});

api.interceptors.request.use(
  (config) => {
 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;