import { apiFetch, setAccessToken } from "./api.js";

export async function signup({ name, email, password }) {
  const response = await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }
  return data;
}

export async function login({ email, password }) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  setAccessToken(null);
}

export async function getCurrentUser() {
  const response = await apiFetch("/auth/me");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch current user");
  }
  return data.user;
}
