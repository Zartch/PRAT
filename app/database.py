"""
Configuración de la base de datos SQLAlchemy
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Directorio de datos de la aplicación
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(APP_DIR, "prat.db")

# Crear engine SQLite
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)

# Sesión
SessionLocal = sessionmaker(bind=engine)

# Base para los modelos
Base = declarative_base()


def get_session():
    """Obtener una sesión de base de datos"""
    return SessionLocal()


def init_db():
    """Inicializar la base de datos (crear tablas)"""
    from app.models import Familia, Categoria, Producte  # noqa
    Base.metadata.create_all(bind=engine)
