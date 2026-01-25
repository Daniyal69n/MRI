# MRI Image Preprocessing Backend

FastAPI backend for preprocessing MRI brain images as part of the Brain Soft Tissue Volumetric Analysis System.

## Features

- Complete preprocessing pipeline:
  - Image resizing (256×256)
  - Grayscale conversion
  - Denoising (Gaussian/Median filter)
  - Skull stripping
  - Histogram equalization
  - Intensity normalization (0-1 range)

- Supports multiple image formats:
  - Standard: JPG, PNG
  - Medical: DICOM (.dcm), NIfTI (.nii, .nii.gz)

## Installation

1. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On Linux/Mac:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

**Development mode (with auto-reload):**
```bash
python main.py
```

**Or using uvicorn directly:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### 1. Root Endpoint
- **GET** `/`
- Returns API information and available endpoints

### 2. Health Check
- **GET** `/health`
- Returns API health status

### 3. Preprocess Image
- **POST** `/preprocess`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Image file (required)
  - `denoise_method`: "gaussian" or "median" (optional, default: "gaussian")

**Example Request (using curl):**
```bash
curl -X POST "http://localhost:8000/preprocess" \
  -F "file=@path/to/your/mri_image.png" \
  -F "denoise_method=gaussian"
```

**Example Response:**
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

## API Documentation

Once the server is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── preprocessing/
│   ├── __init__.py
│   ├── pipeline.py        # Main preprocessing pipeline
│   └── steps.py           # Individual preprocessing steps
├── utils/
│   ├── __init__.py
│   └── file_handler.py    # File/directory utilities
└── processed/             # Output directory (created automatically)
```

## Preprocessing Pipeline Details

1. **Resize (256×256):** Standardizes image dimensions for consistent processing
2. **Grayscale Conversion:** Ensures single-channel processing
3. **Denoising:** Reduces noise using Gaussian or Median filter
4. **Skull Stripping:** Removes non-brain tissue using intensity thresholding and morphological operations
5. **Histogram Equalization:** Enhances contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
6. **Intensity Normalization:** Normalizes pixel values to 0-1 range for machine learning compatibility

## Error Handling

The API includes comprehensive error handling for:
- Invalid file formats
- Corrupted images
- Processing errors
- Missing parameters

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Next.js default port)
- `http://127.0.0.1:3000`

To add more origins, modify `main.py` CORS settings.

## Notes

- Processed images are saved in the `processed/` directory
- The backend works without GPU (CPU-only)
- All preprocessing steps are implemented using OpenCV and NumPy
- Suitable for university Final Year Project

## Future Enhancements

- Batch processing support
- Progress tracking for large files
- Advanced skull stripping using deep learning
- Support for 3D volume processing
- Integration with machine learning models
