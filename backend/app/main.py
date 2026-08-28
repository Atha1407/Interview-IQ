from fastapi import FastAPI
from app.api.v1.interview_sessions import router as interview_sessions_router
from app.api.v1.auth import router as auth_router
from app.api.v1.resumes import router as resumes_router


app = FastAPI(
    title="InterviewIQ API",
    version="1.0.0",
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

