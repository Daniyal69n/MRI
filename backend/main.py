"""
FastAPI Backend for MRI Image Preprocessing
Final Year Project: Brain Soft Tissue Volumetric Analysis System
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
import os
from datetime import datetime
from typing import Optional

from preprocessing.pipeline import PreprocessingPipeline
from tumor_detection.kmeans_roi import decode_data_url_image, cluster_and_extract_outputs
from utils.file_handler import ensure_directories

# Initialize FastAPI app
app = FastAPI(
    title="MRI Image Preprocessing API",
    description="Backend API for preprocessing MRI brain images",
    version="1.0.0"
)

# Configure CORS to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.brainanalysis.me",
        "https://brainanalysis.me",
        "http://localhost:3000",
    ],
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


class ClusterRequest(BaseModel):
    """
    Request body for clustering on an already-preprocessed image.
    The frontend can send `processed_image_base64` returned by /preprocess.
    """

    preprocessed_image_base64: str = Field(..., description="PNG data URL from preprocessing step")
    original_image_base64: Optional[str] = Field(None, description="Original high-res image for high-quality ROI extraction")
    k: int = Field(4, ge=2, le=8, description="Number of K-Means clusters (3 or 4 recommended)")
    min_region_area_px: int = Field(80, ge=0, description="Remove connected components smaller than this area")
    morph_kernel: int = Field(5, ge=1, le=31, description="Morphology kernel size (odd recommended)")
    min_anomaly_area_px: int = Field(50, ge=0, description="Minimum anomaly area for positive detection (false-positive filter)")


@app.post("/cluster")
async def cluster_preprocessed(req: ClusterRequest):
    """
    Cluster a PREPROCESSED MRI image (grayscale PNG in base64 data-url form).

    Returns:
    - clustered image (base64)
    - tumor candidate mask (base64)
    - final overlay with bounding box (base64)
    - ROI crop (base64 if found)
    - bbox + tumor area + affected percentage
    """
    try:
        gray_u8 = decode_data_url_image(req.preprocessed_image_base64)

        outputs = cluster_and_extract_outputs(
            preprocessed_gray_u8=gray_u8,
            k=req.k,
            min_region_area_px=req.min_region_area_px,
            morph_kernel=req.morph_kernel,
            original_image_base64=req.original_image_base64,
            min_anomaly_area_px=req.min_anomaly_area_px,
        )

        return JSONResponse(content={"message": "Clustering completed", **outputs})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clustering image: {str(e)}")


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True  # Auto-reload on code changes (development mode)
    )
