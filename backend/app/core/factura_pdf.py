from io import BytesIO
from decimal import Decimal
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

NOMBRE_PROYECTO = "Turismo Colombia"
COLOR_PRINCIPAL = colors.HexColor("#087F8C")


def _pesos(valor) -> str:
    # Formato colombiano: $1.250.000
    return "$" + f"{Decimal(valor):,.0f}".replace(",", ".")


def _pie_pagina(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.grey)
    canvas.drawString(1.8 * cm, 1 * cm, f"{NOMBRE_PROYECTO} · Factura de venta")
    canvas.drawRightString(A4[0] - 1.8 * cm, 1 * cm, f"Página {doc.page}")
    canvas.restoreState()


def generar_pdf_factura(factura: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.8 * cm,
        bottomMargin=2 * cm,
        title=f"Factura {factura['numero_factura']}",
        author=NOMBRE_PROYECTO,
    )

    estilos = getSampleStyleSheet()
    normal = estilos["Normal"]
    titulo = ParagraphStyle(
        "Titulo", parent=normal, fontName="Helvetica-Bold", fontSize=22,
        textColor=COLOR_PRINCIPAL, leading=26,
    )
    derecha = ParagraphStyle("Derecha", parent=normal, alignment=TA_RIGHT, fontSize=9, leading=12)
    numero_estilo = ParagraphStyle(
        "Numero", parent=derecha, fontName="Helvetica-Bold", fontSize=17,
        leading=21, textColor=COLOR_PRINCIPAL,
    )
    seccion = ParagraphStyle(
        "Seccion", parent=normal, fontName="Helvetica-Bold", fontSize=10,
        textColor=COLOR_PRINCIPAL, spaceAfter=4,
    )
    celda = ParagraphStyle("Celda", parent=normal, fontSize=9, leading=11)
    nota = ParagraphStyle(
        "Nota", parent=normal, fontSize=7.5, textColor=colors.grey, alignment=TA_CENTER
    )

    # ---------- Encabezado: proyecto a la izquierda, datos de la factura a la derecha ----------
    datos_factura = [
        Paragraph("<b>FACTURA DE VENTA</b>", derecha),
        Paragraph(f"N° {factura['numero_factura']}", numero_estilo),
        Paragraph(f"Fecha: {factura['fecha_emision']:%d/%m/%Y %H:%M}", derecha),
    ]
    if factura.get("numero_venta"):
        datos_factura.append(Paragraph(f"Venta: {factura['numero_venta']}", derecha))
    datos_factura.append(Paragraph(f"Estado: <b>{escape(factura['estado'])}</b>", derecha))

    encabezado = Table(
        [[Paragraph(NOMBRE_PROYECTO, titulo), datos_factura]],
        colWidths=[9 * cm, 8.4 * cm],
    )
    encabezado.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, 0), 1, COLOR_PRINCIPAL),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ]
        )
    )

    # ---------- Datos del cliente ----------
    cliente = factura["cliente"]
    filas_cliente = [
        ["Nombre", Paragraph(escape(cliente["nombre_completo"]), celda)],
        ["Documento", f"{cliente['tipo_documento']} {cliente['numero_documento']}"],
        ["Correo", Paragraph(escape(cliente["correo"]), celda)],
    ]
    if cliente.get("telefono"):
        filas_cliente.append(["Teléfono", cliente["telefono"]])
    if cliente.get("direccion"):
        filas_cliente.append(["Dirección", Paragraph(escape(cliente["direccion"]), celda)])

    tabla_cliente = Table(filas_cliente, colWidths=[3 * cm, 14.4 * cm])
    tabla_cliente.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#555555")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f5f9fa")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )

    # ---------- Servicios ----------
    filas_items = [["Servicio", "Cantidad", "Precio unitario", "Subtotal"]]
    for item in factura["items"]:
        filas_items.append(
            [
                Paragraph(escape(item["servicio"]), celda),
                str(item["cantidad"]),
                _pesos(item["precio_unitario"]),
                _pesos(item["subtotal"]),
            ]
        )

    tabla_items = Table(filas_items, colWidths=[8.4 * cm, 2.2 * cm, 3.4 * cm, 3.4 * cm], repeatRows=1)
    tabla_items.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_PRINCIPAL),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, -1), "CENTER"),
                ("ALIGN", (2, 0), (3, -1), "RIGHT"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cccccc")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )

    # ---------- Totales ----------
    tabla_totales = Table(
        [
            ["Subtotal", _pesos(factura["subtotal"])],
            ["Descuento", _pesos(factura["descuento"])],
            ["Impuestos", _pesos(factura["impuesto"])],
            ["TOTAL", _pesos(factura["total"])],
        ],
        colWidths=[3.6 * cm, 3.8 * cm],
        hAlign="RIGHT",
    )
    tabla_totales.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("FONTNAME", (0, 3), (-1, 3), "Helvetica-Bold"),
                ("FONTSIZE", (0, 3), (-1, 3), 12),
                ("TEXTCOLOR", (0, 3), (-1, 3), COLOR_PRINCIPAL),
                ("LINEABOVE", (0, 3), (-1, 3), 0.75, COLOR_PRINCIPAL),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    contenido = [
        encabezado,
        Spacer(1, 0.6 * cm),
        Paragraph("Datos del cliente", seccion),
        tabla_cliente,
        Spacer(1, 0.7 * cm),
        Paragraph("Detalle de la venta", seccion),
        tabla_items,
        Spacer(1, 0.5 * cm),
        tabla_totales,
        Spacer(1, 1 * cm),
        Paragraph("Documento generado por el sistema de Turismo Colombia.", nota),
    ]

    doc.build(contenido, onFirstPage=_pie_pagina, onLaterPages=_pie_pagina)
    return buffer.getvalue()