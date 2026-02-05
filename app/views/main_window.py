"""
Ventana principal de la aplicación PRAT
"""

import os
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QToolBar, QPushButton, QLabel, QComboBox, QStatusBar,
    QMessageBox, QFileDialog
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QAction, QIcon, QPixmap

from app.database import get_session, init_db
from app.models import Familia


class MainWindow(QMainWindow):
    """Ventana principal de PRAT"""

    def __init__(self):
        super().__init__()
        self.session = get_session()
        self.current_familia = None
        self.setup_ui()
        self.load_families()

    def setup_ui(self):
        """Configurar la interfaz de usuario"""
        self.setWindowTitle("PRAT - Forn i Pastisseria Prat")
        self.setMinimumSize(1024, 768)

        # Widget central
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)

        # Header
        self.create_header(main_layout)

        # Toolbar
        self.create_toolbar()

        # Área de contenido principal
        self.content_area = QWidget()
        self.content_layout = QVBoxLayout(self.content_area)
        main_layout.addWidget(self.content_area, 1)

        # Cargar vista de catálogo por defecto
        self.show_catalog()

        # Footer
        self.create_footer(main_layout)

        # Status bar
        self.statusBar().showMessage("Listo")

    def create_header(self, parent_layout):
        """Crear el header con logo"""
        header = QWidget()
        header.setStyleSheet("""
            QWidget {
                background-color: #2c3e50;
                padding: 10px;
            }
            QLabel {
                color: white;
            }
        """)
        header_layout = QHBoxLayout(header)

        # Logo (si existe)
        logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                                  "media", "prat_logo_blanco.jpg")
        if os.path.exists(logo_path):
            logo_label = QLabel()
            pixmap = QPixmap(logo_path)
            scaled_pixmap = pixmap.scaledToHeight(60, Qt.TransformationMode.SmoothTransformation)
            logo_label.setPixmap(scaled_pixmap)
            header_layout.addWidget(logo_label)

        # Título
        title_label = QLabel("Forn i Pastisseria Prat")
        title_label.setStyleSheet("font-size: 24px; font-weight: bold; margin-left: 20px;")
        header_layout.addWidget(title_label)

        header_layout.addStretch()

        # Selector de familia
        familia_label = QLabel("Familia:")
        familia_label.setStyleSheet("font-size: 14px;")
        header_layout.addWidget(familia_label)

        self.familia_combo = QComboBox()
        self.familia_combo.setMinimumWidth(200)
        self.familia_combo.setStyleSheet("""
            QComboBox {
                padding: 5px 10px;
                font-size: 14px;
                background-color: white;
                border-radius: 3px;
            }
        """)
        self.familia_combo.currentIndexChanged.connect(self.on_familia_changed)
        header_layout.addWidget(self.familia_combo)

        parent_layout.addWidget(header)

    def create_toolbar(self):
        """Crear la barra de herramientas"""
        toolbar = QToolBar("Herramientas")
        toolbar.setMovable(False)
        toolbar.setStyleSheet("""
            QToolBar {
                background-color: #ecf0f1;
                padding: 5px;
                spacing: 10px;
            }
            QPushButton {
                padding: 8px 16px;
                font-size: 13px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:pressed {
                background-color: #21618c;
            }
        """)
        self.addToolBar(toolbar)

        # Botón Ver Catálogo
        btn_catalog = QPushButton("Ver Catálogo")
        btn_catalog.clicked.connect(self.show_catalog)
        toolbar.addWidget(btn_catalog)

        # Botón Importar CSV
        btn_import = QPushButton("Importar CSV")
        btn_import.clicked.connect(self.show_csv_import)
        toolbar.addWidget(btn_import)

        # Botón Generar PDF
        btn_pdf = QPushButton("Generar PDF")
        btn_pdf.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
            }
            QPushButton:hover {
                background-color: #1e8449;
            }
        """)
        btn_pdf.clicked.connect(self.generate_pdf)
        toolbar.addWidget(btn_pdf)

        # Espaciador
        spacer = QWidget()
        spacer.setFixedWidth(20)
        toolbar.addWidget(spacer)

        # Botón Configurar directorio de fotos
        btn_photos = QPushButton("Directorio Fotos")
        btn_photos.setStyleSheet("""
            QPushButton {
                background-color: #9b59b6;
            }
            QPushButton:hover {
                background-color: #7d3c98;
            }
        """)
        btn_photos.clicked.connect(self.configure_photos_dir)
        toolbar.addWidget(btn_photos)

    def create_footer(self, parent_layout):
        """Crear el footer"""
        footer = QWidget()
        footer.setStyleSheet("""
            QWidget {
                background-color: #34495e;
                padding: 8px;
            }
            QLabel {
                color: #bdc3c7;
                font-size: 12px;
            }
        """)
        footer_layout = QHBoxLayout(footer)

        slogan = QLabel("Cada nit enfarinem l'obrador")
        slogan.setStyleSheet("font-style: italic;")
        footer_layout.addWidget(slogan)

        footer_layout.addStretch()

        location = QLabel("Mollet del Vallès")
        footer_layout.addWidget(location)

        parent_layout.addWidget(footer)

    def load_families(self):
        """Cargar familias en el combo"""
        self.familia_combo.clear()
        self.familia_combo.addItem("Todas las familias", None)

        families = self.session.query(Familia).order_by(Familia.nom).all()
        for familia in families:
            self.familia_combo.addItem(familia.nom, familia.id)

    def on_familia_changed(self, index):
        """Manejar cambio de familia seleccionada"""
        familia_id = self.familia_combo.currentData()
        self.current_familia = familia_id
        self.show_catalog()

    def clear_content(self):
        """Limpiar el área de contenido"""
        while self.content_layout.count():
            item = self.content_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

    def show_catalog(self):
        """Mostrar el catálogo de productos"""
        self.clear_content()
        from app.views.catalog_view import CatalogWidget
        catalog = CatalogWidget(self.session, self.current_familia)
        self.content_layout.addWidget(catalog)
        self.statusBar().showMessage("Mostrando catálogo de productos")

    def show_csv_import(self):
        """Mostrar diálogo de importación CSV"""
        from app.views.csv_import import CSVImportDialog
        dialog = CSVImportDialog(self.session, self)
        if dialog.exec():
            self.load_families()  # Recargar familias por si hay nuevas
            self.show_catalog()   # Refrescar catálogo
            self.statusBar().showMessage("Importación completada")

    def generate_pdf(self):
        """Generar PDF del catálogo"""
        from app.views.pdf_generator import PDFGenerator

        # Seleccionar ubicación para guardar
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Guardar PDF",
            "catalogo_prat.pdf",
            "PDF Files (*.pdf)"
        )

        if file_path:
            try:
                generator = PDFGenerator(self.session)
                generator.generate(file_path, familia_id=self.current_familia)
                self.statusBar().showMessage(f"PDF generado: {file_path}")
                QMessageBox.information(
                    self,
                    "PDF Generado",
                    f"El catálogo se ha guardado en:\n{file_path}"
                )
            except Exception as e:
                QMessageBox.critical(
                    self,
                    "Error",
                    f"Error al generar PDF:\n{str(e)}"
                )

    def configure_photos_dir(self):
        """Configurar directorio de fotos de productos"""
        from app.utils import get_photos_dir, set_photos_dir

        current_dir = get_photos_dir()
        new_dir = QFileDialog.getExistingDirectory(
            self,
            "Seleccionar directorio de fotos",
            current_dir
        )

        if new_dir:
            set_photos_dir(new_dir)
            self.statusBar().showMessage(f"Directorio de fotos: {new_dir}")
            self.show_catalog()  # Refrescar para mostrar fotos

    def closeEvent(self, event):
        """Manejar cierre de ventana"""
        self.session.close()
        event.accept()
