import axios from "axios";

const api = axios.create({
  // URL del backend expuesto vía ngrok (funciona desde Internet, incluso con --tunnel)
  baseURL: "https://diagram-dreary-recount.ngrok-free.dev",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // ngrok-free muestra una página de advertencia sin este header
    "ngrok-skip-browser-warning": "true",
  },
});

export default api;
