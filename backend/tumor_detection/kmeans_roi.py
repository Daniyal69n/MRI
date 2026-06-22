"""
K-Means based brain tumor ROI extraction (classical CV, no deep learning).

This module is designed as the "next phase" after preprocessing:
- Takes a preprocessed MRI slice (preferred) or can run the existing preprocessing pipeline.
- Segments intensity regions using K-Means (K=3 or K=4).
- Picks the most suspicious "tumor" cluster via a simple intensity-based heuristic.
- Cleans noise using morphological operations + connected component filtering.
- Extracts ROI (bounding box) and computes tumor area + affected percentage.
- Displays all stages using Matplotlib.

NOTE:
- This is a heuristic approach. Without ground-truth masks it cannot be "clinically correct",
  but it can provide a reasonable suspicious-region highlight for demos/research baselines.
"""

from __future__ import annotations

from dataclasses import dataclass
import base64
from pathlib import Path
from typing import Dict, Optional, Tuple

import cv2
import numpy as np
from sklearn.cluster import KMeans

try:
    import skfuzzy as fuzz
    FUZZY_CMEANS_AVAILABLE = True
except ImportError:
    fuzz = None
    FUZZY_CMEANS_AVAILABLE = False

import matplotlib.pyplot as plt

from preprocessing.pipeline import PreprocessingPipeline


@dataclass
class RoiResult:
    bbox_xywh: Optional[Tuple[int, int, int, int]]  # x, y, w, h
    roi: Optional[np.ndarray]
    tumor_mask: np.ndarray  # uint8 0/255
    tumor_area_px: int
    affected_percent: float  # tumor_area / brain_area * 100


@dataclass
class VolumetricAnalysisResult:
    """Whole-brain tissue volumetric analysis results."""
    gm_pixels: int  # Gray Matter pixel count
    wm_pixels: int  # White Matter pixel count
    csf_pixels: int  # Cerebrospinal Fluid pixel count
    total_brain_pixels: int
    gm_percent: float
    wm_percent: float
    csf_percent: float
    gm_mask: np.ndarray  # uint8 binary mask
    wm_mask: np.ndarray  # uint8 binary mask
    csf_mask: np.ndarray  # uint8 binary mask


def _to_data_url_png(gray_or_bgr: np.ndarray) -> str:
    """
    Encode a grayscale (H,W) or BGR/RGB (H,W,3) uint8 image to PNG data URL.
    """
    if gray_or_bgr.dtype != np.uint8:
        raise ValueError("_to_data_url_png expects uint8 image")
    if gray_or_bgr.ndim == 2:
        img = gray_or_bgr
    elif gray_or_bgr.ndim == 3 and gray_or_bgr.shape[2] == 3:
        img = gray_or_bgr
    else:
        raise ValueError("Unsupported image shape for PNG encoding")

    ok, buf = cv2.imencode(".png", img)
    if not ok:
        raise RuntimeError("Failed to encode PNG")
    b64 = base64.b64encode(buf).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def decode_data_url_image(data_url: str) -> np.ndarray:
    """
    Decode a data URL like 'data:image/png;base64,...' into a grayscale uint8 image.
    """
    if not isinstance(data_url, str) or "base64," not in data_url:
        raise ValueError("Invalid data URL")
    b64 = data_url.split("base64,", 1)[1]
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Failed to decode image from base64")
    return img


def _remove_small_components(mask: np.ndarray, min_size_px: int = 50) -> np.ndarray:
    """
    Remove isolated connected components smaller than min_size_px.
    
    Args:
        mask: binary mask (uint8, 0/255)
        min_size_px: minimum component size in pixels
        
    Returns:
        Cleaned binary mask with small components removed
    """
    if int(np.count_nonzero(mask)) == 0:
        return mask.copy()
    
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    cleaned = np.zeros_like(mask)
    
    for label_id in range(1, num_labels):
        area = int(stats[label_id, cv2.CC_STAT_AREA])
        if area >= min_size_px:
            cleaned[labels == label_id] = 255
    
    return cleaned


