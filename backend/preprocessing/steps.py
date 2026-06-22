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
    # Step 1: Smooth before thresholding to stabilize the mask.
    blurred = cv2.GaussianBlur(image, (5, 5), sigmaX=0.8, sigmaY=0.8)

    # Step 2: Otsu thresholding to separate foreground from background.
    _, binary_mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Step 3: Morphological cleanup.
    kernel = np.ones((5, 5), np.uint8)
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # Step 4: Keep the best foreground component near the center and away from the border.
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_mask, connectivity=8)
    if num_labels > 1:
        height, width = image.shape[:2]
        center_x, center_y = width / 2.0, height / 2.0
        best_label = 1
        best_score = -1.0

        for label_index in range(1, num_labels):
            area = float(stats[label_index, cv2.CC_STAT_AREA])
            x = int(stats[label_index, cv2.CC_STAT_LEFT])
            y = int(stats[label_index, cv2.CC_STAT_TOP])
            w = int(stats[label_index, cv2.CC_STAT_WIDTH])
            h = int(stats[label_index, cv2.CC_STAT_HEIGHT])
            if area < 80:
                continue

            touches_border = x <= 1 or y <= 1 or (x + w) >= width - 1 or (y + h) >= height - 1
            cx, cy = centroids[label_index]
            center_distance = np.hypot(cx - center_x, cy - center_y)

            score = area - (0.20 * center_distance)
            if touches_border:
                score -= 0.35 * area

            if score > best_score:
                best_score = score
                best_label = label_index

        brain_mask = (labels == best_label).astype(np.uint8) * 255
        brain_mask = cv2.morphologyEx(brain_mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    else:
        brain_mask = binary_mask

    # Step 5: Apply mask to original image.
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
