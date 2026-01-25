# Quick Start Guide

## Step 1: Install Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

## Step 2: Start the Server

```bash
python main.py
```

The server will start at: `http://localhost:8000`

## Step 3: Test the API

### Option A: Using the Test Script

```bash
# Test with a sample image
python test_api.py path/to/your/image.png
```

### Option B: Using curl

```bash
curl -X POST "http://localhost:8000/preprocess" \
  -F "file=@path/to/your/image.png" \
  -F "denoise_method=gaussian"
```

### Option C: Using Python requests

```python
import requests

url = "http://localhost:8000/preprocess"
with open("path/to/image.png", "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)
    print(response.json())
```

### Option D: Using the Interactive API Docs

1. Start the server
2. Open browser: `http://localhost:8000/docs`
3. Click on `/preprocess` endpoint
4. Click "Try it out"
5. Upload an image file
6. Click "Execute"

## Step 4: View Results

- Processed images are saved in the `processed/` folder
- API response includes processing details and file path

## Troubleshooting

**Port already in use?**
```bash
# Use a different port
uvicorn main:app --port 8001
```

**Missing dependencies?**
```bash
pip install -r requirements.txt
```

**Import errors?**
- Make sure you're in the `backend/` directory
- Check that all `__init__.py` files exist

## Next Steps

- Integrate with Next.js frontend
- Add batch processing
- Implement advanced features
