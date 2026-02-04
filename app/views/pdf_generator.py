"""
Generador de PDF para catálogos usando ReportLab
"""

import os
from datetime import date
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.models import Producte, Familia, Categoria
from app.utils import get_photos_dir


class PDFGenerator:
    """Generador de catálogos en PDF"""

    def __init__(self, session):
        self.session = session
        self.styles = getSampleStyleSheet()
        self.setup_styles()

    def setup_styles(self):
        """Configurar estilos personalizados"""
        # Título principal
        self.styles.add(ParagraphStyle(
            name='MainTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#2c3e50')
        ))

        # Título de categoría
        self.styles.add(ParagraphStyle(
            name='CategoryTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#2c3e50'),
            backColor=colors.HexColor('#ecf0f1'),
            borderPadding=10
        ))

        # Nombre de producto
        self.styles.add(ParagraphStyle(
            name='ProductName',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#2c3e50'),
            leading=14
        ))

        # Precio
        self.styles.add(ParagraphStyle(
            name='ProductPrice',
            parent=self.styles['Normal'],
            fontSize=12,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#27ae60')
        ))

        # Descripción
        self.styles.add(ParagraphStyle(
            name='ProductDesc',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#7f8c8d'),
            leading=11
        ))

        # Footer
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#7f8c8d')
        ))

    def generate(self, output_path, familia_id=None):
        """Generar el PDF del catálogo"""
        # Crear documento
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=1.5*cm,
            leftMargin=1.5*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        # Contenido
        elements = []

        # Header con logo
        elements.extend(self.create_header())

        # Obtener productos por categoría
        products_by_category = self.get_products_by_category(familia_id)

        if not products_by_category:
            elements.append(Paragraph("No hay productos para mostrar.", self.styles['Normal']))
        else:
            for categoria_nom, productes in products_by_category.items():
                # Título de categoría
                elements.append(Paragraph(categoria_nom, self.styles['CategoryTitle']))
                elements.append(Spacer(1, 10))

                # Tabla de productos (2 columnas)
                product_rows = self.create_product_rows(productes)
                elements.extend(product_rows)

                elements.append(Spacer(1, 20))

        # Construir PDF
        doc.build(elements, onFirstPage=self.add_page_footer, onLaterPages=self.add_page_footer)

    def create_header(self):
        """Crear el header del documento"""
        elements = []

        # Logo (si existe)
        logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                                  "media", "prat_logo.png")
        if os.path.exists(logo_path):
            logo = Image(logo_path, width=4*cm, height=2*cm)
            elements.append(logo)
            elements.append(Spacer(1, 10))

        # Título
        elements.append(Paragraph("Forn i Pastisseria Prat", self.styles['MainTitle']))
        elements.append(Paragraph("Catàleg de Productes", self.styles['Heading2']))
        elements.append(Spacer(1, 5))

        # Fecha
        fecha = date.today().strftime("%d/%m/%Y")
        elements.append(Paragraph(f"Actualitzat: {fecha}", self.styles['Normal']))
        elements.append(Spacer(1, 20))

        return elements

    def create_product_rows(self, productes):
        """Crear filas de productos (2 por fila)"""
        elements = []
        photos_dir = get_photos_dir()

        # Agrupar productos de 2 en 2
        for i in range(0, len(productes), 2):
            row_products = productes[i:i+2]
            row_data = []

            for producte in row_products:
                cell_content = self.create_product_cell(producte, photos_dir)
                row_data.append(cell_content)

            # Si es impar, añadir celda vacía
            if len(row_data) == 1:
                row_data.append('')

            # Crear tabla para esta fila
            table = Table([row_data], colWidths=[8.5*cm, 8.5*cm])
            table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 5),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))

            elements.append(table)
            elements.append(Spacer(1, 5))

        return elements

    def create_product_cell(self, producte, photos_dir):
        """Crear celda de un producto"""
        cell_elements = []

        # Imagen
        image_path = self.find_product_photo(producte.codi, photos_dir)
        if image_path and os.path.exists(image_path):
            try:
                img = Image(image_path, width=3*cm, height=3*cm)
                cell_elements.append(img)
            except Exception:
                pass  # Ignorar errores de imagen

        # Código y nombre
        cell_elements.append(Paragraph(
            f"<b>[{producte.codi}]</b> {producte.nom}",
            self.styles['ProductName']
        ))

        # Precio
        price_text = f"{producte.preu:.2f} €"
        if producte.unitat:
            price_text += f" / {producte.unitat}"
        cell_elements.append(Paragraph(price_text, self.styles['ProductPrice']))

        # Descripción
        if producte.descripcio:
            desc = producte.descripcio[:150] + "..." if len(producte.descripcio) > 150 else producte.descripcio
            cell_elements.append(Paragraph(desc, self.styles['ProductDesc']))

        # Crear tabla interna para la celda
        inner_table = Table([[e] for e in cell_elements], colWidths=[8*cm])
        inner_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddd')),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fafafa')),
        ]))

        return inner_table

    def find_product_photo(self, codi, photos_dir):
        """Buscar foto del producto"""
        if not photos_dir:
            return None

        extensions = ['.jpeg', '.jpg', '.png', '.gif']
        for ext in extensions:
            path = os.path.join(photos_dir, f"{codi}{ext}")
            if os.path.exists(path):
                return path

        return None

    def get_products_by_category(self, familia_id=None):
        """Obtener productos organizados por categoría"""
        result = {}

        query = self.session.query(Producte)

        if familia_id:
            query = query.join(Producte.families).filter(Familia.id == familia_id)

        productes = query.order_by(Producte.nom).all()

        for producte in productes:
            if producte.categories:
                for categoria in producte.categories:
                    if categoria.nom not in result:
                        result[categoria.nom] = []
                    if producte not in result[categoria.nom]:
                        result[categoria.nom].append(producte)
            else:
                if "Sin categoría" not in result:
                    result["Sin categoría"] = []
                result["Sin categoría"].append(producte)

        return result

    def add_page_footer(self, canvas, doc):
        """Añadir footer a cada página"""
        canvas.saveState()

        # Línea separadora
        canvas.setStrokeColor(colors.HexColor('#bdc3c7'))
        canvas.line(1.5*cm, 1.5*cm, A4[0] - 1.5*cm, 1.5*cm)

        # Texto del footer
        canvas.setFont('Helvetica-Oblique', 9)
        canvas.setFillColor(colors.HexColor('#7f8c8d'))
        canvas.drawCentredString(
            A4[0] / 2,
            1*cm,
            "Cada nit enfarinem l'obrador - Mollet del Vallès"
        )

        # Número de página
        canvas.drawRightString(
            A4[0] - 1.5*cm,
            1*cm,
            f"Pàgina {doc.page}"
        )

        canvas.restoreState()
