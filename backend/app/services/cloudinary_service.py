from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader

from app.core.config import settings


cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


def upload_resume(file, filename: str) -> str:
    """
    Upload a resume to Cloudinary and return its secure URL.
    """

    result = cloudinary.uploader.upload(
        file,
        resource_type="raw",
        public_id=f"resumes/{filename}",
        overwrite=False,
    )

    return result["secure_url"]


def delete_resume(file_url: str) -> None:
    """
    Delete a resume from Cloudinary using its stored secure URL.
    """

    parsed_url = urlparse(file_url)

    path = parsed_url.path

    # Expected:
    # /<cloud_name>/raw/upload/v123456789/resumes/example.pdf
    marker = "/raw/upload/"

    if marker not in path:
        return

    public_id = path.split(marker, 1)[1]

    # Remove the version segment, e.g. v123456789/
    if public_id.startswith("v"):
        parts = public_id.split("/", 1)

        if len(parts) == 2 and parts[0][1:].isdigit():
            public_id = parts[1]

    cloudinary.uploader.destroy(
        public_id,
        resource_type="raw",
        type="upload",
        invalidate=True,
    )