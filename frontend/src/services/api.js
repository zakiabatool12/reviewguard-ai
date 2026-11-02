import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: true,
});

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// Logged-in POST/DELETE requests must carry the CSRF token
client.interceptors.request.use((config) => {
  if (config.method && config.method.toLowerCase() !== "get") {
    const csrf = getCookie("csrf_access_token");
    if (csrf) config.headers["X-CSRF-TOKEN"] = csrf;
  }
  return config;
});

async function call(promise) {
  try {
    const { data } = await promise;
    return data;
  } catch (err) {
    const e = new Error(
      err.response?.data?.error || "Cannot reach the server. Is the backend running?"
    );
    e.code = err.response?.data?.code;
    e.status = err.response?.status;
    throw e;
  }
}

export const register = (form) => call(client.post("/api/auth/register", form));
export const verifyOtp = (email, otp) => call(client.post("/api/auth/verify-otp", { email, otp }));
export const resendOtp = (email) => call(client.post("/api/auth/resend-otp", { email }));
export const login = (email, password) => call(client.post("/api/auth/login", { email, password }));
export const logout = () => call(client.post("/api/auth/logout"));
export const me = () => call(client.get("/api/auth/me"));

export const analyzeReview = (review, rating) => {
  const payload = { review };
  if (rating) payload.rating = Number(rating);
  return call(client.post("/api/analyze", payload));
};
export const getHistory = (params) => call(client.get("/api/history", { params }));
export const getHistoryItem = (id) => call(client.get(`/api/history/${id}`));
export const deleteHistory = (id) => call(client.delete(`/api/history/${id}`));
export const getDashboard = () => call(client.get("/api/dashboard"));
export const updateProfile = (name) => call(client.patch("/api/profile", { name }));
export const changePassword = (payload) => call(client.post("/api/change-password", payload));
export const deleteAllHistory = () => call(client.delete("/api/history"));
