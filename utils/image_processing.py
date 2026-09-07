import numpy as np

def detect_and_crop_eye(image_rgb: np.ndarray) -> np.ndarray:
    """
    Placeholder for the established eye-region auto-crop function.
    Health workers connect their pre-trained or haar-cascade eye detector here.
    Returns the cropped conjunctiva / lower eyelid ROI.
    """
    h, w = image_rgb.shape[:2]
    # Default center-lower crop approximating the palpebral conjunctiva ROI
    y1, y2 = int(h * 0.4), int(h * 0.85)
    x1, x2 = int(w * 0.2), int(w * 0.8)
    return image_rgb[y1:y2, x1:x2]

def gray_world_correct(image_rgb: np.ndarray) -> np.ndarray:
    """
    Placeholder for the established Gray-World color-correction algorithm.
    Balances illumination variations in clinical field photography.
    """
    img_float = image_rgb.astype(np.float32)
    mean_r = np.mean(img_float[:, :, 0])
    mean_g = np.mean(img_float[:, :, 1])
    mean_b = np.mean(img_float[:, :, 2])
    gray_mean = (mean_r + mean_g + mean_b) / 3.0

    if mean_r > 0 and mean_g > 0 and mean_b > 0:
        img_float[:, :, 0] = np.clip(img_float[:, :, 0] * (gray_mean / mean_r), 0, 255)
        img_float[:, :, 1] = np.clip(img_float[:, :, 1] * (gray_mean / mean_g), 0, 255)
        img_float[:, :, 2] = np.clip(img_float[:, :, 2] * (gray_mean / mean_b), 0, 255)

    return img_float.astype(np.uint8)

def rgb_to_lab_features(image_rgb: np.ndarray) -> list:
    """
    Extracts 6 CIELAB color features as requested:
    Convert RGB -> BGR -> LAB, then return:
    [L.mean(), A.mean(), B.mean(), L.std(), A.std(), B.std()]
    """
    try:
        import cv2
        # Convert RGB to BGR then to LAB
        bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
        L = lab[:, :, 0].astype(np.float32)
        A = lab[:, :, 1].astype(np.float32)
        B = lab[:, :, 2].astype(np.float32)
        return [
            float(L.mean()), float(A.mean()), float(B.mean()),
            float(L.std()), float(A.std()), float(B.std())
        ]
    except ImportError:
        # Fallback if cv2 is not yet installed in local environment
        return [128.0, 128.0, 128.0, 20.0, 15.0, 15.0]
