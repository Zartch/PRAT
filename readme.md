# PRAT - Generador de Catálogos

Aplicación de escritorio para generar catálogos en PDF desde archivos CSV y fotos de productos.

**Forn i Pastisseria Prat** - Mollet del Vallès

## Características

- **Importación CSV**: Carga productos desde archivos CSV con detección automática de codificación
- **Catálogo visual**: Visualiza productos organizados por categoría y familia
- **Generación PDF**: Crea catálogos profesionales en PDF con fotos
- **Ejecutable Windows**: Funciona sin necesidad de instalar Python

## Requerimientos

### Para desarrollo
- Python 3.10+
- PyQt6
- SQLAlchemy
- ReportLab
- Pillow
- chardet

### Para usuarios
- Windows 10/11 (ejecutable .exe)

## Instalación (Desarrollo)

```bash
# Clonar repositorio
git clone https://github.com/Zartch/PRAT.git
cd PRAT

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt
```

## Uso

### Ejecutar aplicación
```bash
python run.py
```

### Crear ejecutable Windows
```bash
python build.py
```
El ejecutable se generará en `dist/PRAT.exe`

## Formato CSV

El archivo CSV debe usar punto y coma (`;`) como separador:

| Columna | Descripción | Requerido |
|---------|-------------|-----------|
| CODI | Código único del producto | Sí |
| NOM | Nombre del producto | Sí |
| PREU | Precio (usar coma: 1,50) | Sí |
| FAMILIA | Familia(s), separar con coma | No |
| CATEGORIA | Categoría(s), separar con coma | No |
| unitatMesura | 'kg' o 'unitat' | No |
| Descripcio | Descripción del producto | No |

### Ejemplo CSV
```csv
CODI;NOM;PREU;FAMILIA;CATEGORIA;unitatMesura;Descripcio
1001;Pa de pagès;2,50;Pans;Tradicional;unitat;Pa artesanal
1002;Croissant;1,20;Pastisseria;Brioixeria;unitat;Croissant de mantega
```

## Fotos de productos

Las fotos deben nombrarse con el código del producto:
- `1001.jpeg`, `1001.jpg`, `1001.png`
- Configurar directorio desde la aplicación: **Directorio Fotos**

## Estructura del proyecto

```
PRAT/
├── app/
│   ├── __init__.py
│   ├── database.py      # Configuración SQLAlchemy
│   ├── models.py        # Modelos de datos
│   ├── utils.py         # Utilidades
│   └── views/
│       ├── main_window.py    # Ventana principal
│       ├── catalog_view.py   # Vista catálogo
│       ├── csv_import.py     # Importación CSV
│       └── pdf_generator.py  # Generador PDF
├── media/               # Logos y recursos
├── requirements.txt
├── run.py              # Punto de entrada
├── build.py            # Script de build
└── prat.spec           # Configuración PyInstaller
```

## Licencia

MIT License
