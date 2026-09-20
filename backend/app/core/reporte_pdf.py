from io import BytesIO
from decimal import Decimal
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

NOMBRE_PROYECTO = "Turismo Colombia"
COLOR_PRINCIPAL = colors.HexColor("#087f8c")


def _pesos(valor) -> str:
    # Formato colombiano: $1.250.000
    return "$" + f"{Decimal(valor):,.0f}".replace(",", ".")


def _fecha(fecha) -> str:
    return fecha.strftime("%d/%m/%Y")


def _pie_pagina(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.grey)
    canvas.drawString(1.5 * cm, 1 * cm, f"{NOMBRE_PROYECTO} · Reporte diario de ventas")
    canvas.drawRightString(A4[0] - 1.5 * cm, 1 * cm, f"Página {doc.page}")
    canvas.restoreState()


def generar_pdf_reporte(reporte: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.8 * cm,
        title=f"Reporte diario de ventas {_fecha(reporte['fecha'])}",
        author=NOMBRE_PROYECTO,
    )

    estilos = getSampleStyleSheet()
    titulo = ParagraphStyle(
        "Titulo", parent=estilos["Title"], textColor=COLOR_PRINCIPAL, fontSize=22, spaceAfter=2
    )
    subtitulo = ParagraphStyle(
        "Subtitulo", parent=estilos["Normal"], alignment=TA_CENTER, fontSize=11, spaceAfter=2
    )
    nota = ParagraphStyle(
        "Nota", parent=estilos["Normal"], fontSize=7.5, textColor=colors.grey, spaceBefore=4
    )
    celda = ParagraphStyle("Celda", parent=estilos["Normal"], fontSize=8, leading=10)

    # ---------- Resumen con totales ----------
    resumen = Table(
        [
            ["Total vendido", "Ventas del día", "Completadas", "Pendientes", "Anuladas"],
            [
                _pesos(reporte["total_vendido"]),
                str(reporte["cantidad_ventas"]),
                str(reporte["cantidad_completadas"]),
                str(reporte["cantidad_pendientes"]),
                str(reporte["cantidad_anuladas"]),
            ],
        ],
        colWidths=[4.4 * cm, 3.4 * cm, 3.4 * cm, 3.4 * cm, 3.4 * cm],
    )
    resumen.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef6f7")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#555555")),
                ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 1), (-1, 1), 13),
                ("TEXTCOLOR", (0, 1), (0, 1), COLOR_PRINCIPAL),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ]
        )
    )

    # ---------- Tabla de ventas ----------
    filas = [["N° venta", "Hora", "Cliente", "Servicios (cantidad y valor)", "Total", "Estado"]]
    for v in reporte["ventas"]:
        servicios = "<br/>".join(
            f"{escape(i['servicio'])} · x{i['cantidad']} · {_pesos(i['subtotal'])}"
            for i in v["items"]
        )
        filas.append(
            [
                v["numero_venta"],
                v["fecha_venta"].strftime("%H:%M"),
                Paragraph(escape(v["cliente"]), celda),
                Paragraph(servicios, celda),
                _pesos(v["total"]),
                v["estado"],
            ]
        )

    tabla = Table(
        filas,
        colWidths=[2.4 * cm, 1.5 * cm, 3.6 * cm, 6.3 * cm, 2.2 * cm, 2.0 * cm],
        repeatRows=1,
    )
    tabla.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_PRINCIPAL),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (4, 1), (4, -1), "RIGHT"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cccccc")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    # ---------- Armado del documento ----------
    contenido = [
        Paragraph(NOMBRE_PROYECTO, titulo),
        Paragraph("<b>Reporte diario de ventas</b>", subtitulo),
        Paragraph(f"Fecha del reporte: {_fecha(reporte['fecha'])}", subtitulo),
        Spacer(1, 0.6 * cm),
        resumen,
        Paragraph("El total vendido suma únicamente las ventas en estado Completada.", nota),
        Spacer(1, 0.5 * cm),
    ]

    if reporte["ventas"]:
        contenido.append(tabla)
    else:
        contenido.append(
            Paragraph("No se registraron ventas en esta fecha.", estilos["Normal"])
        )

    contenido += [
        Spacer(1, 0.6 * cm),
        Paragraph(
            f"Reporte generado por {escape(reporte['generado_por'])} "
            f"el {reporte['generado_en']:%d/%m/%Y} a las {reporte['generado_en']:%H:%M}.",
            nota,
        ),
    ]

    doc.build(contenido, onFirstPage=_pie_pagina, onLaterPages=_pie_pagina)
    return buffer.getvalue()