#!/usr/bin/env python3
"""
PRAT - Generador de Catálogos de Productos
Punto de entrada de la aplicación

Ejecutar: python run.py
"""

import sys
import os

# Añadir directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon

from app.database import init_db
from app.utils import ensure_dirs
from app.views.main_window import MainWindow


def main():
    """Función principal"""
    # Crear directorios necesarios
    ensure_dirs()

    # Inicializar base de datos
    init_db()

    # Crear aplicación Qt
    app = QApplication(sys.argv)
    app.setApplicationName("PRAT")
    app.setOrganizationName("Forn i Pastisseria Prat")
    app.setApplicationVersion("2.0.0")

    # Estilo global
    app.setStyleSheet("""
        QMainWindow {
            background-color: #f5f6fa;
        }
        QToolTip {
            background-color: #2c3e50;
            color: white;
            border: none;
            padding: 5px;
            border-radius: 3px;
        }
    """)

    # Icono de la aplicación (si existe)
    icon_path = os.path.join(os.path.dirname(__file__), "media", "prat_logo.png")
    if os.path.exists(icon_path):
        app.setWindowIcon(QIcon(icon_path))

    # Crear y mostrar ventana principal
    window = MainWindow()
    window.show()

    # Ejecutar aplicación
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
