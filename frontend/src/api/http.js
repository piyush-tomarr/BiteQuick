import axios from 'axios'

const http = axios.create({
  // baseURL: 'http://localhost:2212'
  baseURL: 'https://bitequick-backend.onrender.com'
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''

    const isPublicAuthRoute = url.includes('/signin') || url.includes('/signup')

    if (!isPublicAuthRoute && (status === 419 || status === 401)) {
      localStorage.removeItem('token')
      window.location.href = '/auth'
    }

    return Promise.reject(error)
  }
)

export default http