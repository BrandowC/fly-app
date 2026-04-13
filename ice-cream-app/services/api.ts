import axios from "axios";

const api = axios.create({
  // Esta es la IP real de tu PC en tu red local de Neiva
  baseURL: "http://192.168.1.35:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
