"""
Vista del catálogo de productos
"""

import os
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QScrollArea,
    QLabel, QFrame, QGridLayout, QSizePolicy
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap

from app.models import Producte, Categoria, Familia
from app.utils import get_photos_dir


class ProductCard(QFrame):
    """Tarjeta de producto individual"""

    def __init__(self, producte: Producte, parent=None):
        super().__init__(parent)
        self.producte = producte
        self.setup_ui()

    def setup_ui(self):
        """Configurar la interfaz de la tarjeta"""
        self.setFrameStyle(QFrame.Shape.Box | QFrame.Shadow.Raised)
        self.setStyleSheet("""
            ProductCard {
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin: 5px;
            }
            ProductCard:hover {
                border-color: #3498db;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)

        # Imagen del producto
        image_label = QLabel()
        image_label.setFixedSize(150, 150)
        image_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        image_label.setStyleSheet("background-color: #f8f9fa; border-radius: 4px;")

        # Buscar imagen
        photo_path = self.find_product_photo()
        if photo_path and os.path.exists(photo_path):
            pixmap = QPixmap(photo_path)
            scaled = pixmap.scaled(
                140, 140,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.SmoothTransformation
            )
            image_label.setPixmap(scaled)
        else:
            image_label.setText("Sin imagen")
            image_label.setStyleSheet("""
                background-color: #f8f9fa;
                border-radius: 4px;
                color: #aaa;
                font-size: 12px;
            """)

        layout.addWidget(image_label, alignment=Qt.AlignmentFlag.AlignCenter)

        # Código
        code_label = QLabel(f"Cód: {self.producte.codi}")
        code_label.setStyleSheet("color: #7f8c8d; font-size: 11px;")
        layout.addWidget(code_label)

        # Nombre
        name_label = QLabel(self.producte.nom)
        name_label.setStyleSheet("font-weight: bold; font-size: 14px; color: #2c3e50;")
        name_label.setWordWrap(True)
        name_label.setMaximumWidth(170)
        layout.addWidget(name_label)

        # Precio
        price_text = self.producte.preu_formatat
        if self.producte.unitat:
            price_text += f" / {self.producte.unitat}"
        price_label = QLabel(price_text)
        price_label.setStyleSheet("font-size: 16px; color: #27ae60; font-weight: bold;")
        layout.addWidget(price_label)

        # Descripción (si existe)
        if self.producte.descripcio:
            desc_label = QLabel(self.producte.descripcio[:100] + "..." if len(self.producte.descripcio) > 100 else self.producte.descripcio)
            desc_label.setStyleSheet("color: #7f8c8d; font-size: 11px;")
            desc_label.setWordWrap(True)
            desc_label.setMaximumWidth(170)
            layout.addWidget(desc_label)

        layout.addStretch()

    def find_product_photo(self):
        """Buscar foto del producto en el directorio configurado"""
        photos_dir = get_photos_dir()
        if not photos_dir:
            return None

        # Buscar con diferentes extensiones
        extensions = ['.jpeg', '.jpg', '.png', '.gif']
        for ext in extensions:
            path = os.path.join(photos_dir, f"{self.producte.codi}{ext}")
            if os.path.exists(path):
                return path

        return None


class CategorySection(QWidget):
    """Sección de categoría con sus productos"""

    def __init__(self, categoria_nom: str, productes: list, parent=None):
        super().__init__(parent)
        self.categoria_nom = categoria_nom
        self.productes = productes
        self.setup_ui()

    def setup_ui(self):
        """Configurar la sección de categoría"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 10, 0, 10)

        # Título de categoría
        title = QLabel(self.categoria_nom)
        title.setStyleSheet("""
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            padding: 10px;
            background-color: #ecf0f1;
            border-radius: 4px;
            margin-bottom: 10px;
        """)
        layout.addWidget(title)

        # Grid de productos
        products_widget = QWidget()
        grid = QGridLayout(products_widget)
        grid.setSpacing(15)

        # Añadir productos en grid (4 columnas)
        cols = 4
        for i, producte in enumerate(self.productes):
            row = i // cols
            col = i % cols
            card = ProductCard(producte)
            grid.addWidget(card, row, col)

        layout.addWidget(products_widget)


class CatalogWidget(QWidget):
    """Widget principal del catálogo"""

    def __init__(self, session, familia_id=None, parent=None):
        super().__init__(parent)
        self.session = session
        self.familia_id = familia_id
        self.setup_ui()

    def setup_ui(self):
        """Configurar la interfaz del catálogo"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # Área scrollable
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: #f5f6fa;
            }
        """)

        # Contenedor de contenido
        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(20, 20, 20, 20)

        # Obtener productos organizados por categoría
        products_by_category = self.get_products_by_category()

        if not products_by_category:
            empty_label = QLabel("No hay productos para mostrar.\nImporta un archivo CSV para añadir productos.")
            empty_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            empty_label.setStyleSheet("font-size: 16px; color: #7f8c8d; padding: 50px;")
            content_layout.addWidget(empty_label)
        else:
            for categoria_nom, productes in products_by_category.items():
                section = CategorySection(categoria_nom, productes)
                content_layout.addWidget(section)

        content_layout.addStretch()
        scroll.setWidget(content)
        layout.addWidget(scroll)

    def get_products_by_category(self):
        """Obtener productos organizados por categoría"""
        result = {}

        # Query base
        query = self.session.query(Producte)

        # Filtrar por familia si está seleccionada
        if self.familia_id:
            query = query.join(Producte.families).filter(Familia.id == self.familia_id)

        productes = query.order_by(Producte.nom).all()

        # Organizar por categoría
        for producte in productes:
            if producte.categories:
                for categoria in producte.categories:
                    if categoria.nom not in result:
                        result[categoria.nom] = []
                    if producte not in result[categoria.nom]:
                        result[categoria.nom].append(producte)
            else:
                # Productos sin categoría
                if "Sin categoría" not in result:
                    result["Sin categoría"] = []
                result["Sin categoría"].append(producte)

        return result
