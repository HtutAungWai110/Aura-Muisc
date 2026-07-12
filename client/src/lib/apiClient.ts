import axios from "axios";
import { useErrorStore } from "../states/ErrorState";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function getAccessToken(): string | null {
  return getCookie("accessToken");
}

export function setTokensFromHash() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");

  if (accessToken && refreshToken) {
    setCookie("accessToken", accessToken, 60 * 60); // 1 hour
    setCookie("refreshToken", refreshToken, 60 * 60 * 24 * 7); // 7 days
    window.location.hash = "";
    window.history.replaceState(null, "", window.location.pathname);
  }
}

const apiClient = axios.create({
  baseURL: "",
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${originalRequest.baseURL || ""}/api/auth/refresh`,
          { refreshToken },
        );

        setCookie("accessToken", data.accessToken, 60 * 60);
        setCookie("refreshToken", data.refreshToken, 60 * 60 * 24 * 7);

        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens on failure
        setCookie("accessToken", "", 0);
        setCookie("refreshToken", "", 0);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Error state for non-401 errors
    let errorMessage = "An unknown error occurred";
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      errorMessage = "No response from server";
    } else {
      errorMessage = error.message;
    }
    useErrorStore.getState().setError(errorMessage);

    return Promise.reject(error);
  },
);

export default apiClient;
