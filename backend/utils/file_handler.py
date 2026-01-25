"""
Utility functions for file and directory management
"""

from pathlib import Path


def ensure_directories():
    """
    Ensure all required directories exist.
    Creates directories if they don't exist.
    """
    directories = [
        "processed",  # For storing processed images
        "uploads"    # For temporary upload storage (optional)
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Directory '{directory}' ready")
