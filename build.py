#!/usr/bin/env python3
"""
Script de construcción para PRAT
Genera el ejecutable para Windows o Linux usando PyInstaller
"""

import os
import sys
import platform
import shutil
import subprocess

# Directorio base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Detectar plataforma
IS_WINDOWS = platform.system() == 'Windows'
IS_LINUX = platform.system() == 'Linux'
IS_MAC = platform.system() == 'Darwin'

# Nombre del ejecutable según plataforma
if IS_WINDOWS:
    EXE_NAME = 'PRAT.exe'
else:
    EXE_NAME = 'PRAT'


def clean_build():
    """Limpiar directorios de build anteriores"""
    dirs_to_clean = ['build', 'dist', '__pycache__']

    for dir_name in dirs_to_clean:
        dir_path = os.path.join(BASE_DIR, dir_name)
        if os.path.exists(dir_path):
            print(f"Limpiando {dir_name}/...")
            shutil.rmtree(dir_path)

    # Limpiar .pyc
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.pyc'):
                os.remove(os.path.join(root, file))
        for dir_name in dirs:
            if dir_name == '__pycache__':
                shutil.rmtree(os.path.join(root, dir_name))


def check_dependencies():
    """Verificar que las dependencias están instaladas"""
    try:
        import PyQt6
        import sqlalchemy
        import reportlab
        import chardet
        print("✓ Todas las dependencias están instaladas")
        return True
    except ImportError as e:
        print(f"✗ Falta dependencia: {e}")
        print("Ejecuta: pip install -r requirements.txt")
        return False


def build_exe():
    """Construir el ejecutable"""
    platform_name = platform.system()
    print("\n" + "="*50)
    print(f"Construyendo PRAT para {platform_name}...")
    print("="*50 + "\n")

    # Comando PyInstaller
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--clean',
        '--noconfirm',
        'prat.spec'
    ]

    result = subprocess.run(cmd, cwd=BASE_DIR)

    if result.returncode == 0:
        exe_path = os.path.join(BASE_DIR, 'dist', EXE_NAME)
        if os.path.exists(exe_path):
            size_mb = os.path.getsize(exe_path) / (1024 * 1024)
            print("\n" + "="*50)
            print(f"✓ Ejecutable creado exitosamente!")
            print(f"  Plataforma: {platform_name}")
            print(f"  Ubicación: {exe_path}")
            print(f"  Tamaño: {size_mb:.1f} MB")
            print("="*50)
            return True

    print("\n✗ Error al crear el ejecutable")
    return False


def main():
    """Función principal"""
    print("="*50)
    print("PRAT - Constructor de Ejecutable")
    print(f"Plataforma detectada: {platform.system()}")
    print("="*50)

    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)

    # Limpiar build anterior
    print("\nLimpiando builds anteriores...")
    clean_build()

    # Construir
    if build_exe():
        print("\n¡Proceso completado!")
        print(f"El ejecutable se encuentra en: dist/{EXE_NAME}")
    else:
        print("\nEl proceso falló. Revisa los errores anteriores.")
        sys.exit(1)


if __name__ == "__main__":
    main()
