from pathlib import Path

from app.services.resume_parser import extract_resume_text


file_path = Path("test_resume.pdf")

file_bytes = file_path.read_bytes()

text = extract_resume_text(
    file_bytes=file_bytes,
    extension="pdf",
)

print("Extracted text:")
print(text)