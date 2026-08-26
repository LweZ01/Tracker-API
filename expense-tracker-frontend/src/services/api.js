let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiFetch(endpoint, options = {}, isRetry = false) {
  const baseURL = "http://localhost:3000";
  const url = `${baseURL}${endpoint}`;

  const config = {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  };

  if (options.body && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, config);

  if (response.ok) {
    return response;
  }

  if (response.status === 401 && !isRetry) {
    const refreshSuccess = await refreshAccessToken();

    if (refreshSuccess) {
      return apiFetch(endpoint, options, true);
    }
  }

  return response;
}

async function refreshAccessToken() {
  try {
    const response = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      return true;
    }

    setAccessToken(null);
    return false;
  } catch {
    setAccessToken(null);
    return false;
  }
}
