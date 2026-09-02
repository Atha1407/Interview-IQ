from app.services.resume_ai_service import extract_resume_topics


resume_text = """
Software Developer with experience in Python, FastAPI, React,
PostgreSQL and REST APIs.

Built a web application using FastAPI and React.
Worked with SQL databases and authentication.
Knowledge of data structures, algorithms and object-oriented programming.
"""


topics = extract_resume_topics(resume_text)

print("Extracted topics:")

for topic in topics:
    print("-", topic)