def _smooth_tissue_mask(
    mask: np.ndarray,
    morph_kernel: int = 5,
    median_kernel: int = 5,
    apply_closing: bool = True,
    apply_opening: bool = True,
) -> np.ndarray:
    """
    Apply morphological operations to smooth and clean tissue mask.
    
    Args:
        mask: binary mask (uint8)
        morph_kernel: morphological kernel size
        median_kernel: median filter kernel size
        apply_closing: apply closing (fill small holes)
        apply_opening: apply opening (remove small noise)
        
    Returns:
        Smoothed binary mask
    """
    if int(np.count_nonzero(mask)) == 0:
        return mask.copy()
    
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (morph_kernel, morph_kernel))
    
    result = mask.copy()
    
    # Closing: fill small holes inside regions
    if apply_closing:
        result = cv2.morphologyEx(result, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Opening: remove small noise
    if apply_opening:
        result = cv2.morphologyEx(result, cv2.MORPH_OPEN, kernel, iterations=1)
    
    # Median filtering: smooth boundaries
    if median_kernel > 1 and median_kernel % 2 == 1:
        result = cv2.medianBlur(result, median_kernel)
    
    return result


def _enforce_non_overlap(
    gm_mask: np.ndarray,
    wm_mask: np.ndarray,
    csf_mask: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Enforce non-overlapping tissue masks by priority-based assignment.
    
    Priority: WM > GM > CSF
    (WM gets priority as it's often the brightest and most distinct)
    
    Args:
        gm_mask: Gray Matter binary mask
        wm_mask: White Matter binary mask
        csf_mask: CSF binary mask
        
    Returns:
        Tuple of refined (gm_mask, wm_mask, csf_mask) without overlaps
    """
    # Create overlap regions
    gm_refined = gm_mask.copy()
    wm_refined = wm_mask.copy()
    csf_refined = csf_mask.copy()
    
    # WM priority: remove WM from GM and CSF
    wm_pixels = wm_refined > 0
    gm_refined[wm_pixels] = 0
    csf_refined[wm_pixels] = 0
    
    # GM priority: remove GM from CSF
    gm_pixels = gm_refined > 0
    csf_refined[gm_pixels] = 0
    
    return gm_refined, wm_refined, csf_refined


def _estimate_cortical_thickness_map(brain_mask: np.ndarray, distance_kernel: int = 5) -> np.ndarray:
    """
    Create a cortical distance map using distance transform.
    Outer regions (small distance) likely cortical, inner regions likely WM.
    
    Args:
        brain_mask: binary brain mask
        distance_kernel: kernel size for morphology
        
    Returns:
        Distance map (0=border, high=center)
    """
    if int(np.count_nonzero(brain_mask)) == 0:
        return np.zeros_like(brain_mask, dtype=np.float32)
    
    # Distance from border (outer cortex has low distance)
    distance = cv2.distanceTransform(brain_mask, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    
    # Normalize to 0-1
    if distance.max() > 0:
        distance = distance / distance.max()
    
    return distance.astype(np.float32)


def classify_tissue_types(
    gray_u8: np.ndarray,
    labels: np.ndarray,
    centers: np.ndarray,
    brain_mask: np.ndarray,
) -> Dict[str, np.ndarray]:
    """
    Classify FCM clusters into Gray Matter (GM), White Matter (WM), and CSF.

    Enhanced algorithm:
    - Uses intensity ranges + spatial constraints
    - CSF: darkest (lowest intensity) - ventricles, sparse regions
    - GM: mid-range intensity - cortical surface, anatomically outer
    - WM: brightest (highest intensity) - internal white matter

    Returns:
        Dict with:
        - gm_mask: Gray Matter binary mask (uint8), cleaned and smoothed
        - wm_mask: White Matter binary mask (uint8), cleaned and smoothed
        - csf_mask: CSF binary mask (uint8), cleaned and smoothed
        - tissue_labels: cluster ID to tissue type mapping
    """
    # Sort clusters by intensity (ascending: CSF/dark -> GM/mid -> WM/bright)
    sorted_indices = np.argsort(centers)
    
    # Analyze cluster properties for better mapping
    num_clusters = len(centers)
    cluster_sizes = {}
    
    for cluster_id in range(num_clusters):
        size = int(np.count_nonzero(labels == cluster_id))
        cluster_sizes[cluster_id] = size
    
    # Identify tissue types with improved heuristics
    tissue_labels = {}
    
    if num_clusters == 3:
        # K=3: typical split is [CSF, GM, WM]
        tissue_labels[sorted_indices[0]] = "csf"
        tissue_labels[sorted_indices[1]] = "gm"
        tissue_labels[sorted_indices[2]] = "wm"
    elif num_clusters == 4:
        # K=4: identify and skip background/noise clusters
        bg_threshold_low = 15
        bg_threshold_high = 240
        
        # Find background candidates (very dark or very bright)
        bg_candidates = []
        for idx in sorted_indices:
            center_val = centers[idx]
            if center_val < bg_threshold_low or center_val > bg_threshold_high:
                # Could be background, but check size
                if cluster_sizes[idx] < 100:  # Very small clusters likely noise
                    bg_candidates.append(idx)
        
        if len(bg_candidates) > 0:
            # Remove background candidates from assignment
            tissue_indices = [i for i in sorted_indices if i not in bg_candidates]
            if len(tissue_indices) >= 3:
                tissue_labels[tissue_indices[0]] = "csf"
                tissue_labels[tissue_indices[1]] = "gm"
                tissue_labels[tissue_indices[2]] = "wm"
            else:
                # Fallback: use first 3 sorted
                tissue_labels[sorted_indices[0]] = "csf"
                tissue_labels[sorted_indices[1]] = "gm"
                tissue_labels[sorted_indices[2]] = "wm"
        else:
            # No clear background, use intensity ranking
            tissue_labels[sorted_indices[0]] = "csf"
            tissue_labels[sorted_indices[1]] = "gm"
            tissue_labels[sorted_indices[2]] = "wm"
    else:
        # Fallback for K>4: assign by intensity rank
        tissue_labels[sorted_indices[0]] = "csf"
        if num_clusters >= 2:
            tissue_labels[sorted_indices[1]] = "gm"
        if num_clusters >= 3:
            tissue_labels[sorted_indices[2]] = "wm"

    # Create raw tissue masks from cluster assignment
    gm_mask_raw = np.zeros_like(gray_u8, dtype=np.uint8)
    wm_mask_raw = np.zeros_like(gray_u8, dtype=np.uint8)
    csf_mask_raw = np.zeros_like(gray_u8, dtype=np.uint8)

    for cluster_id, tissue_type in tissue_labels.items():
        cluster_mask = (labels == cluster_id).astype(np.uint8) * 255
        cluster_mask = cv2.bitwise_and(cluster_mask, brain_mask)
        
        if tissue_type == "gm":
            gm_mask_raw = np.maximum(gm_mask_raw, cluster_mask)
        elif tissue_type == "wm":
            wm_mask_raw = np.maximum(wm_mask_raw, cluster_mask)
        elif tissue_type == "csf":
            csf_mask_raw = np.maximum(csf_mask_raw, cluster_mask)

    # Post-processing: morphological cleaning and smoothing
    # Remove small isolated components (minimum 50 pixels)
    gm_mask = _remove_small_components(gm_mask_raw, min_size_px=50)
    wm_mask = _remove_small_components(wm_mask_raw, min_size_px=50)
    csf_mask = _remove_small_components(csf_mask_raw, min_size_px=30)  # CSF can be smaller
    
    # Smooth masks with morphological operations
    gm_mask = _smooth_tissue_mask(gm_mask, morph_kernel=5, median_kernel=5, apply_closing=True, apply_opening=True)
    wm_mask = _smooth_tissue_mask(wm_mask, morph_kernel=5, median_kernel=5, apply_closing=True, apply_opening=True)
    csf_mask = _smooth_tissue_mask(csf_mask, morph_kernel=3, median_kernel=3, apply_closing=True, apply_opening=False)
    
    # Enforce non-overlapping masks with priority system
    gm_mask, wm_mask, csf_mask = _enforce_non_overlap(gm_mask, wm_mask, csf_mask)
    
    # Final validation: ensure all masks are uint8 0/255
    gm_mask = np.where(gm_mask > 0, 255, 0).astype(np.uint8)
    wm_mask = np.where(wm_mask > 0, 255, 0).astype(np.uint8)
    csf_mask = np.where(csf_mask > 0, 255, 0).astype(np.uint8)

    return {
        "gm_mask": gm_mask,
        "wm_mask": wm_mask,
        "csf_mask": csf_mask,
        "tissue_labels": tissue_labels,
    }


def calculate_volumetric_stats(
    gm_mask: np.ndarray,
    wm_mask: np.ndarray,
    csf_mask: np.ndarray,
    brain_mask: np.ndarray,
    tumor_mask: Optional[np.ndarray] = None,
) -> VolumetricAnalysisResult:
    """
    Calculate whole-brain volumetric statistics from refined tissue masks.

    Excludes tumor pixels from normal tissue masks for accurate analysis.

    Args:
        gm_mask: Gray Matter binary mask (uint8)
        wm_mask: White Matter binary mask (uint8)
        csf_mask: CSF binary mask (uint8)
        brain_mask: Brain foreground mask (uint8)
        tumor_mask: (optional) Detected tumor mask to exclude from tissue analysis

    Returns:
        VolumetricAnalysisResult with pixel counts and percentages
    """
    # Optionally exclude tumor region from normal tissue masks
    if tumor_mask is not None and int(np.count_nonzero(tumor_mask)) > 0:
        tumor_region = tumor_mask > 0
        gm_mask = gm_mask.copy()
        wm_mask = wm_mask.copy()
        csf_mask = csf_mask.copy()
        gm_mask[tumor_region] = 0
        wm_mask[tumor_region] = 0
        csf_mask[tumor_region] = 0
    
    gm_pixels = int(np.count_nonzero(gm_mask))
    wm_pixels = int(np.count_nonzero(wm_mask))
    csf_pixels = int(np.count_nonzero(csf_mask))
    total_brain_pixels = int(np.count_nonzero(brain_mask))

    if total_brain_pixels > 0:
        gm_percent = (gm_pixels / total_brain_pixels) * 100.0
        wm_percent = (wm_pixels / total_brain_pixels) * 100.0
        csf_percent = (csf_pixels / total_brain_pixels) * 100.0
    else:
        gm_percent = wm_percent = csf_percent = 0.0

    return VolumetricAnalysisResult(
        gm_pixels=gm_pixels,
        wm_pixels=wm_pixels,
        csf_pixels=csf_pixels,
        total_brain_pixels=total_brain_pixels,
        gm_percent=gm_percent,
        wm_percent=wm_percent,
        csf_percent=csf_percent,
        gm_mask=gm_mask,
        wm_mask=wm_mask,
        csf_mask=csf_mask,
    )



def preprocess_image(image_path: str | Path, denoise_method: str = "gaussian") -> Dict[str, np.ndarray]:
    """
    Load and preprocess an MRI image using the existing preprocessing pipeline.

    Returns:
        Dict with:
        - original_bgr: original image in BGR (uint8) if available, else grayscale
        - preprocessed_float: preprocessed grayscale image in 0..1 float32
        - preprocessed_u8: preprocessed grayscale image in 0..255 uint8
    """
    image_path = Path(image_path)
    file_bytes = image_path.read_bytes()

    preprocessor = PreprocessingPipeline()
    result = preprocessor.process(file_contents=file_bytes, filename=image_path.name, denoise_method=denoise_method)

    # Preprocessor returns a base64 PNG for frontend display, but for this phase
    # we want the numeric image array. We therefore re-run minimal load + steps
    # using the same pipeline internals by reading the already-saved PNG path.
    processed_path = Path(result["processed_image_path"])
    processed_u8 = cv2.imread(str(processed_path), cv2.IMREAD_GRAYSCALE)
    if processed_u8 is None:
        raise RuntimeError(f"Failed to read processed image at: {processed_path}")

    preprocessed_float = processed_u8.astype(np.float32) / 255.0

    original_bgr = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if original_bgr is None:
        # Fallback: image could be DICOM/NIfTI; show the preprocessed version as "original"
        original_bgr = cv2.cvtColor(processed_u8, cv2.COLOR_GRAY2BGR)

    return {
        "original_bgr": original_bgr,
        "preprocessed_float": preprocessed_float,
        "preprocessed_u8": processed_u8,
    }


def apply_kmeans(
    gray_u8: np.ndarray,
    k: int = 4,
    random_state: int = 42,
    mask_u8: Optional[np.ndarray] = None,
) -> Dict[str, np.ndarray]:
    """
    Apply K-Means clustering on a grayscale image.

    Steps:
    - Flatten pixels into (N, 1) feature matrix.
    - Fit KMeans.
    - Reconstruct label map and a "clustered intensity" image.

    Returns:
        Dict with:
        - labels: (H, W) int32 cluster ids
        - clustered_u8: (H, W) uint8 where each pixel is set to its cluster center intensity
        - centers: (K,) float32 cluster centers
    """
    if gray_u8.ndim != 2:
        raise ValueError("apply_kmeans expects a 2D grayscale image")
    if k < 2:
        raise ValueError("k must be >= 2")

    h, w = gray_u8.shape
    if mask_u8 is None:
        mask_u8 = np.ones((h, w), dtype=np.uint8) * 255
    else:
        if mask_u8.shape != (h, w):
            raise ValueError("mask_u8 must match gray image shape")

    mask_flat = (mask_u8.reshape(-1) > 0)
    pixels = gray_u8.reshape((-1, 1)).astype(np.float32)[mask_flat]
    if pixels.size == 0:
        raise ValueError("Mask contains no foreground pixels for clustering")

    km = KMeans(n_clusters=k, n_init="auto", random_state=random_state)
    labels_fg = km.fit_predict(pixels)
    centers = km.cluster_centers_.reshape(-1).astype(np.float32)

    labels = np.full((h * w,), -1, dtype=np.int32)
    labels[mask_flat] = labels_fg.astype(np.int32)
    labels = labels.reshape((h, w))

    # Map each label to its center intensity (0..255 approx)
    clustered_u8 = np.zeros((h, w), dtype=np.uint8)
    clustered_vals = np.clip(centers[labels_fg], 0, 255).astype(np.uint8)
    clustered_u8.reshape(-1)[mask_flat] = clustered_vals

    return {
        "labels": labels,
        "clustered_u8": clustered_u8,
        "centers": centers,
    }


def apply_fcm_clustering(
    gray_u8: np.ndarray,
    k: int = 4,
    random_state: int = 42,
    mask_u8: Optional[np.ndarray] = None,
) -> Dict[str, np.ndarray]:
    """
    Apply Fuzzy C-Means on a grayscale image when scikit-fuzzy is available.
    Falls back to K-Means if the dependency is missing.
    """
    if gray_u8.ndim != 2:
        raise ValueError("apply_fcm_clustering expects a 2D grayscale image")
    if k < 2:
        raise ValueError("k must be >= 2")

    h, w = gray_u8.shape
    if mask_u8 is None:
        mask_u8 = np.ones((h, w), dtype=np.uint8) * 255
    else:
        if mask_u8.shape != (h, w):
            raise ValueError("mask_u8 must match gray image shape")

    mask_flat = mask_u8.reshape(-1) > 0
    pixels = gray_u8.reshape(-1).astype(np.float32)[mask_flat]
    if pixels.size == 0:
        raise ValueError("Mask contains no foreground pixels for clustering")

    if FUZZY_CMEANS_AVAILABLE:
        data = pixels[np.newaxis, :]
        centers, membership, _, _, _, _, _ = fuzz.cluster.cmeans(
            data,
            c=k,
            m=2.0,
            error=0.005,
            maxiter=250,
            init=None,
            seed=random_state,
        )
        labels_fg = np.argmax(membership, axis=0).astype(np.int32)
        confidence_fg = np.max(membership, axis=0).astype(np.float32)
        centers = centers.reshape(-1).astype(np.float32)
    else:
        km = KMeans(n_clusters=k, n_init="auto", random_state=random_state)
        labels_fg = km.fit_predict(pixels.reshape(-1, 1)).astype(np.int32)
        centers = km.cluster_centers_.reshape(-1).astype(np.float32)
        confidence_fg = np.ones(labels_fg.shape[0], dtype=np.float32)

    labels = np.full((h * w,), -1, dtype=np.int32)
    labels[mask_flat] = labels_fg
    labels = labels.reshape((h, w))

    clustered_u8 = np.zeros((h, w), dtype=np.uint8)
    clustered_vals = np.clip(centers[labels_fg], 0, 255).astype(np.uint8)
    clustered_u8.reshape(-1)[mask_flat] = clustered_vals

    membership_map = np.zeros((h, w), dtype=np.float32)
    membership_map.reshape(-1)[mask_flat] = confidence_fg

    return {
        "labels": labels,
        "clustered_u8": clustered_u8,
        "centers": centers,
        "membership_map": membership_map,
    }


def _brain_mask_from_gray(gray_u8: np.ndarray) -> np.ndarray:
    """
    Estimate a brain (foreground) mask using Otsu thresholding.
    This helps compute "affected percentage" and reduces background influence.
    """
    # Otsu threshold to separate foreground from background.
    _, m = cv2.threshold(gray_u8, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = np.ones((5, 5), np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, kernel, iterations=2)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, kernel, iterations=1)

    # Remove the outer rim before connected-component analysis so skull/border arcs are rejected early.
    inner = cv2.erode(m, np.ones((9, 9), np.uint8), iterations=1)
    num, lbl, stats, _ = cv2.connectedComponentsWithStats(inner, connectivity=8)
    if num <= 1:
        num, lbl, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
        if num <= 1:
            return m

    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    brain = (lbl == largest).astype(np.uint8) * 255
    brain = cv2.morphologyEx(brain, cv2.MORPH_CLOSE, kernel, iterations=2)
    brain = cv2.dilate(brain, np.ones((5, 5), np.uint8), iterations=1)
    brain = cv2.bitwise_and(brain, m)
    return brain


def _edge_strength(gray_u8: np.ndarray) -> np.ndarray:
    """
    Compute a simple edge-strength map (0..255) using Sobel magnitude.
    Edges help avoid selecting large bright non-tumor regions.
    """
    gx = cv2.Sobel(gray_u8, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray_u8, cv2.CV_32F, 0, 1, ksize=3)
    mag = cv2.magnitude(gx, gy)
    mag = np.clip(mag, 0, 255)
    return mag.astype(np.uint8)


def _contour_eccentricity(contour: np.ndarray) -> float:
    if len(contour) < 5:
        return 0.0

    try:
        (_center_x, _center_y), (axis_major, axis_minor), _angle = cv2.fitEllipse(contour)
    except cv2.error:
        return 0.0

    major = max(float(axis_major), float(axis_minor))
    minor = min(float(axis_major), float(axis_minor))
    if major <= 1.0:
        return 0.0

    ratio = float(np.clip(minor / major, 0.0, 1.0))
    return float(np.sqrt(max(0.0, 1.0 - ratio * ratio)))


def _contour_solidity(contour: np.ndarray) -> float:
    area = float(cv2.contourArea(contour))
    if area <= 0.0:
        return 0.0

    hull = cv2.convexHull(contour)
    hull_area = float(cv2.contourArea(hull))
    if hull_area <= 0.0:
        return 0.0

    return area / hull_area


def _component_bbox(mask: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
    """
    Return the bounding box of a binary mask as (x, y, w, h).
    """
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    x, y, w, h = cv2.boundingRect(max(contours, key=cv2.contourArea))
    return x, y, w, h


def _score_component(
    component_mask: np.ndarray,
    gray_u8: np.ndarray,
    brain_mask: np.ndarray,
    brain_median: float,
    brain_std: float,
    edges: np.ndarray,
    membership_map: Optional[np.ndarray],
    brain_center: Tuple[float, float],
) -> float:
    """
    Score a candidate ROI component.

    Higher score means a more plausible suspicious region.
    The score prefers compact, non-border, intensity-deviating regions
    inside the brain foreground.
    """
    area_px = int(np.count_nonzero(component_mask))
    if area_px == 0:
        return -1e9

    brain_area_px = int(np.count_nonzero(brain_mask))
    if brain_area_px == 0:
        return -1e9

    bbox = _component_bbox(component_mask)
    if bbox is None:
        return -1e9

    x, y, w, h = bbox
    bbox_area = max(1, w * h)
    compactness = float(area_px) / float(bbox_area)
    area_frac = float(area_px) / float(brain_area_px)
    fill_ratio = compactness

    component_pixels = gray_u8[component_mask > 0]
    mean_intensity = float(component_pixels.mean())
    intensity_deviation = abs(mean_intensity - brain_median) / max(brain_std, 1.0)

    edge_mean = float(edges[component_mask > 0].mean()) / 255.0
    membership_mean = float(membership_map[component_mask > 0].mean()) if membership_map is not None else 0.5

    moments = cv2.moments(component_mask)
    if moments["m00"] > 0:
        cx = moments["m10"] / moments["m00"]
        cy = moments["m01"] / moments["m00"]
        dist = np.hypot(cx - brain_center[0], cy - brain_center[1])
        center_norm = dist / max(gray_u8.shape[0], gray_u8.shape[1])
    else:
        center_norm = 1.0

    contours, _ = cv2.findContours(component_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour = max(contours, key=cv2.contourArea) if contours else None
    circularity = 0.0
    solidity = 0.0
    eccentricity = 1.0
    if contour is not None:
        perimeter = float(cv2.arcLength(contour, True))
        circularity = (4.0 * np.pi * area_px) / max(perimeter * perimeter, 1.0)
        solidity = _contour_solidity(contour)
        eccentricity = _contour_eccentricity(contour)

    touches_border = x <= 2 or y <= 2 or (x + w) >= gray_u8.shape[1] - 2 or (y + h) >= gray_u8.shape[0] - 2
    if touches_border:
        return -1e9

    if eccentricity > 0.93:
        return -1e9

    if solidity < 0.45:
        return -1e9

    if fill_ratio < 0.20:
        return -1e9

    score = 2.0 * intensity_deviation
    score += 1.0 * edge_mean
    score += 0.8 * compactness
    score += 0.9 * membership_mean
    score += 0.8 * circularity
    score += 0.7 * solidity
    score -= 1.3 * eccentricity
    score -= 1.2 * max(0.0, area_frac - 0.18)
    score -= 0.5 * center_norm
    return score


def extract_roi(
    gray_u8: np.ndarray,
    labels: np.ndarray,
    centers: np.ndarray,
    membership_map: Optional[np.ndarray] = None,
    min_region_area_px: int = 80,
    morph_kernel: int = 5,
    original_image: Optional[np.ndarray] = None,
    min_anomaly_area_px: int = 50,
) -> RoiResult:
    """
    Extract ROI from KMeans output with optional high-quality extraction from original image.

    Steps:
    - Build brain mask (foreground).
    - Score candidate connected components inside each cluster.
    - Convert to binary mask.
    - Clean mask using morphology.
    - Remove small connected components.
    - Find largest contour -> bounding box -> ROI crop.
    - If original_image provided: scale bbox to original dimensions and crop from original
    - Compute tumor area and affected percentage.

    Args:
        gray_u8: preprocessed (low-res) grayscale image
        labels: cluster labels from FCM/K-Means
        centers: cluster centers
        membership_map: optional FCM membership confidence map
        min_region_area_px: minimum component area in preprocessed space
        morph_kernel: morphological kernel size
        original_image: (optional) original high-res grayscale image for high-quality ROI extraction
        min_anomaly_area_px: minimum detected anomaly area in preprocessed space (false-positive filter)

    Returns:
        RoiResult with:
        - bbox_xywh: bounding box in original image space (or None if no anomaly detected)
        - roi: extracted ROI from original image (or None)
        - tumor_mask: binary mask in preprocessed space
        - tumor_area_px: area in preprocessed space
        - affected_percent: percentage of brain in preprocessed space
    """
    brain_mask = _brain_mask_from_gray(gray_u8)

    edges = _edge_strength(gray_u8)
    brain_pixels = gray_u8[brain_mask > 0]
    if brain_pixels.size == 0:
        brain_pixels = gray_u8.reshape(-1)
    brain_median = float(np.median(brain_pixels))
    brain_std = float(np.std(brain_pixels))

    brain_moments = cv2.moments(brain_mask)
    if brain_moments["m00"] > 0:
        brain_center = (
            brain_moments["m10"] / brain_moments["m00"],
            brain_moments["m01"] / brain_moments["m00"],
        )
    else:
        brain_center = (gray_u8.shape[1] / 2.0, gray_u8.shape[0] / 2.0)

    # Clean each cluster and score connected components independently.
    morph = np.ones((max(3, int(morph_kernel) | 1), max(3, int(morph_kernel) | 1)), np.uint8)
    best_mask = np.zeros_like(gray_u8, dtype=np.uint8)
    best_score = -1e9

    cluster_count = int(centers.shape[0])
    brain_area_px = int(np.count_nonzero(brain_mask))
    if membership_map is None:
        membership_map = np.ones_like(gray_u8, dtype=np.float32)

    for cluster_id in range(cluster_count):
        cluster_mask = np.where(labels == cluster_id, 255, 0).astype(np.uint8)
        cluster_mask = cv2.bitwise_and(cluster_mask, cluster_mask, mask=brain_mask)
        cluster_mask = cv2.morphologyEx(cluster_mask, cv2.MORPH_CLOSE, morph, iterations=2)
        cluster_mask = cv2.morphologyEx(cluster_mask, cv2.MORPH_OPEN, morph, iterations=1)

        num_labels, cc_labels, stats, _ = cv2.connectedComponentsWithStats(cluster_mask, connectivity=8)
        for comp_id in range(1, num_labels):
            area_px = int(stats[comp_id, cv2.CC_STAT_AREA])
            if area_px < min_region_area_px:
                continue

            area_frac = float(area_px) / float(max(brain_area_px, 1))
            if area_frac > 0.35:
                continue

            component_mask = np.zeros_like(cluster_mask)
            component_mask[cc_labels == comp_id] = 255
            score = _score_component(
                component_mask=component_mask,
                gray_u8=gray_u8,
                brain_mask=brain_mask,
                brain_median=brain_median,
                brain_std=brain_std,
                edges=edges,
                membership_map=membership_map,
                brain_center=brain_center,
            )

            if score > best_score:
                best_score = score
                best_mask = component_mask

    tumor_mask = best_mask

    tumor_area_px = int(np.count_nonzero(tumor_mask))
    brain_area_px = int(np.count_nonzero(brain_mask))
    affected_percent = float((tumor_area_px / brain_area_px) * 100.0) if brain_area_px > 0 else 0.0

    # False-positive detection: if tumor area too small, return no detection
    if tumor_area_px < min_anomaly_area_px:
        return RoiResult(
            bbox_xywh=None,
            roi=None,
            tumor_mask=tumor_mask,
            tumor_area_px=0,
            affected_percent=0.0,
        )

    # Contours for ROI
    contours, _hier = cv2.findContours(tumor_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return RoiResult(
            bbox_xywh=None,
            roi=None,
            tumor_mask=tumor_mask,
            tumor_area_px=tumor_area_px,
            affected_percent=affected_percent,
        )

    # Choose the contour that is compact, plausible in intensity, and not touching the border.
    def contour_score(contour: np.ndarray) -> float:
        area = float(cv2.contourArea(contour))
        if area < min_region_area_px:
            return -1e9

        x_c, y_c, w_c, h_c = cv2.boundingRect(contour)
        bbox_area = max(1.0, float(w_c * h_c))
        compactness = area / bbox_area
        perimeter = float(cv2.arcLength(contour, True))
        circularity = (4.0 * np.pi * area) / max(perimeter * perimeter, 1.0)
        solidity = _contour_solidity(contour)
        eccentricity = _contour_eccentricity(contour)

        region = np.zeros_like(tumor_mask)
        cv2.drawContours(region, [contour], -1, 255, thickness=-1)
        region_pixels = gray_u8[region > 0]
        if region_pixels.size == 0:
            return -1e9

        intensity_mean = float(region_pixels.mean())
        intensity_score = abs(intensity_mean - brain_median) / max(brain_std, 1.0)

        touches_border = x_c <= 2 or y_c <= 2 or (x_c + w_c) >= gray_u8.shape[1] - 2 or (y_c + h_c) >= gray_u8.shape[0] - 2
        if touches_border:
            return -1e9

        if eccentricity > 0.93:
            return -1e9

        if solidity < 0.45:
            return -1e9

        if compactness < 0.20:
            return -1e9

        if intensity_score < 0.35:
            return -1e9

        return 1.5 * compactness + 1.0 * circularity + 0.9 * solidity + 0.8 * intensity_score - 1.2 * eccentricity

    cnt = max(contours, key=contour_score)
    x_prep, y_prep, w_prep, h_prep = cv2.boundingRect(cnt)

    padding = max(4, int(round(min(gray_u8.shape[0], gray_u8.shape[1]) * 0.04)))
    x0_prep = max(0, x_prep - padding)
    y0_prep = max(0, y_prep - padding)
    x1_prep = min(gray_u8.shape[1], x_prep + w_prep + padding)
    y1_prep = min(gray_u8.shape[0], y_prep + h_prep + padding)

    # High-quality ROI extraction from original image (if provided)
    if original_image is not None and original_image.shape != gray_u8.shape:
        # Scale bbox coordinates from preprocessed space to original space
        scale_x = original_image.shape[1] / gray_u8.shape[1]
        scale_y = original_image.shape[0] / gray_u8.shape[0]
        
        x0_orig = int(x0_prep * scale_x)
        y0_orig = int(y0_prep * scale_y)
        x1_orig = int(x1_prep * scale_x)
        y1_orig = int(y1_prep * scale_y)
        
        # Ensure within bounds
        x0_orig = max(0, x0_orig)
        y0_orig = max(0, y0_orig)
        x1_orig = min(original_image.shape[1], x1_orig)
        y1_orig = min(original_image.shape[0], y1_orig)
        
        roi = original_image[y0_orig:y1_orig, x0_orig:x1_orig].copy()
        bbox_xywh = (x0_orig, y0_orig, x1_orig - x0_orig, y1_orig - y0_orig)
    else:
        # Use preprocessed image (lower quality)
        roi = gray_u8[y0_prep:y1_prep, x0_prep:x1_prep].copy()
        bbox_xywh = (x0_prep, y0_prep, x1_prep - x0_prep, y1_prep - y0_prep)

    return RoiResult(
        bbox_xywh=bbox_xywh,
        roi=roi,
        tumor_mask=tumor_mask,
        tumor_area_px=tumor_area_px,
        affected_percent=affected_percent,
    )


def cluster_and_extract_outputs(
    preprocessed_gray_u8: np.ndarray,
    k: int = 4,
    min_region_area_px: int = 80,
    morph_kernel: int = 5,
    original_image_base64: Optional[str] = None,
    min_anomaly_area_px: int = 50,
) -> Dict:
    """
    Run FCM clustering + tissue segmentation + volumetric analysis + high-quality ROI extraction.

    Steps:
    1. Apply FCM clustering on preprocessed image
    2. Classify clusters into Gray Matter, White Matter, CSF
    3. Calculate volumetric statistics (GM%, WM%, CSF%)
    4. Extract high-quality ROI from original image (if provided)
    5. Detect false positives (no tumor if anomaly too small)

    Args:
        preprocessed_gray_u8: preprocessed (low-res, 256x256) grayscale image
        k: number of clusters (3 or 4 recommended)
        min_region_area_px: minimum component area in preprocessed space
        morph_kernel: morphological kernel size
        original_image_base64: (optional) base64 encoded PNG of original high-res image
        min_anomaly_area_px: minimum detected anomaly area threshold (false-positive filter)

    Returns:
        Dict with:
        - k, cluster_method
        - clustered_image_base64, tumor_mask_base64, final_overlay_base64, roi_base64
        - bbox_xywh, tumor_area_px, affected_percent
        - gm_mask_base64, wm_mask_base64, csf_mask_base64
        - gm_percent, wm_percent, csf_percent
        - tumor_detected (boolean: True if anomaly >= min_anomaly_area_px)
    """
    # Decode original image if provided
    original_image_u8 = None
    if original_image_base64:
        try:
            original_image_u8 = decode_data_url_image(original_image_base64)
        except Exception:
            original_image_u8 = None

    # FCM clustering
    brain_mask = _brain_mask_from_gray(preprocessed_gray_u8)
    km = apply_fcm_clustering(preprocessed_gray_u8, k=k, mask_u8=brain_mask)

    # Tissue classification and volumetric analysis
    tissue_masks = classify_tissue_types(
        gray_u8=preprocessed_gray_u8,
        labels=km["labels"],
        centers=km["centers"],
        brain_mask=brain_mask,
    )
    
    # Note: extract_roi is called below; tumor_mask will be available after that
    # First do ROI extraction to get tumor mask
    roi_res = extract_roi(
        gray_u8=preprocessed_gray_u8,
        labels=km["labels"],
        centers=km["centers"],
        membership_map=km.get("membership_map"),
        min_region_area_px=min_region_area_px,
        morph_kernel=morph_kernel,
        original_image=original_image_u8,
        min_anomaly_area_px=min_anomaly_area_px,
    )
    
    # Now calculate volumetric stats, excluding tumor region
    volumetric_result = calculate_volumetric_stats(
        gm_mask=tissue_masks["gm_mask"],
        wm_mask=tissue_masks["wm_mask"],
        csf_mask=tissue_masks["csf_mask"],
        brain_mask=brain_mask,
        tumor_mask=roi_res.tumor_mask,  # Exclude tumor from normal tissues
    )

    # Create overlay with bbox
    overlay_bgr = cv2.cvtColor(preprocessed_gray_u8, cv2.COLOR_GRAY2BGR)
    if roi_res.bbox_xywh is not None:
        x, y, w, h = roi_res.bbox_xywh
        cv2.rectangle(overlay_bgr, (x, y), (x + w, y + h), (0, 0, 255), 2)  # red box (BGR)

    roi_b64 = _to_data_url_png(roi_res.roi) if roi_res.roi is not None else None

    # Tumor detected if ROI extraction was successful
    tumor_detected = roi_res.bbox_xywh is not None

    return {
        "k": k,
        "cluster_method": "fcm" if FUZZY_CMEANS_AVAILABLE else "kmeans",
        "clustered_image_base64": _to_data_url_png(km["clustered_u8"]),
        "tumor_mask_base64": _to_data_url_png(roi_res.tumor_mask),
        "final_overlay_base64": _to_data_url_png(overlay_bgr),
        "roi_base64": roi_b64,
        "bbox_xywh": list(roi_res.bbox_xywh) if roi_res.bbox_xywh is not None else None,
        "tumor_area_px": roi_res.tumor_area_px,
        "affected_percent": roi_res.affected_percent,
        "tumor_detected": tumor_detected,
        # Volumetric analysis results
        "gm_mask_base64": _to_data_url_png(volumetric_result.gm_mask),
        "wm_mask_base64": _to_data_url_png(volumetric_result.wm_mask),
        "csf_mask_base64": _to_data_url_png(volumetric_result.csf_mask),
        "gm_pixels": volumetric_result.gm_pixels,
        "wm_pixels": volumetric_result.wm_pixels,
        "csf_pixels": volumetric_result.csf_pixels,
        "total_brain_pixels": volumetric_result.total_brain_pixels,
        "gm_percent": round(volumetric_result.gm_percent, 2),
        "wm_percent": round(volumetric_result.wm_percent, 2),
        "csf_percent": round(volumetric_result.csf_percent, 2),
    }


def display_results(*_args, **_kwargs) -> None:
    """
    Legacy placeholder.

    The frontend integration uses base64 images, so plotting is no longer required here.
    """
    raise RuntimeError("display_results is not used in the backend API flow. Use cluster_and_extract_outputs().")


def visualize_results(
    original_u8: np.ndarray,
    preprocessed_u8: np.ndarray,
    clustered_u8: np.ndarray,
    segmentation_mask: np.ndarray,
    final_overlay_u8: np.ndarray,
    roi_u8: Optional[np.ndarray] = None,
) -> plt.Figure:
    """
    Build a compact report-style visualization for manual inspection.
    """
    fig, axes = plt.subplots(2, 3, figsize=(14, 8))
    axes = axes.ravel()

    axes[0].imshow(original_u8, cmap="gray")
    axes[0].set_title("Original MRI")
    axes[1].imshow(preprocessed_u8, cmap="gray")
    axes[1].set_title("Preprocessed MRI")
    axes[2].imshow(clustered_u8, cmap="gray")
    axes[2].set_title("Clustered Image")
    axes[3].imshow(segmentation_mask, cmap="gray")
    axes[3].set_title("Cleaned Segmentation Mask")
    axes[4].imshow(cv2.cvtColor(final_overlay_u8, cv2.COLOR_BGR2RGB))
    axes[4].set_title("Final ROI Detection")

    if roi_u8 is not None:
        axes[5].imshow(roi_u8, cmap="gray")
        axes[5].set_title("Extracted ROI")
    else:
        axes[5].axis("off")

    for axis in axes:
        axis.axis("off")

    fig.tight_layout()
    return fig


def run_pipeline(
    image_path: str | Path,
    k: int = 4,
    denoise_method: str = "gaussian",
) -> None:
    """
    Convenience wrapper for end-to-end execution on a single image.
    """
    data = preprocess_image(image_path=image_path, denoise_method=denoise_method)
    original_bgr = data["original_bgr"]
    preprocessed_u8 = data["preprocessed_u8"]

    outputs = cluster_and_extract_outputs(preprocessed_gray_u8=preprocessed_u8, k=k)
    print("Tumor area (px):", outputs["tumor_area_px"])
    print("Affected percentage (% of brain foreground):", round(outputs["affected_percent"], 2))
    print("BBox:", outputs["bbox_xywh"])


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="K-Means clustering based ROI extraction on preprocessed MRI slices.")
    parser.add_argument("--image", required=True, help="Path to an MRI slice image (jpg/png/dcm/nii/nii.gz).")
    parser.add_argument("--k", type=int, default=4, help="Number of clusters for K-Means (3 or 4 recommended).")
    parser.add_argument("--denoise", default="gaussian", choices=["gaussian", "median"], help="Denoise method for preprocessing.")
    args = parser.parse_args()

    run_pipeline(image_path=args.image, k=args.k, denoise_method=args.denoise)

