# InterviewIQ — REST API Specification

## 1. API Standards & Guidelines

- **Base URL Prefix**: All REST endpoints are prefixed with `/api/v1`.
- **Content Type**: `application/json` (except file uploads which use `multipart/form-data`).
- **Authentication**: JWT tokens passed automatically in `HTTP-only` cookies named `access_token`.
- **Standard HTTP Response Codes**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource successfully created.
  - `400 Bad Request`: Validation failure or bad request syntax.
  - `401 Unauthorized`: Missing or invalid authentication token.
  - `403 Forbidden`: Authenticated user lacks access to target resource.
  - `404 Not Found`: Target resource does not exist.
  - `422 Unprocessable Entity`: Request body failed Pydantic schema validation.
  - `500 Internal Server Error`: Unexpected internal backend failure.

### 1.1 Standard Error Envelope
All error responses return a standardized JSON structure:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested interview session was not found or access is denied.",
    "details": null
  }
}
```

---

## 2. Core API Modules

### 2.1 Auth Module (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Registers a new candidate account.

- **Request Body**:
```json
{
  "email": "candidate@example.com",
  "password": "SecurePassword123!",
  "full_name": "Jane Doe"
}
```
- **Response (201 Created)**: Sets `access_token` HTTP-only cookie.
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "candidate@example.com",
  "full_name": "Jane Doe",
  "created_at": "2026-08-25T22:45:00Z"
}
```

#### `POST /api/v1/auth/login`
Authenticates credentials and sets session cookie.

- **Request Body**:
```json
{
  "email": "candidate@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**: Sets `access_token` HTTP-only cookie.
```json
{
  "message": "Login successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "candidate@example.com",
    "full_name": "Jane Doe"
  }
}
```

#### `POST /api/v1/auth/logout`
Clears the authentication cookie.

- **Response (200 OK)**: Clears `access_token` cookie.
```json
{
  "message": "Successfully logged out"
}
```

#### `GET /api/v1/auth/me`
Retrieves currently authenticated user details.

- **Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "candidate@example.com",
  "full_name": "Jane Doe",
  "created_at": "2026-08-25T22:45:00Z"
}
```

---

### 2.2 Resumes Module (`/api/v1/resumes`)

#### `POST /api/v1/resumes`
Uploads a resume file (PDF/Docx) and stores the resume record.

- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (binary document file)
- **Response (201 Created)**:
```json
{
  "id": "789e4567-e89b-12d3-a456-426614174000",
  "file_name": "Jane_Doe_Resume_2026.pdf",
  "extracted_text": "Experienced Backend Engineer...",
  "created_at": "2026-08-25T22:46:00Z"
}
```

#### `GET /api/v1/resumes`
Lists all uploaded resumes for the current user.

- **Response (200 OK)**:
```json
[
  {
    "id": "789e4567-e89b-12d3-a456-426614174000",
    "file_name": "Jane_Doe_Resume_2026.pdf",
    "created_at": "2026-08-25T22:46:00Z"
  }
]
```

#### `GET /api/v1/resumes/{id}`
Retrieves a specific resume metadata record and parsed skills.

- **Response (200 OK)**:
```json
{
  "id": "789e4567-e89b-12d3-a456-426614174000",
  "file_name": "Jane_Doe_Resume_2026.pdf",
  "parsed_skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
  "experience_summary": {
    "total_years": 4,
    "top_roles": ["Software Engineer", "Backend Developer"]
  },
  "created_at": "2026-08-25T22:46:00Z"
}
```

#### `DELETE /api/v1/resumes/{id}`
Deletes a specific resume record and associated file.

- **Response (200 OK)**:
```json
{
  "message": "Resume successfully deleted",
  "id": "789e4567-e89b-12d3-a456-426614174000"
}
```

#### `POST /api/v1/resumes/{id}/analyze`
Triggers AI analysis on an uploaded resume to extract skills and domain competencies.

- **Response (200 OK)**:
```json
{
  "resume_id": "789e4567-e89b-12d3-a456-426614174000",
  "skills": ["Python", "FastAPI", "PostgreSQL", "System Design"],
  "domain_competency": {
    "backend": "Advanced",
    "frontend": "Intermediate",
    "database": "Advanced"
  },
  "identified_gaps": ["Kubernetes", "GraphQL"]
}
```

---

### 2.3 Interviews Module (`/api/v1/interviews`)

#### `POST /api/v1/interviews`
Initializes a new adaptive interview session.

- **Request Body**:
```json
{
  "resume_id": "789e4567-e89b-12d3-a456-426614174000",
  "interview_type": "technical",
  "target_role": "Senior Backend Engineer"
}
```
- **Response (201 Created)**:
```json
{
  "interview_id": "456e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "interview_type": "technical",
  "target_role": "Senior Backend Engineer",
  "first_question": {
    "id": "999e4567-e89b-12d3-a456-426614174000",
    "order_index": 1,
    "question_text": "Explain how PostgreSQL manages connection pooling under high traffic conditions.",
    "target_skill": "PostgreSQL",
    "difficulty": "medium"
  }
}
```

#### `GET /api/v1/interviews`
Lists all interview sessions for current user.

