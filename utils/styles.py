"""
Theme styles and custom CSS injection for the Ethiopian Anemia Screening Tool.
Provides both Light and Dark themes, custom woven-textile SVG geometric border,
and font declarations for English/Oromoo (Lora/Fraunces) and Amharic (Noto Serif Ethiopic).
"""

def get_custom_css(theme: str = "light") -> str:
    is_dark = theme == "dark"

    # Color definitions
    if is_dark:
        bg = "#1C1410"
        card_bg = "#2B2019"
        text_color = "#F5EFE4"
        text_muted = "#C7BDB1"
        primary = "#F1E9D8"
        accent_green = "#2FA84F"
        accent_gold = "#D9A93A"
        alert_red = "#D9645C"
        border_color = "#3D2E24"
        pattern_fill1 = "%232FA84F"
        pattern_fill2 = "%23D9A93A"
        pattern_fill3 = "%23D9645C"
    else:
        bg = "#FAF6EE"
        card_bg = "#F1E9D8"
        text_color = "#2E2019"
        text_muted = "#6B5B52"
        primary = "#4A2E20"
        accent_green = "#078930"
        accent_gold = "#F4C430"
        alert_red = "#B33A3A"
        border_color = "#E2D7C3"
        pattern_fill1 = "%23078930"
        pattern_fill2 = "%23F4C430"
        pattern_fill3 = "%23B33A3A"

    # SVG woven textile geometric repeating pattern data URI (tibeb motif)
    # Repeating diamond crosses in green, gold, and ochre red
    svg_pattern = (
        f"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='10' viewBox='0 0 36 10'%3E"
        f"%3Cpath d='M6 0 L12 5 L6 10 L0 5 Z' fill='{pattern_fill1}' opacity='0.9'/%3E"
        f"%3Cpath d='M18 0 L24 5 L18 10 L12 5 Z' fill='{pattern_fill2}' opacity='0.95'/%3E"
        f"%3Cpath d='M30 0 L36 5 L30 10 L24 5 Z' fill='{pattern_fill3}' opacity='0.9'/%3E"
        f"%3Ccircle cx='6' cy='5' r='1.5' fill='%23FAF6EE'/%3E"
        f"%3Ccircle cx='18' cy='5' r='1.5' fill='%232E2019'/%3E"
        f"%3Ccircle cx='30' cy='5' r='1.5' fill='%23FAF6EE'/%3E"
        f"%3C/svg%3E"
    )

    css = f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Sans+Ethiopic:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Noto+Serif+Ethiopic:wght@500;600;700&display=swap');

    /* Global reset and styling */
    .stApp {{
        background-color: {bg} !important;
        color: {text_color} !important;
        font-family: 'Noto Sans', 'Noto Sans Ethiopic', -apple-system, sans-serif !important;
    }}

    /* Typography */
    h1, h2, h3, .serif-header {{
        font-family: 'Noto Serif Ethiopic', 'Lora', Georgia, serif !important;
        color: {primary} !important;
        font-weight: 700 !important;
        letter-spacing: -0.01em;
    }}

    p, span, label, div {{
        color: {text_color};
    }}

    /* Hide default Streamlit header and footer */
    #MainMenu, header, footer {{
        visibility: hidden !important;
        height: 0px !important;
    }}

    /* Card styling */
    .ethiopian-card {{
        background-color: {card_bg} !important;
        border: 1px solid {border_color};
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 16px rgba(46, 32, 25, 0.05);
        position: relative;
        overflow: hidden;
    }}

    /* Woven textile decorative top border */
    .tibeb-border-top {{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 8px;
        background-image: url("{svg_pattern}");
        background-repeat: repeat-x;
        background-size: 36px 8px;
    }}

    .tibeb-divider {{
        width: 100%;
        height: 8px;
        margin: 16px 0;
        background-image: url("{svg_pattern}");
        background-repeat: repeat-x;
        background-size: 36px 8px;
        border-radius: 4px;
    }}

    /* Severity Result Cards */
    .result-normal {{
        background-color: {'#163320' if is_dark else '#E8F5E9'} !important;
        border: 1.5px solid {accent_green};
        border-radius: 14px;
        padding: 24px;
        position: relative;
    }}

    .result-mild {{
        background-color: {'#362C12' if is_dark else '#FFF9E6'} !important;
        border: 1.5px solid {accent_gold};
        border-radius: 14px;
        padding: 24px;
        position: relative;
    }}

    .result-moderate {{
        background-color: {'#3D2510' if is_dark else '#FFF3E0'} !important;
        border: 1.5px solid #E67E22;
        border-radius: 14px;
        padding: 24px;
        position: relative;
    }}

    .result-severe {{
        background-color: {'#3D1B1B' if is_dark else '#FDEDED'} !important;
        border: 2px solid {alert_red};
        border-radius: 14px;
        padding: 24px;
        position: relative;
    }}

    /* Input overrides */
    .stTextInput>div>div>input, .stNumberInput>div>div>input, .stSelectbox>div>div {{
        background-color: {card_bg} !important;
        color: {text_color} !important;
        border: 1px solid {border_color} !important;
        border-radius: 8px !important;
    }}

    /* Buttons */
    .stButton>button {{
        background-color: {primary} !important;
        color: {'#1C1410' if is_dark else '#FAF6EE'} !important;
        border-radius: 10px !important;
        border: none !important;
        padding: 10px 24px !important;
        font-weight: 600 !important;
        font-family: 'Noto Sans', sans-serif !important;
        transition: all 0.2s ease !important;
    }}

    .stButton>button:hover {{
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }}

    /* Medical disclaimer box */
    .disclaimer-box {{
        background-color: {card_bg};
        border-left: 4px solid {alert_red};
        padding: 16px 20px;
        border-radius: 8px;
        margin: 16px 0;
        font-size: 0.9rem;
        color: {text_color};
    }}
    </style>
    """
    return css
