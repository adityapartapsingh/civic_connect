"""
Cloudinary Media Service for Civic Connect.

Handles secure upload, optimization, and management of civic hazard evidence photos,
resolution verification proofs, and video pans with automatic fallback to local
storage when Cloudinary credentials are not provided.
"""

from __future__ import annotations

import datetime
import logging
import os
from typing import Any, Dict, Optional, Tuple

from django.conf import settings
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)

# Try importing cloudinary
try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False
    logger.warning("Cloudinary package not available. Falling back to local storage.")


def is_cloudinary_configured() -> bool:
    """
    Check if Cloudinary credentials are fully configured via environment variables
    or Django settings.
    """
    if not CLOUDINARY_AVAILABLE:
        return False

    cloudinary_url = os.getenv("CLOUDINARY_URL") or getattr(settings, "CLOUDINARY_URL", "")
    if cloudinary_url:
        return True

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME") or getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
    api_key = os.getenv("CLOUDINARY_API_KEY") or getattr(settings, "CLOUDINARY_API_KEY", "")
    api_secret = os.getenv("CLOUDINARY_API_SECRET") or getattr(settings, "CLOUDINARY_API_SECRET", "")

    return bool(cloud_name and api_key and api_secret)


def configure_cloudinary() -> None:
    """
    Initialize Cloudinary configuration if credentials are set.
    """
    if not is_cloudinary_configured():
        return

    cloudinary_url = os.getenv("CLOUDINARY_URL") or getattr(settings, "CLOUDINARY_URL", "")
    if cloudinary_url:
        cloudinary.config(cloudinary_url=cloudinary_url, secure=True)
        return

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME") or getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
    api_key = os.getenv("CLOUDINARY_API_KEY") or getattr(settings, "CLOUDINARY_API_KEY", "")
    api_secret = os.getenv("CLOUDINARY_API_SECRET") or getattr(settings, "CLOUDINARY_API_SECRET", "")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def upload_media(
    file_obj: Any,
    folder: str = "civic_connect/reports",
    public_id: Optional[str] = None,
    resource_type: str = "auto",
    request: Any = None,
) -> Tuple[str, Dict[str, Any]]:
    """
    Upload media (photo or video) to Cloudinary.

    If Cloudinary is configured, uploads directly to Cloudinary with secure SSL URL.
    If Cloudinary is not configured or upload encounters a network issue,
    falls back cleanly to Django default_storage.

    Args:
        file_obj: Django UploadedFile, file-like object, or filepath.
        folder: Cloudinary directory path (default: 'civic_connect/reports').
        public_id: Optional custom public identifier.
        resource_type: 'image', 'video', or 'auto'.
        request: Optional HttpRequest object for generating absolute URLs on fallback.

    Returns:
        Tuple[str, Dict[str, Any]]:
            - secure_url: The public URL of the uploaded media file.
            - metadata: Detailed upload metadata (provider, format, public_id, bytes).
    """
    if not file_obj:
        return "", {}

    # Ensure file pointer is at the beginning
    if hasattr(file_obj, "seek") and callable(file_obj.seek):
        file_obj.seek(0)

    # 1. Attempt Cloudinary upload if configured
    if is_cloudinary_configured():
        try:
            configure_cloudinary()
            timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            target_public_id = public_id or f"{getattr(file_obj, 'name', 'media')}_{timestamp_str}"
            # Strip invalid characters from public_id
            target_public_id = os.path.splitext(os.path.basename(str(target_public_id)))[0]

            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                public_id=target_public_id,
                resource_type=resource_type,
                overwrite=True,
                quality="auto",
                fetch_format="auto",
            )

            # Reset pointer after Cloudinary read so fraud detectors can read it
            if hasattr(file_obj, "seek") and callable(file_obj.seek):
                file_obj.seek(0)

            secure_url = upload_result.get("secure_url") or upload_result.get("url")
            logger.info("Successfully uploaded media to Cloudinary: %s", secure_url)

            metadata = {
                "provider": "cloudinary",
                "public_id": upload_result.get("public_id"),
                "format": upload_result.get("format"),
                "bytes": upload_result.get("bytes"),
                "resource_type": upload_result.get("resource_type"),
                "secure_url": secure_url,
            }
            return secure_url, metadata

        except Exception as exc:
            logger.warning(
                "Cloudinary upload failed (%s). Falling back to local storage.", exc
            )
            # Reset pointer before fallback storage read
            if hasattr(file_obj, "seek") and callable(file_obj.seek):
                file_obj.seek(0)

    # 2. Fallback to Django default_storage (local filesystem)
    timestamp_prefix = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = getattr(file_obj, "name", "upload.jpg")
    clean_name = os.path.basename(file_name)
    save_rel_path = f"{folder.strip('/')}/{timestamp_prefix}_{clean_name}"

    saved_path = default_storage.save(save_rel_path, file_obj)

    # Reset file pointer again so subsequent fraud checks can process it
    if hasattr(file_obj, "seek") and callable(file_obj.seek):
        file_obj.seek(0)

    media_url = getattr(settings, "MEDIA_URL", "/media/")
    if request and hasattr(request, "build_absolute_uri"):
        full_url = request.build_absolute_uri(f"{media_url}{saved_path}")
    else:
        full_url = f"{media_url}{saved_path}"

    metadata = {
        "provider": "local_storage",
        "public_id": saved_path,
        "format": os.path.splitext(clean_name)[1].lstrip("."),
        "bytes": getattr(file_obj, "size", 0),
        "resource_type": resource_type,
        "secure_url": full_url,
    }

    return full_url, metadata


def delete_media(public_id: str, resource_type: str = "image") -> bool:
    """
    Delete a media asset from Cloudinary or local storage.
    """
    if not public_id:
        return False

    if is_cloudinary_configured():
        try:
            configure_cloudinary()
            res = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            return res.get("result") == "ok"
        except Exception as exc:
            logger.error("Cloudinary delete failed: %s", exc)
            return False

    if default_storage.exists(public_id):
        default_storage.delete(public_id)
        return True

    return False
