import os
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_pdf_report(record: dict) -> bytes:
    """
    Generates a clinical screening report PDF styled with Ethiopian palette:
    Primary Coffee Brown (#4A2E20), Ethiopian Green (#078930), Gold (#F4C430), Red-Ochre (#B33A3A)
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    coffee_brown = colors.HexColor("#4A2E20")
    ethiopian_green = colors.HexColor("#078930")
    gold_amber = colors.HexColor("#F4C430")
    red_ochre = colors.HexColor("#B33A3A")
    parchment = colors.HexColor("#F1E9D8")
    charcoal = colors.HexColor("#2E2019")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=coffee_brown,
        alignment=1, # Center
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=ethiopian_green,
        alignment=1,
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=coffee_brown,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=charcoal
    )

    bold_body_style = ParagraphStyle(
        'DocBodyBold',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=charcoal,
        fontName="Helvetica-Bold"
    )

    disclaimer_style = ParagraphStyle(
        'DocDisclaimer',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6B5B52")
    )

    elements = []

    # Header
    elements.append(Paragraph("ETHIOPIAN CLINICAL ANEMIA SCREENING REGISTRY", title_style))
    elements.append(Paragraph("Point-of-Care Altitude-Compensated Hemoglobin Assessment", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=3, color=ethiopian_green, spaceAfter=15))

    # Patient & Encounter Metadata Table
    meta_data = [
        [
            Paragraph("<b>Patient Name:</b>", body_style),
            Paragraph(str(record.get("patient_name", "N/A")), bold_body_style),
            Paragraph("<b>Screening Date:</b>", body_style),
            Paragraph(str(record.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M"))), body_style)
        ],
        [
            Paragraph("<b>Age / Sex:</b>", body_style),
            Paragraph(f"{record.get('patient_age', 'N/A')} yrs / {record.get('patient_gender', 'N/A')}", body_style),
            Paragraph("<b>Health Worker:</b>", body_style),
            Paragraph(str(record.get("health_worker", "Clinician")), body_style)
        ],
        [
            Paragraph("<b>Clinic / Location:</b>", body_style),
            Paragraph(str(record.get("location_name", "Ethiopia")), body_style),
            Paragraph("<b>Recorded Elevation:</b>", body_style),
            Paragraph(f"{record.get('elevation_m', 0.0):.0f} m a.s.l.", body_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[110, 160, 110, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), parchment),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5DAC6")),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 15))

    # Diagnostic Findings
    elements.append(Paragraph("Diagnostic Screening Findings", h2_style))

    is_anemic = record.get("anemia_status", "").upper() == "ANEMIC"
    status_color = red_ochre if is_anemic else ethiopian_green

    findings_data = [
        [
            Paragraph("<b>Screening Status:</b>", body_style),
            Paragraph(f"<b><font color='{status_color.hexval()}'>{record.get('anemia_status', 'N/A')}</font></b>", ParagraphStyle('St', parent=styles['Normal'], fontSize=12, leading=14)),
            Paragraph("<b>WHO Severity Grade:</b>", body_style),
            Paragraph(f"<b>{record.get('severity', 'Normal')}</b>", bold_body_style)
        ],
        [
            Paragraph("<b>Raw Measured Hb:</b>", body_style),
            Paragraph(f"{record.get('raw_hb', 0.0):.1f} g/dL", bold_body_style),
            Paragraph("<b>Altitude-Adjusted Hb:</b>", body_style),
            Paragraph(f"<b>{record.get('adjusted_hb', 0.0):.1f} g/dL</b>", bold_body_style)
        ],
        [
            Paragraph("<b>Model Probability:</b>", body_style),
            Paragraph(f"{record.get('classification_prob', 0.0):.1%}", body_style),
            Paragraph("<b>Altitude Offset:</b>", body_style),
            Paragraph(f"{record.get('adjusted_hb', 0.0) - record.get('raw_hb', 0.0):+.2f} g/dL", body_style)
        ]
    ]

    findings_table = Table(findings_data, colWidths=[130, 140, 130, 130])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAF6EE")),
        ('BOX', (0, 0), (-1, -1), 1, coffee_brown),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5DAC6")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(findings_table)
    elements.append(Spacer(1, 15))

    # If severe, add clinical action notice
    if record.get("severity") == "Severe":
        severe_alert = [
            [Paragraph("<b>URGENT CLINICAL ALERT:</b> Patient displays severe anemia indicators. Immediate referral to higher-tier facility and venous blood laboratory test required.", ParagraphStyle('Sev', parent=body_style, textColor=red_ochre))]
        ]
        sev_table = Table(severe_alert, colWidths=[530])
        sev_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FDE8E8")),
            ('BOX', (0, 0), (-1, -1), 1.5, red_ochre),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(sev_table)
        elements.append(Spacer(1, 15))

    # Mandatory Medical Disclaimer
    elements.append(Paragraph("Required Medical Disclaimer & Clinical Usage Note", h2_style))
    disclaimer_text = (
        "<b>CLINICAL USAGE DISCLAIMER:</b> This digital health tool is an auxiliary screening aid only, not a diagnostic medical device. "
        "Estimated hemoglobin values and classification statuses MUST be confirmed by a qualified health professional and an accredited laboratory venous blood test (e.g. CBC or HemoCue analyzer). "
        "This tool must not be used as the sole basis for prescribing therapeutic interventions, transfusions, or treatment decisions."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))
    elements.append(Spacer(1, 25))

    # Signature lines
    sig_data = [
        [
            Paragraph("_______________________________<br/>Screening Clinician Signature", body_style),
            Paragraph("_______________________________<br/>Supervising Medical Officer", body_style)
        ]
    ]
    sig_table = Table(sig_data, colWidths=[265, 265])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(sig_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