- **Response (200 OK)**:
```json
[
  {
    "id": "456e4567-e89b-12d3-a456-426614174000",
    "interview_type": "technical",
    "target_role": "Senior Backend Engineer",
    "status": "in_progress",
    "created_at": "2026-08-25T22:45:00Z"
  }
]
```

#### `GET /api/v1/interviews/{id}`
Retrieves interview session state, questions asked, and submitted answers.

- **Response (200 OK)**:
```json
{
  "id": "456e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "interview_type": "technical",
  "target_role": "Senior Backend Engineer",
  "questions": [
    {
      "id": "999e4567-e89b-12d3-a456-426614174000",
      "order_index": 1,
      "question_text": "Explain how PostgreSQL manages connection pooling under high traffic conditions.",
      "target_skill": "PostgreSQL",
      "difficulty": "medium"
    }
  ]
}
```

#### `POST /api/v1/interviews/{id}/answer`
Submits a user answer for evaluation and returns the evaluation alongside the next adaptive question.

- **Request Body**:
```json
{
  "question_id": "999e4567-e89b-12d3-a456-426614174000",
  "answer_text": "I would use PgBouncer as a sidecar or proxy to pool connections...",
  "response_time_seconds": 45
}
```
- **Response (200 OK)**:
```json
{
  "evaluation": {
    "overall_score": 88.0,
    "clarity_score": 85.0,
    "technical_accuracy_score": 90.0,
    "feedback": "Strong explanation of connection pooling mechanisms."
  },
  "next_question": {
    "id": "999e4567-e89b-12d3-a456-426614174001",
    "order_index": 2,
    "question_text": "How would you optimize a slow API query involving a multi-million row table?",
    "target_skill": "Database Optimization",
    "difficulty": "hard"
  }
}
```

#### `POST /api/v1/interviews/{id}/complete`
Explicitly completes and finalizes an active interview session.

- **Response (200 OK)**:
```json
{
  "interview_id": "456e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "completed_at": "2026-08-25T22:50:00Z"
}
```

---

### 2.4 Evaluations Module (`/api/v1/evaluations`)

#### `GET /api/v1/evaluations/{interview_id}/report`
Retrieves full evaluation report for an entire completed interview session.

- **Response (200 OK)**:
```json
{
  "interview_id": "456e4567-e89b-12d3-a456-426614174000",
  "overall_score": 84.5,
  "summary": "Strong technical foundation in backend concepts; minor hesitation on distributed caching strategies.",
  "evaluations": [
    {
      "question_id": "999e4567-e89b-12d3-a456-426614174000",
      "score": 90.0,
      "clarity_score": 88.0,
      "technical_accuracy_score": 92.0,
      "feedback": "Clear explanation of connection pooling concepts.",
      "strengths": ["Accurate explanation of connection overhead"],
      "weak_points": ["Did not mention connection timeout configuration"]
    }
  ]
}
```

#### `GET /api/v1/evaluations/{id}`
Retrieves a single evaluation record by evaluation ID.

---

### 2.5 Readiness Module (`/api/v1/readiness`)

#### `GET /api/v1/readiness/profile`
Retrieves the candidate's current InterviewIQ Readiness Engine profile.

- **Response (200 OK)**:
```json
{
  "overall_readiness_score": 78.2,
  "readiness_trend": "improving",
  "category_scores": {
    "system_design": 72.0,
    "data_structures": 85.0,
    "behavioral": 78.0,
    "database": 88.0
  },
  "active_skill_gaps_count": 2,
  "last_calculated_at": "2026-08-25T22:47:00Z"
}
```

#### `GET /api/v1/readiness/history`
Retrieves historical readiness score logs over time for progress tracking charts.

---

### 2.6 Skill Gaps Module (`/api/v1/skill-gaps`)

#### `GET /api/v1/skill-gaps`
Lists identified recurring skill gaps for the logged-in candidate.

- **Response (200 OK)**:
```json
[
  {
    "id": "111e4567-e89b-12d3-a456-426614174000",
    "skill_name": "Distributed System Caching",
    "category": "System Design",
    "severity": "high",
    "status": "active",
    "evidence_count": 3,
    "created_at": "2026-08-25T22:40:00Z"
  }
]
```

#### `GET /api/v1/skill-gaps/{id}`
Retrieves detailed breakdown of a skill gap including historical question/answer evidence.

---

### 2.7 Practice Module (`/api/v1/practice`)

#### `POST /api/v1/practice/generate`
Generates a targeted practice module for an active skill gap.

- **Request Body**:
```json
{
  "skill_gap_id": "111e4567-e89b-12d3-a456-426614174000"
}
```
- **Response (201 Created)**:
```json
{
  "practice_id": "222e4567-e89b-12d3-a456-426614174000",
  "skill_gap_id": "111e4567-e89b-12d3-a456-426614174000",
  "exercises": [
    {
      "order": 1,
      "prompt": "Design a Cache Invalidation strategy for a multi-region e-commerce catalog.",
      "key_learning_points": ["Cache stampede prevention", "Write-through vs Write-around"]
    }
  ]
}
```

#### `GET /api/v1/practice/{id}`
Retrieves a practice session by ID.

#### `POST /api/v1/practice/{id}/submit`
Submits completed practice exercise responses for AI re-evaluation and skill gap status updates.
