# InterviewIQ — Database Schema Documentation

## 1. Overview

InterviewIQ uses **PostgreSQL** as its relational database management system. The schema is designed around strict relational integrity, UUID primary keys for non-enumerable IDs, explicit foreign key cascade constraints, indexed lookup columns, and JSONB support for dynamic data structures where appropriate.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ resumes : "owns"
    users ||--o{ interviews : "conducts"
    users ||--o1 readiness_profiles : "has"
    users ||--o{ skill_gaps : "exhibits"
    users ||--o{ practice_sessions : "completes"
    
    resumes ||--o{ interviews : "targets"
    
    interviews ||--o{ questions : "contains"
    questions ||--o1 answers : "receives"
    answers ||--o1 evaluations : "evaluated_by"
    
    readiness_profiles ||--o{ skill_gaps : "contains"
    skill_gaps ||--o{ practice_sessions : "targeted_by"

    users {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        timestamp created_at
        timestamp updated_at
    }

    resumes {
        uuid id PK
        uuid user_id FK
        string file_name
        string file_path
        text extracted_text
        jsonb parsed_skills
        jsonb experience_summary
        timestamp created_at
    }

    interviews {
        uuid id PK
        uuid user_id FK
        uuid resume_id FK
        string interview_type
        string status
        string target_role
        timestamp created_at
        timestamp updated_at
    }

    questions {
        uuid id PK
        uuid interview_id FK
        integer order_index
        text question_text
        string question_type
        string target_skill
        string difficulty
        timestamp created_at
    }

    answers {
        uuid id PK
        uuid question_id FK
        uuid user_id FK
        text answer_text
        string audio_url
        integer response_time_seconds
        timestamp created_at
    }

    evaluations {
        uuid id PK
        uuid answer_id FK
        float overall_score
        float clarity_score
        float technical_accuracy_score
        text feedback_summary
        jsonb strengths
        jsonb weak_points
        string model_used
        timestamp created_at
    }

    readiness_profiles {
        uuid id PK
        uuid user_id FK
        float overall_readiness_score
        string readiness_trend
        jsonb category_scores
        timestamp last_calculated_at
        timestamp created_at
        timestamp updated_at
    }

    skill_gaps {
        uuid id PK
        uuid readiness_profile_id FK
        uuid user_id FK
        string skill_name
        string category
        string severity
        jsonb historical_evidence
        string status
        timestamp created_at
        timestamp updated_at
    }

    practice_sessions {
        uuid id PK
        uuid user_id FK
        uuid skill_gap_id FK
        string status
        jsonb exercises
        float score
        timestamp created_at
        timestamp updated_at
    }
```

---

## 3. Detailed Data Dictionary

### 3.1 `users`
Stores user authentication details and identity data.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique user identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User email address (login credential). |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Argon2id hashed password string. |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Candidate full name. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Registration timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Last profile update timestamp. |

**Indexes**:
- `idx_users_email` ON `users(email)` (Unique)

---

### 3.2 `resumes`
Stores uploaded resume documents, extracted plain text, and AI-extracted skill metadata.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique resume identifier. |
| `user_id` | `UUID` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Owner user identifier. |
| `file_name` | `VARCHAR(255)` | `NOT NULL` | Original uploaded filename. |
| `file_path` | `VARCHAR(512)` | `NOT NULL` | Storage location or file path. |
| `extracted_text` | `TEXT` | `NOT NULL` | Extracted plain text content. |
| `parsed_skills` | `JSONB` | `NOT NULL`, Default `'[]'` | List of extracted skill tags. |
| `experience_summary`| `JSONB` | `NOT NULL`, Default `'{}'` | Parsed work history & education metadata. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Upload timestamp. |

**Indexes**:
- `idx_resumes_user_id` ON `resumes(user_id)`

---

### 3.3 `interviews`
Tracks individual interview sessions, interview format, and overall session lifecycle state.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique interview session identifier. |
| `user_id` | `UUID` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Candidate identifier. |
| `resume_id` | `UUID` | `NULLABLE`, `FK -> resumes(id) ON DELETE SET NULL` | Resume context used for generation. |
| `interview_type` | `VARCHAR(50)` | `NOT NULL`, Check (`technical`, `behavioral`, `mixed`) | Type of interview. |
| `status` | `VARCHAR(50)` | `NOT NULL`, Check (`pending`, `in_progress`, `completed`, `abandoned`) | Session status. |
| `target_role` | `VARCHAR(255)` | `NOT NULL` | Role targeted during session (e.g. Senior Backend Engineer). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Session start timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Last state transition timestamp. |

**Indexes**:
- `idx_interviews_user_id` ON `interviews(user_id)`
- `idx_interviews_status` ON `interviews(status)`

---

### 3.4 `questions`
Contains generated adaptive interview questions for a specific interview session.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique question identifier. |
| `interview_id` | `UUID` | `NOT NULL`, `FK -> interviews(id) ON DELETE CASCADE` | Associated interview session. |
| `order_index` | `INTEGER` | `NOT NULL` | Sequence number in interview (1, 2, 3...). |
| `question_text` | `TEXT` | `NOT NULL` | The full prompt text of the question. |
| `question_type` | `VARCHAR(50)` | `NOT NULL` | Question domain (e.g., `system_design`, `coding_concept`, `behavioral`). |
| `target_skill` | `VARCHAR(100)` | `NOT NULL` | Target skill tested (e.g. PostgreSQL Indexing, STAR Method). |
| `difficulty` | `VARCHAR(50)` | `NOT NULL`, Check (`easy`, `medium`, `hard`) | Question difficulty rating. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Generation timestamp. |

**Indexes**:
- `idx_questions_interview_id` ON `questions(interview_id)`
- `idx_questions_interview_order` ON `questions(interview_id, order_index)` (Unique)

---

### 3.5 `answers`
Stores the candidate's submitted responses to specific interview questions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique answer identifier. |
| `question_id` | `UUID` | `UNIQUE`, `NOT NULL`, `FK -> questions(id) ON DELETE CASCADE` | Target question identifier. |
| `user_id` | `UUID` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Submitting candidate identifier. |
| `answer_text` | `TEXT` | `NOT NULL` | Raw text response submitted by candidate. |
| `audio_url` | `VARCHAR(512)` | `NULLABLE` | Optional future audio upload reference. |
| `response_time_seconds`| `INTEGER` | `NULLABLE` | Time taken to answer in seconds. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Submission timestamp. |

**Indexes**:
- `idx_answers_question_id` ON `answers(question_id)`
- `idx_answers_user_id` ON `answers(user_id)`

---

### 3.6 `evaluations`
Stores multi-dimensional AI scoring and qualitative evaluation feedback per submitted answer.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique evaluation identifier. |
| `answer_id` | `UUID` | `UNIQUE`, `NOT NULL`, `FK -> answers(id) ON DELETE CASCADE` | Associated answer identifier. |
| `overall_score` | `FLOAT` | `NOT NULL` | Weighted score out of 100.0. |
| `clarity_score` | `FLOAT` | `NOT NULL` | Response clarity score out of 100.0. |
| `technical_accuracy_score` | `FLOAT` | `NOT NULL` | Technical depth/accuracy score out of 100.0. |
| `feedback_summary` | `TEXT` | `NOT NULL` | Constructive narrative feedback. |
| `strengths` | `JSONB` | `NOT NULL`, Default `'[]'` | List of identified positive aspects. |
| `weak_points` | `JSONB` | `NOT NULL`, Default `'[]'` | List of identified technical/behavioral errors. |
| `model_used` | `VARCHAR(100)` | `NOT NULL` | LLM version identifier used for evaluation. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Evaluation timestamp. |

**Indexes**:
- `idx_evaluations_answer_id` ON `evaluations(answer_id)`

---

### 3.7 `readiness_profiles`
Maintains the high-level readiness metric snapshot per candidate, computed by the InterviewIQ Readiness Engine.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Profile identifier. |
| `user_id` | `UUID` | `UNIQUE`, `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Candidate identifier. |
| `overall_readiness_score` | `FLOAT` | `NOT NULL`, Default `0.0` | Aggregated interview readiness score (0-100). |
| `readiness_trend` | `VARCHAR(50)` | `NOT NULL`, Default `'improving'`, Check (`improving`, `declining`, `stable`) | Directional readiness trend. |
| `category_scores` | `JSONB` | `NOT NULL`, Default `'{}'` | Readiness broken down by skill category. |
| `last_calculated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Timestamp of last Readiness Engine run. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Last update timestamp. |

**Indexes**:
- `idx_readiness_profiles_user_id` ON `readiness_profiles(user_id)`

---

### 3.8 `skill_gaps`
Tracks specific recurring technical or behavioral weaknesses detected across evaluation histories.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Skill gap identifier. |
| `readiness_profile_id` | `UUID` | `NOT NULL`, `FK -> readiness_profiles(id) ON DELETE CASCADE` | Associated profile. |
| `user_id` | `UUID` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Candidate identifier. |
| `skill_name` | `VARCHAR(100)` | `NOT NULL` | Name of the weak skill (e.g., Dynamic Programming, System Scalability). |
| `category` | `VARCHAR(100)` | `NOT NULL` | Category (e.g. Technical, Behavioral). |
| `severity` | `VARCHAR(50)` | `NOT NULL`, Check (`low`, `medium`, `high`, `critical`) | Weakness severity level. |
| `historical_evidence` | `JSONB` | `NOT NULL`, Default `'[]'` | Array of historical question/answer IDs demonstrating the gap. |
| `status` | `VARCHAR(50)` | `NOT NULL`, Default `'active'`, Check (`active`, `addressing`, `resolved`) | Resolution state. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Identification timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Resolution state update timestamp. |

**Indexes**:
- `idx_skill_gaps_user_status` ON `skill_gaps(user_id, status)`

---

### 3.9 `practice_sessions`
Stores AI-generated personalized practice modules targeted at resolving active skill gaps.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Practice session identifier. |
| `user_id` | `UUID` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Candidate identifier. |
| `skill_gap_id` | `UUID` | `NOT NULL`, `FK -> skill_gaps(id) ON DELETE CASCADE` | Targeted skill gap. |
| `status` | `VARCHAR(50)` | `NOT NULL`, Default `'assigned'`, Check (`assigned`, `completed`, `failed`) | Completion status. |
| `exercises` | `JSONB` | `NOT NULL` | Dynamic exercise prompts and expected rubrics. |
| `score` | `FLOAT` | `NULLABLE` | Practice evaluation score out of 100.0. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Generation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Completion/evaluation timestamp. |

**Indexes**:
- `idx_practice_sessions_user_gap` ON `practice_sessions(user_id, skill_gap_id)`
