"""
Utilidades de la aplicación PRAT
"""

import os
import json

# Archivo de configuración
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_FILE = os.path.join(APP_DIR, "prat_config.json")

# Directorio por defecto de fotos
DEFAULT_PHOTOS_DIR = os.path.join(APP_DIR, "media", "fotos")


def load_config():
    """Cargar configuración desde archivo"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_config(config):
    """Guardar configuración a archivo"""
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error guardando configuración: {e}")


def get_photos_dir():
    """Obtener directorio de fotos configurado"""
    config = load_config()
    photos_dir = config.get('photos_dir', DEFAULT_PHOTOS_DIR)

    # Si no existe, intentar con el directorio por defecto
    if not os.path.exists(photos_dir):
        if os.path.exists(DEFAULT_PHOTOS_DIR):
            return DEFAULT_PHOTOS_DIR
        return None

    return photos_dir


def set_photos_dir(path):
    """Configurar directorio de fotos"""
    config = load_config()
    config['photos_dir'] = path
    save_config(config)


def get_app_dir():
    """Obtener directorio de la aplicación"""
    return APP_DIR


def ensure_dirs():
    """Asegurar que existen los directorios necesarios"""
    dirs = [
        os.path.join(APP_DIR, "media"),
        os.path.join(APP_DIR, "media", "fotos"),
    ]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
