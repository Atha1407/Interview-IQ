import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Extract friendly error messages
export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail
        .map((err) => (typeof err === 'string' ? err : err.msg || JSON.stringify(err)))
        .join(', ')
    }
  }
  return error.message || 'An unexpected error occurred. Please try again.'
}

export default api
