import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mu_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getToken = () => localStorage.getItem("mu_admin_token");
export const setToken = (t) => localStorage.setItem("mu_admin_token", t);
export const clearToken = () => localStorage.removeItem("mu_admin_token");

export function waLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export async function fetchPrimaryWhatsApp() {
  const { data } = await api.get("/settings/whatsapp");
  const numbers = data.numbers || [];
  return numbers.find((n) => n.primary) || numbers[0] || null;
}

export function formatApiError(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || "").filter(Boolean).join(" ");
  return fallback;
}

export const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
