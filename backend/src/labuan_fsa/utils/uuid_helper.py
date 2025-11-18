"""
Helper function to safely convert submission IDs to UUIDs.
"""
from uuid import UUID, uuid4
from typing import Union


def safe_uuid_convert(value: Union[str, UUID, None]) -> UUID:
    """
    Safely convert a value to UUID.
    
    If the value is a custom submission ID (like "SUB-20251118-123456"),
    generate a new UUID instead of trying to parse it.
    
    Args:
        value: String, UUID, or None to convert
        
    Returns:
        UUID object
    """
    if value is None:
        return uuid4()
    
    if isinstance(value, UUID):
        return value
    
    if isinstance(value, str):
        # Try to parse as UUID (UUIDs are 36 characters with dashes)
        if len(value) == 36 and value.count('-') == 4:
            try:
                return UUID(value)
            except (ValueError, AttributeError):
                pass
        
        # If it's a custom ID format (like "SUB-20251118-123456"), generate new UUID
        return uuid4()
    
    # Fallback: generate new UUID
    return uuid4()

