# InterviewIQ — AI-Powered Interview Readiness Analyzer

[![Status](https://img.shields.io/badge/Status-Phase%200%20%7C%20Architecture%20%26%20Planning-blue)](#current-development-status)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-orange)](#high-level-architecture)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green)](#technology-stack)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-cyan)](#technology-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](#technology-stack)

---

## Overview

**InterviewIQ** is an advanced, full-stack AI system designed to elevate technical and behavioral interview preparation. Rather than offering generic static questions, InterviewIQ parses user resumes, conducts dynamic adaptive interview sessions, evaluates answers across key performance dimensions, detects recurring weaknesses, provides targeted practice modules, and tracks job readiness over time.

---

## Project Goal

The primary goal of InterviewIQ is to bridge the gap between passive interview practice and active skill mastery. By combining deterministic performance analytics with deep LLM reasoning, InterviewIQ delivers an actionable, data-driven readiness score alongside personalized remediation paths for technical candidates.

---

## Key Features

### 1. MVP (Phase 1 — Planned)
- **User Authentication**: Secure signup/login with JWT in HTTP-only cookies and Argon2id hashing.
- **Resume Upload & Analysis**: Extract skills, work experience, and domain expertise from uploaded resumes.
- **Adaptive Interviews**: Dynamic question generation across technical, behavioral, and mixed interview types.
- **Answer Evaluation**: Detailed scoring, qualitative feedback, technical accuracy, and clarity assessment per response.
- **Comprehensive Interview Reports**: Post-interview breakdown of strengths, weaknesses, and scores.
- **InterviewIQ Readiness Engine**: Signature feature converting performance history into actionable readiness metrics.
- **Weakness Detection**: Automated identification and categorization of recurring skill gaps.
- **Personalized Practice**: Custom exercise generation targeted directly at identified weak points.

### 2. Should Have (Phase 2)
- **Interactive Dashboard**: Centralized readiness overview, recent sessions, and active practice recommendations.
- **Interview History**: Complete archive of past interview sessions with filterable outcomes.
- **Resume History**: History of uploaded resume versions and their respective parsed skill profiles.
- **Progress Charts**: Visual analytics tracking score improvements and skill gap resolution over time.
- **Question & Evaluation Bank**: Detailed searchable review of past questions, answers, and AI evaluations.

### 3. Future Roadmap
- **Voice Interviews**: Real-time speech-to-text and audio response analysis.
- **Video Interviews**: Facial cue and posture analysis during mock interviews.
- **Job Description Matching**: Tailored readiness scores based on specific job postings.
- **Job-Specific Interviews**: Dynamic interviews tailored to specific roles, companies, and seniority levels.
- **Interview Personas**: Customizable interviewer styles (e.g., strict tech lead, supportive manager).
- **Advanced Career Insights**: Market skill trend comparisons and salary alignment analysis.

---

## High-Level Architecture

InterviewIQ follows a **Modular Monolith** pattern within a single monorepo repository. The AI pipeline is strictly decoupled from client devices, routing all AI interactions exclusively through a dedicated backend service layer.

```
React (Vite)  ──[REST API /api/v1]──>  FastAPI Backend
                                            │
                                            ├──> Business Service
                                            │        │
                                            │        └──> Dedicated AI Service
                                            │                  │
                                            │                  └──> LLM Provider
                                            │                            │
                                            │    Structured Output       │
                                            │ <── Validation & Parsing ──┘
                                            │
                                            └──> PostgreSQL Database
```

---

## Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Fast HMR, modern component structure, lightweight bundle size. |
| **Backend** | FastAPI, Python 3.11+ | Asynchronous I/O, native Pydantic data validation, OpenAPI generation. |
| **Database** | PostgreSQL | Relational integrity, structured schema enforcement, JSONB flexibility. |
| **Auth & Security** | JWT, HTTP-only Cookies, Argon2id | Secure password hashing and HTTP-only cookie-based authentication following common security best practices. |
| **AI Layer** | Backend AI Service + LLM | Centralized prompt governance, schema validation, rate-limiting, and security. |
| **API Format** | REST API (`/api/v1`) | Predictable resource-oriented endpoint structure. |

---

## Current Development Status

> **Status: Phase 0 — Architecture & Planning**

The project is currently in **Phase 0**. Architecture specifications, database schemas, REST API contracts, and AI workflow pipeline designs are finalized. No frontend or backend application code has been generated yet.

- [x] **Phase 0**: Architecture & Planning
- [ ] **Phase 1**: Core Infrastructure, Auth & Database Setup
- [ ] **Phase 2**: Resume Analysis & Adaptive Interview Engine
- [ ] **Phase 3**: Answer Evaluation & Signature Readiness Engine
- [ ] **Phase 4**: Dashboard & Progress Tracking UI

---

## Documentation Quick Links

For complete technical specifications, refer to the detailed documentation suite in the `docs/` directory:

- 🏗️ [**Architecture Architecture Guide**](docs/architecture.md) — System boundaries, monorepo structure, and security design.
- 🗄️ [**Database Schema Documentation**](docs/database.md) — Relational schema, ER diagram, and index strategies.
- 🔌 [**REST API Specification**](docs/api.md) — Endpoints, request/response contracts, and authentication protocols.
- 🧠 [**AI Pipeline & Readiness Engine Specification**](docs/ai-design.md) — LLM integration, prompt flows, and Readiness Engine design.
