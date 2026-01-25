"""
MRI Image Preprocessing Pipeline
Implements all preprocessing steps for brain MRI images
"""

import cv2
import numpy as np
from PIL import Image
import io
import os
import base64
from datetime import datetime
from typing import Dict, Tuple, Optional
from pathlib import Path

# Optional medical image format support
try:
    import pydicom
    PYDICOM_AVAILABLE = True
except ImportError:
    PYDICOM_AVAILABLE = False

try:
    import nibabel as nib
    NIBABEL_AVAILABLE = True
except ImportError:
    NIBABEL_AVAILABLE = False

from preprocessing.steps import (
    resize_image,
    convert_to_grayscale,
    apply_denoising,
    perform_skull_stripping,
    apply_histogram_equalization,
    normalize_intensity
)


class PreprocessingPipeline:
    """
    Complete preprocessing pipeline for MRI brain images.
    Executes all preprocessing steps in sequence.
    """
    
    def __init__(self):
        self.processed_dir = Path("processed")
        self.processed_dir.mkdir(exist_ok=True)
    
    def process(
        self,
        file_contents: bytes,
        filename: str,
        denoise_method: str = "gaussian"
    ) -> Dict:
        """
        Process MRI image through complete preprocessing pipeline.
        
        Args:
            file_contents: Image file as bytes
            filename: Original filename
            denoise_method: "gaussian" or "median"
        
        Returns:
            Dictionary with processing results and metadata
        """
        try:
            # Step 1: Load image from bytes
            image = self._load_image(file_contents, filename)
            original_shape = image.shape
            
            # Step 2: Resize to 256x256
            image = resize_image(image, target_size=(256, 256))
            print("✓ Resized to 256x256")
            
            # Step 3: Convert to grayscale (if needed)
            image = convert_to_grayscale(image)
            print("✓ Converted to grayscale")
            
            # Step 4: Denoising
            image = apply_denoising(image, method=denoise_method)
            print(f"✓ Applied {denoise_method} denoising")
            
            # Step 5: Skull stripping
            image, mask = perform_skull_stripping(image)
            print("✓ Performed skull stripping")
            
            # Step 6: Histogram equalization
            image = apply_histogram_equalization(image, mask)
            print("✓ Applied histogram equalization")
            
            # Step 7: Intensity normalization (0-1 range)
            image = normalize_intensity(image)
            print("✓ Normalized intensity to 0-1 range")
            
            # Save processed image
            processed_filename = self._save_processed_image(image, filename)
            
            # Convert processed image to base64 for frontend display
            processed_image_base64 = self._image_to_base64(image)
            
            # Prepare response
            result = {
                "message": "Image preprocessed successfully",
                "original_shape": list(original_shape),
                "processed_shape": list(image.shape),
                "processing_steps": [
                    "Resize to 256x256",
                    "Convert to grayscale",
                    f"Denoising ({denoise_method})",
                    "Skull stripping",
                    "Histogram equalization",
                    "Intensity normalization (0-1)"
                ],
                "processed_image_path": processed_filename,
                "processed_image_base64": processed_image_base64,  # Base64 encoded image for frontend
                "timestamp": datetime.now().isoformat(),
                "filename": filename
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Pipeline processing error: {str(e)}")
    
    def _load_image(self, file_contents: bytes, filename: str) -> np.ndarray:
        """
        Load image from bytes, supporting multiple formats.
        
        Supports:
        - Standard images: JPG, PNG
        - Medical images: DICOM (.dcm), NIfTI (.nii, .nii.gz)
        """
        file_extension = os.path.splitext(filename)[1].lower()
        
        try:
            # Handle DICOM files
            if file_extension == '.dcm':
                if not PYDICOM_AVAILABLE:
                    raise Exception("DICOM support requires pydicom. Install with: pip install pydicom")
                dicom_file = pydicom.dcmread(io.BytesIO(file_contents))
                image = dicom_file.pixel_array.astype(np.float32)
                # Normalize DICOM pixel values to 0-255 range
                if image.max() > 255:
                    image = ((image - image.min()) / (image.max() - image.min()) * 255).astype(np.uint8)
                else:
                    image = image.astype(np.uint8)
                return image
            
            # Handle NIfTI files
            elif filename.endswith('.nii.gz') or file_extension == '.nii':
                if not NIBABEL_AVAILABLE:
                    raise Exception("NIfTI support requires nibabel. Install with: pip install nibabel")
                nii_file = nib.load(io.BytesIO(file_contents))
                image = nii_file.get_fdata()
                # Take middle slice if 3D
                if len(image.shape) == 3:
                    image = image[:, :, image.shape[2] // 2]
                # Normalize to 0-255 range
                image = ((image - image.min()) / (image.max() - image.min()) * 255).astype(np.uint8)
                return image
            
            # Handle standard image formats (JPG, PNG)
            else:
                image = Image.open(io.BytesIO(file_contents))
                # Convert PIL image to numpy array
                image = np.array(image)
                return image
                
        except Exception as e:
            raise Exception(f"Error loading image: {str(e)}")
    
    def _save_processed_image(self, image: np.ndarray, original_filename: str) -> str:
        """
        Save processed image to processed/ directory.
        
        Args:
            image: Processed image array (0-1 range)
            original_filename: Original filename
        
        Returns:
            Path to saved processed image
        """
        # Convert from 0-1 range to 0-255 for saving
        image_to_save = (image * 255).astype(np.uint8)
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(os.path.basename(original_filename))[0]
        processed_filename = f"{base_name}_processed_{timestamp}.png"
        processed_path = self.processed_dir / processed_filename
        
        # Save image
        cv2.imwrite(str(processed_path), image_to_save)
        
        return str(processed_path)
    
    def _image_to_base64(self, image: np.ndarray) -> str:
        """
        Convert processed image to base64 string for frontend display.
        
        Args:
            image: Processed image array (0-1 range)
        
        Returns:
            Base64 encoded image string
        """
        # Convert from 0-1 range to 0-255
        image_uint8 = (image * 255).astype(np.uint8)
        
        # Encode image to PNG format
        success, buffer = cv2.imencode('.png', image_uint8)
        if not success:
            raise Exception("Failed to encode image")
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/png;base64,{image_base64}"
