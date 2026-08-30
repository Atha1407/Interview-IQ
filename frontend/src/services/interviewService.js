import api from './api'

export const interviewService = {
  async createSession({ resume_id, interview_type, difficulty, question_count, topics }) {
    const response = await api.post('/interview-sessions/', {
      resume_id,
      interview_type,
      difficulty,
      question_count,
      topics,
    })
    return response.data
  },

  async listSessions() {
    const response = await api.get('/interview-sessions/')
    return response.data
  },

  async getSession(sessionId) {
    const response = await api.get(`/interview-sessions/${sessionId}`)
    return response.data
  },

  async deleteSession(sessionId) {
    const response = await api.delete(`/interview-sessions/${sessionId}`)
    return response.data
  },

  async generateQuestions(sessionId) {
    const response = await api.post(`/interview-sessions/${sessionId}/generate`)
    return response.data
  },

  async getSessionQuestions(sessionId) {
    const response = await api.get(`/interview-sessions/${sessionId}/questions`)
    return response.data
  },

  async startSession(sessionId) {
    const response = await api.post(`/interview-sessions/${sessionId}/start`)
    return response.data
  },

  async submitAnswer(sessionId, questionId, answerText) {
    const response = await api.post(
      `/interview-sessions/${sessionId}/questions/${questionId}/answer`,
      { answer_text: answerText }
    )
    return response.data
  },

  async evaluateSession(sessionId) {
    const response = await api.post(`/interview-sessions/${sessionId}/evaluate`)
    return response.data
  },

  async getResult(sessionId) {
    const response = await api.get(`/interview-sessions/${sessionId}/result`)
    return response.data
  },
}
