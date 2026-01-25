# Testing the Backend

## Quick Test Methods

### 1. Test with Browser (Swagger UI)

1. Make sure backend is running: `python main.py`
2. Open browser: `http://localhost:8000/docs`
3. Click on `/preprocess` endpoint
4. Click "Try it out"
5. Upload an image file
6. Click "Execute"
7. See the results!

### 2. Test with curl

```bash
curl -X POST "http://localhost:8000/preprocess" \
  -F "file=@path/to/your/image.png" \
  -F "denoise_method=gaussian"
```

### 3. Test with Python script

```bash
python test_api.py path/to/your/image.png
```

### 4. Test from Next.js Frontend

1. Start Next.js: `cd my-app && npm run dev`
2. Start FastAPI: `cd backend && python main.py`
3. Go to: `http://localhost:3000/dashboard/upload`
4. Register a patient
5. Upload an MRI image
6. See preprocessing results!

## Expected Response

```json
{
  "message": "Image preprocessed successfully",
  "original_shape": [512, 512],
  "processed_shape": [256, 256],
  "processing_steps": [
    "Resize to 256x256",
    "Convert to grayscale",
    "Denoising (gaussian)",
    "Skull stripping",
    "Histogram equalization",
    "Intensity normalization (0-1)"
  ],
  "processed_image_path": "processed/image_processed_20250122_120000.png",
  "timestamp": "2025-01-22T12:00:00.123456",
  "filename": "mri_image.png"
}
```

## Troubleshooting

**Backend not responding?**
- Check if it's running: Look for "Uvicorn running on http://0.0.0.0:8000"
- Check port 8000 is not in use

**CORS errors?**
- Make sure CORS is configured in `main.py` for `http://localhost:3000`

**Image not processing?**
- Check file format is supported (PNG, JPG, DICOM, NIfTI)
- Check file is not corrupted
- Check backend logs for errors
