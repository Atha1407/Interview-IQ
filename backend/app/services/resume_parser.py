from io import BytesIO

from docx import Document
from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF resume."""
    reader = PdfReader(BytesIO(file_bytes))

    text = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text.append(page_text)

    return "\n".join(text).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX resume."""
    document = Document(BytesIO(file_bytes))

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text.strip())

    return "\n".join(text).strip()


def extract_resume_text(file_bytes: bytes, extension: str) -> str:
    """Extract text from a PDF or DOCX resume."""

    extension = extension.lower()

    if extension == "pdf":
        return extract_text_from_pdf(file_bytes)

    if extension == "docx":
        return extract_text_from_docx(file_bytes)

    raise ValueError(f"Unsupported resume format: {extension}")