import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RefreshTokenPayload,
} from "../types/api.types";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api/v1";

// Lazy import to avoid circular dependency
let useAuthStore: any = null;
const getAuthStore = () => {
  if (!useAuthStore) {
    useAuthStore = require("../store").useAuthStore;
  }
  return useAuthStore;
};

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.refreshTokenPromise) {
            this.refreshTokenPromise = this.handleRefreshToken();
          }

          try {
            const newToken = await this.refreshTokenPromise;
            this.refreshTokenPromise = null;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch {
            this.logout();
            window.location.href = "/login";
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleRefreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/refresh`,
      {
        refreshToken,
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    // Sync with store if it exists
    try {
      const store = getAuthStore();
      if (store) {
        store.getState().setTokens(accessToken, newRefreshToken);
      }
    } catch (e) {
      // Store not ready yet
    }

    return accessToken;
  }

  private logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Sync with store if it exists
    try {
      const store = getAuthStore();
      if (store) {
        store.getState().logout();
      }
    } catch (e) {
      // Store not ready yet
    }
  }

  // Auth APIs
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>(
      "/auth/register",
      payload
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Sync with store
    try {
      const store = getAuthStore();
      if (store) {
        const storeState = store.getState();
        storeState.setTokens(data.accessToken, data.refreshToken);
        storeState.setUser(data.user);
      }
    } catch (e) {
      // Store not ready
    }

    return data;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>(
      "/auth/login",
      payload
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Sync with store
    try {
      const store = getAuthStore();
      if (store) {
        const storeState = store.getState();
        storeState.setTokens(data.accessToken, data.refreshToken);
        storeState.setUser(data.user);
      }
    } catch (e) {
      // Store not ready
    }

    return data;
  }

  async refresh(payload: RefreshTokenPayload): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>(
      "/auth/refresh",
      payload
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Sync with store
    try {
      const store = getAuthStore();
      if (store) {
        store.getState().setTokens(data.accessToken, data.refreshToken);
      }
    } catch (e) {
      // Store not ready
    }

    return data;
  }

  // Generic methods for all endpoints
  async get<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.get<T>(url, config);
    return data;
  }

  async post<T>(url: string, payload?: any, config?: any): Promise<T> {
    const { data } = await this.client.post<T>(url, payload, config);
    return data;
  }

  async put<T>(url: string, payload?: any, config?: any): Promise<T> {
    const { data } = await this.client.put<T>(url, payload, config);
    return data;
  }

  async patch<T>(url: string, payload?: any, config?: any): Promise<T> {
    const { data } = await this.client.patch<T>(url, payload, config);
    return data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.delete<T>(url, config);
    return data;
  }

  async uploadFile<T>(
    url: string,
    formData: FormData,
    config?: any
  ): Promise<T> {
    const { data } = await this.client.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
    return data;
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
