import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return Promise.reject(
        new Error(
          'Cannot reach the API. Start the backend on http://localhost:8080 (e.g. mvn spring-boot:run -Dspring-boot.run.profiles=local) and keep the Vite dev server proxy (/api → :8080).',
        ),
      )
    }
    if (error.response?.status === 401) {
      console.warn(`[HMS Dev] Ignored 401 for ${error.config?.url}`)
      return Promise.resolve({
        data: null,
        status: 401,
        headers: error.response.headers,
        config: error.config,
      })
    }

    const payload = error?.response?.data
    const message =
      (typeof payload === 'string' && payload) ||
      payload?.message ||
      payload?.error ||
      error?.message ||
      'Request failed'
    return Promise.reject(new Error(message))
  },
)

