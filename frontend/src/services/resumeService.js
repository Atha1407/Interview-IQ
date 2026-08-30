import api from './api'

export const resumeService = {
  async listResumes() {
    const response = await api.get('/resumes/')
    return response.data
  },

  async uploadResume(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteResume(resumeId) {
    const response = await api.delete(`/resumes/${resumeId}`)
    return response.data
  },
}
