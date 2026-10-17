"""
Screen Recapture and Moiré Pattern Detection.

Uses Pillow and NumPy 2D Fast Fourier Transform (FFT) analysis to detect
whether an image was captured from a computer/phone screen rather than
taken live at the scene of a civic issue.
"""

from __future__ import annotations

import io
import logging
from typing import Any, Dict, Tuple, Union
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def detect_screen_recapture(
    image_input: Union[str, bytes, io.BytesIO, Image.Image],
) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Detect whether an uploaded photo is a screen recapture (photo of a monitor/display).

    Performs:
    1. 2D FFT spectral analysis to detect periodic Moiré grid peaks.
    2. Laplacian texture variance to detect artificial screen flatness / lack of optical depth.

    Returns:
        Tuple of (is_recapture: bool, confidence: float, details: dict)
    """
    try:
        # Load image into PIL
        if isinstance(image_input, Image.Image):
            img = image_input
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input))
        elif hasattr(image_input, "read"):
            image_input.seek(0)
            img = Image.open(image_input)
        elif isinstance(image_input, str):
            img = Image.open(image_input)
        else:
            return False, 0.0, {"error": "Invalid image type"}

        # Resize for consistent, performant spectral computation
        analysis_size = (512, 512)
        gray_img = img.convert("L").resize(analysis_size, Image.Resampling.BILINEAR)
        img_arr = np.asarray(gray_img, dtype=np.float32)

        # ---------------------------------------------------------
        # 1. 2D FFT Moiré Pattern Spectral Analysis
        # ---------------------------------------------------------
        f_transform = np.fft.fft2(img_arr)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = np.abs(f_shift)

        h, w = analysis_size
        center_y, center_x = h // 2, w // 2

        # Create mask to exclude low-frequency center (DC component)
        y, x = np.ogrid[:h, :w]
        dist_from_center = np.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)

        # Focus on mid-to-high frequency bands where Moiré interference concentrates
        moire_band_mask = (dist_from_center >= 30) & (dist_from_center <= 220)

        band_values = magnitude_spectrum[moire_band_mask]
        if len(band_values) == 0:
            return False, 0.0, {"error": "Empty frequency band"}

        mean_freq = np.mean(band_values)
        std_freq = np.std(band_values)
        max_freq = np.max(band_values)

        # Spectral peak-to-average ratio (Z-score of maximum spectral spike)
        moire_peak_ratio = float((max_freq - mean_freq) / (std_freq + 1e-6))

        # ---------------------------------------------------------
        # 2. Depth of Field & Flatness (Laplacian Edge Dispersion)
        # ---------------------------------------------------------
        # Compute discrete Laplacian using 2D difference
        laplacian = np.abs(
            img_arr[:-2, 1:-1]
            + img_arr[2:, 1:-1]
            + img_arr[1:-1, :-2]
            + img_arr[1:-1, 2:]
            - 4 * img_arr[1:-1, 1:-1]
        )
        laplacian_variance = float(np.var(laplacian))

        # ---------------------------------------------------------
        # 3. Decision Heuristic
        # ---------------------------------------------------------
        # Natural scenes have diffuse frequency spectra without sharp isolated spikes.
        # Screen recaptures exhibit sharp discrete Fourier spikes (moire_peak_ratio > 9.0)
        moire_flag = moire_peak_ratio > 9.5
        low_depth_flag = laplacian_variance < 45.0  # Unnaturally flat/blurry monitor photo

        confidence = 0.0
        if moire_flag and low_depth_flag:
            confidence = 0.85
        elif moire_flag:
            confidence = 0.65
        elif low_depth_flag and moire_peak_ratio > 7.5:
            confidence = 0.50
        else:
            confidence = max(0.0, min(0.35, moire_peak_ratio / 25.0))

        is_recapture = confidence >= 0.60

        details = {
            "moire_peak_ratio": round(moire_peak_ratio, 3),
            "laplacian_variance": round(laplacian_variance, 3),
            "moire_detected": moire_flag,
            "flat_depth_detected": low_depth_flag,
            "confidence": round(confidence, 3),
        }

        return is_recapture, confidence, details

    except Exception as exc:
        logger.error(f"Error analyzing screen recapture: {exc}")
        return False, 0.0, {"error": str(exc)}
