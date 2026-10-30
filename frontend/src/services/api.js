import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

export async function analyzeReview(review, rating) {
  try {
    const payload = { review };
    if (rating) payload.rating = Number(rating);
    const { data } = await client.post("/api/analyze", payload);
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.error || "Cannot reach the server. Is the backend running?";
    throw new Error(msg);
  }
}