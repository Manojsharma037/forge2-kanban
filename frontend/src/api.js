import axios from "axios";

// Base URL is configurable for deployment (Render/Railway).
// Falls back to the local Laravel dev server.
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default axios.create({
  baseURL,
  headers: { Accept: "application/json" },
});
