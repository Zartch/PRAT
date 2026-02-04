"""
Diálogo de importación de archivos CSV
"""

import csv
import chardet
from io import StringIO

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFileDialog, QTextEdit, QProgressBar, QMessageBox, QGroupBox
)
from PyQt6.QtCore import Qt

from app.models import Producte, Familia, Categoria


class CSVImportDialog(QDialog):
    """Diálogo para importar productos desde CSV"""

    def __init__(self, session, parent=None):
        super().__init__(parent)
        self.session = session
        self.file_path = None
        self.setup_ui()

    def setup_ui(self):
        """Configurar la interfaz del diálogo"""
        self.setWindowTitle("Importar Productos desde CSV")
        self.setMinimumSize(600, 500)

        layout = QVBoxLayout(self)

        # Instrucciones
        instructions = QGroupBox("Formato esperado del CSV")
        inst_layout = QVBoxLayout(instructions)
        inst_label = QLabel("""
        El archivo CSV debe tener las siguientes columnas separadas por punto y coma (;):

        <b>CODI</b> - Código único del producto (número)
        <b>NOM</b> - Nombre del producto
        <b>PREU</b> - Precio (usar coma para decimales: 1,50)
        <b>FAMILIA</b> - Familia(s) del producto (separar múltiples con coma)
        <b>CATEGORIA</b> - Categoría(s) del producto (separar múltiples con coma)
        <b>unitatMesura</b> - Unidad: 'kg' o 'unitat' (opcional)
        <b>Descripcio</b> - Descripción del producto (opcional)
        """)
        inst_label.setTextFormat(Qt.TextFormat.RichText)
        inst_label.setStyleSheet("padding: 10px;")
        inst_layout.addWidget(inst_label)
        layout.addWidget(instructions)

        # Selector de archivo
        file_group = QGroupBox("Archivo CSV")
        file_layout = QHBoxLayout(file_group)

        self.file_label = QLabel("Ningún archivo seleccionado")
        self.file_label.setStyleSheet("padding: 5px;")
        file_layout.addWidget(self.file_label, 1)

        btn_select = QPushButton("Seleccionar archivo...")
        btn_select.clicked.connect(self.select_file)
        file_layout.addWidget(btn_select)

        layout.addWidget(file_group)

        # Log de importación
        log_group = QGroupBox("Log de importación")
        log_layout = QVBoxLayout(log_group)

        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.setStyleSheet("""
            QTextEdit {
                font-family: monospace;
                font-size: 12px;
                background-color: #1e1e1e;
                color: #d4d4d4;
            }
        """)
        log_layout.addWidget(self.log_text)

        self.progress = QProgressBar()
        self.progress.setVisible(False)
        log_layout.addWidget(self.progress)

        layout.addWidget(log_group, 1)

        # Botones
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        btn_cancel = QPushButton("Cancelar")
        btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(btn_cancel)

        self.btn_import = QPushButton("Importar")
        self.btn_import.setEnabled(False)
        self.btn_import.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                padding: 8px 20px;
                border: none;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #1e8449;
            }
            QPushButton:disabled {
                background-color: #95a5a6;
            }
        """)
        self.btn_import.clicked.connect(self.import_csv)
        btn_layout.addWidget(self.btn_import)

        layout.addLayout(btn_layout)

    def log(self, message, level="info"):
        """Añadir mensaje al log"""
        colors = {
            "info": "#d4d4d4",
            "success": "#4ec9b0",
            "warning": "#dcdcaa",
            "error": "#f14c4c"
        }
        color = colors.get(level, colors["info"])
        self.log_text.append(f'<span style="color: {color}">{message}</span>')

    def select_file(self):
        """Seleccionar archivo CSV"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Seleccionar archivo CSV",
            "",
            "CSV Files (*.csv);;All Files (*)"
        )

        if file_path:
            self.file_path = file_path
            self.file_label.setText(file_path)
            self.btn_import.setEnabled(True)
            self.log(f"Archivo seleccionado: {file_path}", "info")

    def detect_encoding(self, file_path):
        """Detectar codificación del archivo"""
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)
            result = chardet.detect(raw_data)
            return result['encoding']

    def import_csv(self):
        """Importar el archivo CSV"""
        if not self.file_path:
            return

        self.btn_import.setEnabled(False)
        self.progress.setVisible(True)
        self.log_text.clear()

        try:
            # Detectar codificación
            encoding = self.detect_encoding(self.file_path)
            self.log(f"Codificación detectada: {encoding}", "info")

            # Leer archivo
            with open(self.file_path, 'r', encoding=encoding) as f:
                content = f.read()

            # Parsear CSV
            reader = csv.DictReader(StringIO(content), delimiter=';')
            rows = list(reader)

            self.progress.setMaximum(len(rows))
            self.log(f"Procesando {len(rows)} filas...", "info")

            created = 0
            updated = 0
            errors = 0

            for i, row in enumerate(rows):
                self.progress.setValue(i + 1)

                try:
                    result = self.process_row(row)
                    if result == "created":
                        created += 1
                    elif result == "updated":
                        updated += 1
                except Exception as e:
                    errors += 1
                    self.log(f"Error en fila {i + 1}: {str(e)}", "error")

            # Commit cambios
            self.session.commit()

            # Resumen
            self.log("", "info")
            self.log("=" * 40, "info")
            self.log(f"Importación completada:", "success")
            self.log(f"  - Productos creados: {created}", "success")
            self.log(f"  - Productos actualizados: {updated}", "success")
            if errors:
                self.log(f"  - Errores: {errors}", "warning")

            QMessageBox.information(
                self,
                "Importación completada",
                f"Creados: {created}\nActualizados: {updated}\nErrores: {errors}"
            )

            self.accept()

        except Exception as e:
            self.session.rollback()
            self.log(f"Error fatal: {str(e)}", "error")
            QMessageBox.critical(self, "Error", f"Error durante la importación:\n{str(e)}")

        finally:
            self.btn_import.setEnabled(True)
            self.progress.setVisible(False)

    def process_row(self, row):
        """Procesar una fila del CSV"""
        # Obtener valores
        codi = int(row.get('CODI', 0))
        nom = row.get('NOM', '').strip()
        preu_str = row.get('PREU', '0').replace(',', '.')
        preu = float(preu_str) if preu_str else 0.0
        unitat = row.get('unitatMesura', '').strip() or None
        descripcio = row.get('Descripcio', '').strip() or None

        if not codi or not nom:
            raise ValueError(f"Código o nombre vacío")

        # Buscar o crear producto
        producte = self.session.query(Producte).filter_by(codi=codi).first()
        is_new = producte is None

        if is_new:
            producte = Producte(codi=codi, nom=nom, preu=preu)
            self.session.add(producte)
            self.log(f"+ Creado: [{codi}] {nom}", "success")
        else:
            producte.nom = nom
            producte.preu = preu
            self.log(f"~ Actualizado: [{codi}] {nom}", "info")

        producte.unitat = unitat
        producte.descripcio = descripcio

        # Procesar familias
        familias_str = row.get('FAMILIA', '')
        if familias_str:
            producte.families.clear()
            for fam_nom in familias_str.split(','):
                fam_nom = fam_nom.strip()
                if fam_nom:
                    familia = self.get_or_create_familia(fam_nom)
                    producte.families.append(familia)

        # Procesar categorías
        categorias_str = row.get('CATEGORIA', '')
        if categorias_str:
            producte.categories.clear()
            for cat_nom in categorias_str.split(','):
                cat_nom = cat_nom.strip()
                if cat_nom:
                    categoria = self.get_or_create_categoria(cat_nom)
                    producte.categories.append(categoria)

        return "created" if is_new else "updated"

    def get_or_create_familia(self, nom):
        """Obtener o crear una familia"""
        familia = self.session.query(Familia).filter_by(nom=nom).first()
        if not familia:
            familia = Familia(nom=nom)
            self.session.add(familia)
            self.session.flush()
        return familia

    def get_or_create_categoria(self, nom):
        """Obtener o crear una categoría"""
        categoria = self.session.query(Categoria).filter_by(nom=nom).first()
        if not categoria:
            categoria = Categoria(nom=nom)
            self.session.add(categoria)
            self.session.flush()
        return categoria
