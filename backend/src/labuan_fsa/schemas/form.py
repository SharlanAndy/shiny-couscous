"""
Form schemas.

Pydantic schemas for form-related requests and responses.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FormCreate(BaseModel):
    """Schema for creating a form."""

    form_id: str = Field(..., description="Unique form identifier (e.g., form-a)")
    name: str = Field(..., description="Form name")
    description: Optional[str] = Field(None, description="Form description")
    category: Optional[str] = Field(None, description="Form category")
    version: str = Field("1.0.0", description="Form version")
    schema_data: dict[str, Any] = Field(..., description="Complete form schema JSON")
    is_active: bool = Field(True, description="Whether form is active")
    requires_auth: bool = Field(False, description="Whether form requires authentication")
    estimated_time: Optional[str] = Field(None, description="Estimated completion time")


class FormUpdate(BaseModel):
    """Schema for updating a form."""

    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    version: Optional[str] = None
    schema_data: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None
    requires_auth: Optional[bool] = None
    estimated_time: Optional[str] = None


class FormResponse(BaseModel):
    """Schema for form response."""

    id: UUID
    formId: str = Field(alias="form_id", serialization_alias="formId")
    name: str
    description: Optional[str]
    category: Optional[str]
    version: str
    isActive: bool = Field(alias="is_active", serialization_alias="isActive")
    requiresAuth: bool = Field(alias="requires_auth", serialization_alias="requiresAuth")
    estimatedTime: Optional[str] = Field(alias="estimated_time", serialization_alias="estimatedTime")
    createdAt: datetime = Field(alias="created_at", serialization_alias="createdAt")
    updatedAt: datetime = Field(alias="updated_at", serialization_alias="updatedAt")
    createdBy: Optional[str] = Field(alias="created_by", serialization_alias="createdBy")
    updatedBy: Optional[str] = Field(alias="updated_by", serialization_alias="updatedBy")

    model_config = {"from_attributes": True, "populate_by_name": True}


class FormSchemaResponse(BaseModel):
    """Schema for form schema response (used for dynamic rendering)."""

    formId: str = Field(alias="form_id", serialization_alias="formId")
    form_name: str
    version: str
    steps: list[dict[str, Any]]  # Step definitions with fields
    estimated_time: Optional[str]
    submit_button: Optional[dict[str, str]] = None  # Submit button config


class FormVersionResponse(BaseModel):
    """Schema for form version response."""

    id: UUID
    formId: str = Field(alias="form_id")
    version: str
    is_active: bool
    created_at: datetime
    created_by: Optional[str]
    change_notes: Optional[str]

    class Config:
        from_attributes = True

