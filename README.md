# Ethiopian Clinical Anemia Screening Tool
**Point-of-Care Non-Invasive Hemoglobin Assessment with Altitude Compensation**

A professional-grade, multi-page clinical screening tool designed for healthcare workers in Ethiopian primary health posts and clinics.

---

## Key Features

1. **Ethiopian Design System & Cultural Identity**
   - **Light Theme:** Warm ivory (`#FAF6EE`), soft parchment (`#F1E9D8`), deep coffee brown (`#4A2E20`), Ethiopian flag green (`#078930`), warm amber/gold (`#F4C430`), red-ochre alert (`#B33A3A`).
   - **Dark Theme:** Espresso (`#1C1410`), warm dark brown (`#2B2019`), cream (`#F1E9D8`), bright green (`#2FA84F`), muted gold (`#D9A93A`), coral-red (`#D9645C`).
   - **Woven Textile Motif:** Traditional Ethiopian tibeb geometric diamond-cross SVG repeating pattern on cards and section dividers.
   - **Typography:** Lora / Fraunces for Latin headers, Noto Serif Ethiopic for Ge'ez/Amharic headers, Noto Sans for cross-language body text.

2. **Multilingual Architecture**
   - Seamless runtime switching between **English**, **አማርኛ (Amharic)**, and **Afaan Oromoo**.
   - Persistent language selector accessible across all screens.

3. **Clinician Workflow & Patient Tracking**
   - Local SQLite database authentication for healthcare workers (`data/users.db`).
   - Clinical records registry (`data/screenings.db`).
   - Professional PDF clinical report generation formatted with patient data, diagnostic metrics, and medical signatures.

4. **Altitude Compensation & Active Mapping**
   - Interactive map centered on Ethiopia with a dedicated search bar.
   - Live OpenStreetMap Nominatim geocoding restricted to Ethiopia (`countrycodes=et`).
   - Real-time elevation retrieval via Open-Elevation API (`https://api.open-elevation.com/`).
   - Robust offline manual elevation fallback.
   - Physiological altitude adjustment formula:
     $$\Delta Hb = -0.032 \cdot e + 0.022 \cdot e^2 \quad \text{where } e = \frac{\text{elevation\_m}}{1000}$$
     $$\text{Hb}_{\text{adjusted}} = \text{Hb}_{\text{measured}} - \Delta Hb$$

5. **Model Deployment Contract**
   - Model file: `deployment/model.keras`
   - Config file: `deployment/config.json` with keys:
     - `backbone_name`: "ResNet50"
     - `img_size`: 224
     - `final_threshold`: 0.42
     - `hb_mean`: 10.8
     - `hb_std`: 2.1
     - `use_hybrid`: false
   - Unscaling formula: `hb_raw = hb_prediction_scaled * hb_std + hb_mean`
   - Confidence Gating: Ambiguous results within 10 percentage points of threshold trigger an advisory to retake photo under better lighting.

---

## Running Locally with Streamlit

### Prerequisites
- Python 3.9+
- Recommended: Virtual environment

### Setup & Run
```bash
# 1. Clone or navigate to the project directory
cd ethiopian-anemia-screening

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# 3. Install required packages
pip install -r requirements.txt

# 4. Place your trained model in deployment/
# deployment/model.keras

# 5. Launch the Streamlit application
streamlit run app.py
```

Default health worker credentials:
- Username: `hw_nurse`
- Password: `health2025`
(Or create a new account via the **Register** tab)

---

## Required Medical Disclaimer
*This tool is a screening aid only, not a diagnostic device. Results must be confirmed by a qualified health professional and an accredited laboratory venous blood test. This tool must not be used as the sole basis for any medical or treatment decision.*
