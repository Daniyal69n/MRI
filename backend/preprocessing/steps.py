"""
Individual preprocessing steps for MRI images
Each function implements a specific preprocessing operation
"""

import cv2
import numpy as np
from typing import Tuple, Optional


def resize_image(image: np.ndarray, target_size: Tuple[int, int] = (256, 256)) -> np.ndarray:
    """
    Resize image to target dimensions.
    
    Args:
        image: Input image array
        target_size: Target (width, height) dimensions
    
    Returns:
        Resized image
    """
    if len(image.shape) == 3:
        # Color image
        resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
    else:
        # Grayscale image
        resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
    
    return resized


def convert_to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Convert image to grayscale if it's not already.
    
    Args:
        image: Input image array (can be color or grayscale)
    
    Returns:
        Grayscale image array
    """
    if len(image.shape) == 3:
        # Convert color to grayscale
        if image.shape[2] == 3:
            # RGB image
            grayscale = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        elif image.shape[2] == 4:
            # RGBA image
            grayscale = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
        else:
            # Already grayscale or single channel
            grayscale = image[:, :, 0]
    else:
        # Already grayscale
        grayscale = image.copy()
    
    return grayscale


def apply_denoising(image: np.ndarray, method: str = "gaussian") -> np.ndarray:
    """
    Apply denoising filter to reduce noise in the image.
    
    Args:
        image: Input grayscale image
        method: "gaussian" or "median"
    
    Returns:
        Denoised image
    """
    if method == "gaussian":
        # Gaussian blur for noise reduction
        # Kernel size must be odd
        denoised = cv2.GaussianBlur(image, (5, 5), sigmaX=1.0, sigmaY=1.0)
    elif method == "median":
        # Median filter for noise reduction (better for salt-and-pepper noise)
        denoised = cv2.medianBlur(image, 5)
    else:
        raise ValueError(f"Unknown denoising method: {method}")
    
    return denoised


def perform_skull_stripping(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Perform skull stripping using intensity thresholding and morphological operations.
    
    This is a simplified skull stripping method suitable for brain MRI images.
    More advanced methods would use deep learning or atlas-based approaches.
    
    Args:
        image: Input grayscale brain image
    
    Returns:
        Tuple of (skull-stripped image, binary mask)
    """
    # Step 1: Apply Otsu's thresholding to separate brain from background
    # Otsu's method automatically determines optimal threshold
    _, binary_mask = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Step 2: Morphological operations to clean up the mask
    # Remove small noise
    kernel = np.ones((5, 5), np.uint8)
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel, iterations=2)
    
    # Step 3: Find the largest connected component (brain region)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_mask, connectivity=8)
    
    if num_labels > 1:
        # Find largest component (excluding background)
        largest_component = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        # Create mask with only largest component
        brain_mask = (labels == largest_component).astype(np.uint8) * 255
    else:
        # If no components found, use original mask
        brain_mask = binary_mask
    
    # Step 4: Apply mask to original image
    skull_stripped = cv2.bitwise_and(image, image, mask=brain_mask)
    
    return skull_stripped, brain_mask


def apply_histogram_equalization(image: np.ndarray, mask: Optional[np.ndarray] = None) -> np.ndarray:
    """
    Apply histogram equalization to enhance contrast.
    
    Args:
        image: Input grayscale image
        mask: Optional binary mask (for masked histogram equalization)
    
    Returns:
        Contrast-enhanced image
    """
    if mask is not None:
        # Apply histogram equalization only to masked region
        # Create masked image
        masked_image = cv2.bitwise_and(image, image, mask=mask)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # CLAHE is better than standard histogram equalization for medical images
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        equalized = clahe.apply(masked_image)
        
        # Combine with original background
        result = image.copy()
        result[mask > 0] = equalized[mask > 0]
    else:
        # Apply CLAHE to entire image
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        result = clahe.apply(image)
    
    return result


def normalize_intensity(image: np.ndarray) -> np.ndarray:
    """
    Normalize image intensity to 0-1 range.
    
    Args:
        image: Input image array
    
    Returns:
        Normalized image (0-1 range, float32)
    """
    # Convert to float32
    image_float = image.astype(np.float32)
    
    # Get min and max values
    min_val = image_float.min()
    max_val = image_float.max()
    
    # Avoid division by zero
    if max_val - min_val > 0:
        normalized = (image_float - min_val) / (max_val - min_val)
    else:
        normalized = image_float / 255.0  # Fallback normalization
    
    return normalized
