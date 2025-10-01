import axios from "axios";


const api = axios.create({
  baseURL: "https://bambi-watch-api.onrender.com/api/v1",
  
});

// ✅ Interceptor to attach the token on *every* request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // This must be exactly `Authorization: Bearer token`
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
