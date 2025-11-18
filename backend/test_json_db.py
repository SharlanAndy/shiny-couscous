#!/usr/bin/env python3
"""Test script to verify JSON database is working."""
import sys
import asyncio
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from labuan_fsa.json_db import get_forms, initialize_default_data

async def test():
    print("Testing JSON database...")
    await initialize_default_data()
    forms = await get_forms()
    print(f"Found {len(forms)} forms")
    for form in forms:
        print(f"  - {form.get('name')} (ID: {form.get('formId')})")

if __name__ == "__main__":
    asyncio.run(test())

