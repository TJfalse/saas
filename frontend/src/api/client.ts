import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { AuthResponse, LoginPayload, RegisterPayload, RefreshTokenPayload } from '../types/api.types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1'

class ApiClient {
  private client: AxiosInstance
  private refreshTokenPromise: Promise<string> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.refreshTokenPromise) {
            this.refreshTokenPromise = this.handleRefreshToken()
          }

          try {
            const newToken = await this.refreshTokenPromise
            this.refreshTokenPromise = null
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.client(originalRequest)
          } catch {
            this.logout()
            window.location.href = '/login'
            return Promise.reject(error)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  private async handleRefreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available')

    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data
    this.setTokens(accessToken, newRefreshToken)
    return accessToken
  }

  private logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Auth APIs
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/register', payload)
    this.setTokens(data.accessToken, data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', payload)
    this.setTokens(data.accessToken, data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async refresh(payload: RefreshTokenPayload): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/refresh', payload)
    this.setTokens(data.accessToken, data.refreshToken)
    return data
  }

  // Generic methods for all endpoints
  async get<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.get<T>(url, config)
    return data
  }

  async post<T>(url: string, payload?: any, config?: any): Promise<T> {
    const { data } = await this.client.post<T>(url, payload, config)
    return data
  }

  async put<T>(url: string, payload?: any, config?: any): Promise<T> {
    const { data } = await this.client.put<T>(url, payload, config)
    return data
  }

  async patch<T>(url: string, payload?: any, config?: any): Promise<T> {
    const { data } = await this.client.patch<T>(url, payload, config)
    return data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.delete<T>(url, config)
    return data
  }

  async uploadFile<T>(url: string, formData: FormData, config?: any): Promise<T> {
    const { data } = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
    return data
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()
