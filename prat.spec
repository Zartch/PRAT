# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file para PRAT
Genera un ejecutable único para Windows
"""

import os
import sys

block_cipher = None

# Directorio base
BASE_DIR = os.path.dirname(os.path.abspath(SPEC))

# Archivos de datos a incluir
datas = [
    (os.path.join(BASE_DIR, 'media', 'prat_logo.png'), 'media'),
    (os.path.join(BASE_DIR, 'media', 'prat_logo_blanco.jpg'), 'media'),
]

# Filtrar archivos que existen
datas = [(src, dst) for src, dst in datas if os.path.exists(src)]

a = Analysis(
    ['run.py'],
    pathex=[BASE_DIR],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'PyQt6.QtCore',
        'PyQt6.QtGui',
        'PyQt6.QtWidgets',
        'sqlalchemy.sql.default_comparator',
        'reportlab.graphics.barcode.common',
        'reportlab.graphics.barcode.code39',
        'reportlab.graphics.barcode.code93',
        'reportlab.graphics.barcode.code128',
        'reportlab.graphics.barcode.usps',
        'reportlab.graphics.barcode.usps4s',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'numpy',
        'pandas',
        'scipy',
        'django',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='PRAT',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Sin consola (GUI)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=os.path.join(BASE_DIR, 'media', 'prat_logo.png') if os.path.exists(os.path.join(BASE_DIR, 'media', 'prat_logo.png')) else None,
)
