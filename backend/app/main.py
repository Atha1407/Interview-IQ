from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.interview_sessions import router as interview_sessions_router
from app.core.config import settings


app = FastAPI(
    title="InterviewIQ API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    resumes_router,
    prefix="/api/v1",
)

app.include_router(
    interview_sessions_router,
    prefix="/api/v1",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}