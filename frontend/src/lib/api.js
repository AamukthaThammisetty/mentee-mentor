import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // your FastAPI base URL
});

export default api;
