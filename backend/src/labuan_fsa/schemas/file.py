"""
File upload schemas.

Pydantic schemas for file upload-related requests and responses.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    """Schema for file upload response."""

    id: str = Field(..., description="Internal UUID as string")
    file_id: str = Field(..., alias="fileId", description="File ID (frontend format)")
    field_name: str = Field(..., alias="fieldName")
    file_name: str = Field(..., alias="fileName")
    file_path: str = Field(..., alias="filePath")
    file_size: int = Field(..., alias="fileSize")
    mime_type: Optional[str] = Field(None, alias="mimeType")
    storage_location: str = Field(..., alias="storageLocation")
    storage_url: Optional[str] = Field(None, alias="storageUrl")
    uploaded_at: datetime = Field(..., alias="uploadedAt")
    uploaded_by: Optional[str] = Field(None, alias="uploadedBy")

    class Config:
        from_attributes = True
        populate_by_name = True

