import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default http;
