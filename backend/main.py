"""
FastAPI Backend for MRI Image Preprocessing
Final Year Project: Brain Soft Tissue Volumetric Analysis System
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from typing import Optional

from preprocessing.pipeline import PreprocessingPipeline
from utils.file_handler import ensure_directories

# Initialize FastAPI app
app = FastAPI(
    title="MRI Image Preprocessing API",
    description="Backend API for preprocessing MRI brain images",
    version="1.0.0"
)

# Configure CORS to allow requests from Next.js frontend
# Get allowed origins from environment variable, with defaults for local development
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize preprocessing pipeline
preprocessor = PreprocessingPipeline()

# Ensure required directories exist
ensure_directories()


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "MRI Image Preprocessing API",
        "version": "1.0.0",
        "endpoints": {
            "preprocess": "POST /preprocess - Upload and preprocess MRI image",
            "health": "GET /health - Check API health status"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "MRI Preprocessing API"
    }


@app.post("/preprocess")
async def preprocess_image(
    file: UploadFile = File(...),
    denoise_method: Optional[str] = "gaussian"
):
    """
    Preprocess MRI image through the complete pipeline.
    
    Parameters:
    - file: MRI image file (supports: .jpg, .jpeg, .png, .dcm, .nii, .nii.gz)
    - denoise_method: Denoising method - "gaussian" or "median" (default: "gaussian")
    
    Returns:
    - JSON response with preprocessing results
    """
    try:
        # Validate file type
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.dcm', '.nii', '.gz'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions and not file.filename.endswith('.nii.gz'):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Validate denoise method
        if denoise_method not in ["gaussian", "median"]:
            raise HTTPException(
                status_code=400,
                detail="denoise_method must be 'gaussian' or 'median'"
            )
        
        # Read uploaded file
        file_contents = await file.read()
        
        # Process image through preprocessing pipeline
        result = preprocessor.process(
            file_contents=file_contents,
            filename=file.filename,
            denoise_method=denoise_method
        )
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes (development mode)
    )
