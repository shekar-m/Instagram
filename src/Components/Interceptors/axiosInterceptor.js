import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');
    console.log('Token: in interceptor', token);
    if (token) {
      
      config.headers.Authorization = `Bearer ${token}`;
    } 
    return config;
  },
  (error) => {
   
    return Promise.reject(error);
  }
);

export default axiosInstance;
