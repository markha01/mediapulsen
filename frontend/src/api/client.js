import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default client;
