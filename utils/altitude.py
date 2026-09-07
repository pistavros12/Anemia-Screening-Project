def altitude_adjusted_hb(measured_hb: float, elevation_m: float) -> float:
    """
    Adjust measured hemoglobin for altitude using the standard WHO/CDC formula:
    e = elevation_m / 1000.0
    correction = -0.032 * e + 0.022 * (e ** 2)
    adjusted_hb = measured_hb - correction
    """
    e = float(elevation_m) / 1000.0
    correction = -0.032 * e + 0.022 * (e ** 2)
    return round(measured_hb - correction, 2)

def classify_severity(adjusted_hb: float, gender: str = "Female", age: int = 25) -> str:
    """
    WHO hemoglobin threshold bands (g/dL) for non-pregnant adults:
    Severe: < 8.0
    Moderate: 8.0 - 10.9
    Mild: 11.0 - 11.9 (female) or 11.0 - 12.9 (male)
    Normal: >= 12.0 (female) or >= 13.0 (male)
    """
    mild_cutoff = 13.0 if gender.lower() == "male" else 12.0

    if adjusted_hb < 8.0:
        return "Severe"
    elif adjusted_hb < 11.0:
        return "Moderate"
    elif adjusted_hb < mild_cutoff:
        return "Mild"
    else:
        return "Normal"

def is_confidence_gated(classification_prob: float, threshold: float = 0.42) -> bool:
    """
    If the classification probability is within 10 percentage points of the threshold,
    the result is ambiguous and should be gated.
    """
    return abs(classification_prob - threshold) <= 0.10
