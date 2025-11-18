"""
Validation utilities.

Form data validation and file upload validation utilities.
"""

from datetime import datetime
from typing import Any

from labuan_fsa.schemas.submission import ValidationError


def validate_form_data(form_schema: dict[str, Any], data: dict[str, Any]) -> tuple[bool, list[ValidationError]]:
    """
    Validate form data against form schema.

    Args:
        form_schema: Form schema JSON (from Form.schema_data)
        data: Form data to validate (organized by step)

    Returns:
        Tuple of (is_valid, list of validation errors)
    """
    errors: list[ValidationError] = []

    # Extract steps from schema
    steps = form_schema.get("steps", [])

    # Validate each step
    for step in steps:
        step_id = step.get("stepId")
        step_data = data.get(step_id, {})

        # Validate each field in step
        fields = step.get("fields", [])
        for field in fields:
            field_id = field.get("fieldId")
            field_name = field.get("fieldName")
            field_type = field.get("fieldType")
            required = field.get("required", False)
            validation = field.get("validation", {})

            # Get field value
            field_value = step_data.get(field_name)

            # Special handling for supportingDocuments: skip validation if document-checklist is complete
            should_skip_validation = False
            if field_name == "supportingDocuments" and (field_type == "file-upload" or field_type == "upload"):
                # Check if there's a document-checklist field in the same step that is complete
                checklist_field = next(
                    (f for f in fields if f.get("fieldType") in ("document-checklist", "labuan-document-checklist")),
                    None
                )
                if checklist_field:
                    checklist_value = step_data.get(checklist_field.get("fieldName"))
                    if checklist_value and isinstance(checklist_value, dict):
                        documents = checklist_field.get("documents", [])
                        required_documents = [doc for doc in documents if doc.get("required", False)]
                        if required_documents:
                            # Check if all required documents are uploaded
                            all_required_uploaded = all(
                                checklist_value.get(doc.get("id"), {}).get("uploaded", False)
                                for doc in required_documents
                            )
                            if all_required_uploaded:
                                should_skip_validation = True

            # Check if field is empty (handles None, empty string, empty list, empty dict, False for checkboxes)
            is_empty = False
            if should_skip_validation:
                # Skip validation for supportingDocuments when checklist is complete
                is_empty = False
            elif field_value is None:
                is_empty = True
            elif field_value == "":
                is_empty = True
            elif isinstance(field_value, list) and len(field_value) == 0:
                is_empty = True
            elif isinstance(field_value, dict) and len(field_value) == 0:
                is_empty = True
            elif field_type == "checkbox" and field_value is False:
                is_empty = True

            # Check required
            if required and is_empty:
                errors.append(
                    ValidationError(
                        field_id=field_id,
                        field_name=field_name,
                        step_id=step_id,
                        error=f"{field.get('label', field_name)} is required",
                        error_code="REQUIRED",
                    )
                )
                continue

            # Skip validation if field is empty and not required
            if is_empty:
                continue

            # Validate based on field type
            if field_type.startswith("input-"):
                # Text input validation
                if "minLength" in validation:
                    if len(str(field_value)) < validation["minLength"]:
                        errors.append(
                            ValidationError(
                                field_id=field_id,
                                field_name=field_name,
                                step_id=step_id,
                                error=validation.get(
                                    "errorMessage",
                                    f"{field.get('label', field_name)} must be at least {validation['minLength']} characters",
                                ),
                                error_code="MIN_LENGTH",
                            )
                        )

                if "maxLength" in validation:
                    if len(str(field_value)) > validation["maxLength"]:
                        errors.append(
                            ValidationError(
                                field_id=field_id,
                                field_name=field_name,
                                step_id=step_id,
                                error=validation.get(
                                    "errorMessage",
                                    f"{field.get('label', field_name)} must be at most {validation['maxLength']} characters",
                                ),
                                error_code="MAX_LENGTH",
                            )
                        )

                if "pattern" in validation:
                    import re

                    pattern = validation["pattern"]
                    if not re.match(pattern, str(field_value)):
                        errors.append(
                            ValidationError(
                                field_id=field_id,
                                field_name=field_name,
                                step_id=step_id,
                                error=validation.get(
                                    "errorMessage",
                                    f"{field.get('label', field_name)} format is invalid",
                                ),
                                error_code="PATTERN_MISMATCH",
                            )
                        )

                if field_type == "input-email":
                    # Basic email validation
                    if "@" not in str(field_value) or "." not in str(field_value):
                        errors.append(
                            ValidationError(
                                field_id=field_id,
                                field_name=field_name,
                                step_id=step_id,
                                error=validation.get(
                                    "errorMessage",
                                    f"{field.get('label', field_name)} must be a valid email address",
                                ),
                                error_code="INVALID_EMAIL",
                            )
                        )

            elif field_type.startswith("select-"):
                # Select validation
                options = field.get("options", [])
                option_values = [opt.get("value") for opt in options]
                if field_value not in option_values:
                    errors.append(
                        ValidationError(
                            field_id=field_id,
                            field_name=field_name,
                            step_id=step_id,
                            error=validation.get(
                                "errorMessage",
                                f"{field.get('label', field_name)} must be one of the available options",
                            ),
                            error_code="INVALID_OPTION",
                        )
                    )

            # Add more validation rules as needed

    return len(errors) == 0, errors


def validate_file_upload(
    file_size: int, file_name: str, allowed_extensions: list[str], max_size: int
) -> tuple[bool, str | None]:
    """
    Validate file upload.

    Args:
        file_size: File size in bytes
        file_name: File name
        allowed_extensions: List of allowed file extensions (e.g., [".pdf", ".jpg"])
        max_size: Maximum file size in bytes

    Returns:
        Tuple of (is_valid, error_message if invalid)
    """
    # Check file size
    if file_size > max_size:
        return False, f"File size exceeds maximum allowed size of {max_size / 1024 / 1024:.1f}MB"

    # Check file extension
    file_ext = None
    for ext in allowed_extensions:
        if file_name.lower().endswith(ext.lower()):
            file_ext = ext
            break

    if file_ext is None:
        return False, f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"

    return True, None


def generate_submission_id() -> str:
    """
    Generate human-readable submission ID.

    Format: SUB-YYYYMMDD-XXXXXX (6-digit sequential number)

    Returns:
        Submission ID string (e.g., SUB-20251117-001234)
    """
    date_str = datetime.now().strftime("%Y%m%d")
    # In production, use database sequence for sequential number
    # For now, use timestamp-based approach
    seq_num = datetime.now().strftime("%f")[:6]  # Use microseconds for uniqueness
    return f"SUB-{date_str}-{seq_num}"

