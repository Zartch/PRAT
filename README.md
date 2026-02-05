# PRAT - Catàleg de Productes (React Native)

Aplicació mòbil per gestionar el catàleg de productes del Forn i Pastisseria Prat.
Compilable per **iPhone** i **Android**.

## Funcionalitats

- **Catàleg de productes** amb cerca i filtre per famílies
- **Afegir productes manualment** amb codi, nom, preu, famílies, categories i descripció
- **Importar productes des de CSV** amb detecció automàtica de columnes
- **Càmera integrada** per fotografiar productes
- **Organització automàtica de fotos**: les fotos es guarden automàticament a la carpeta de la família del producte amb el nom `{codi}_{nom}.jpg`

## Estructura de carpetes de fotos

Quan fas una foto a un producte, es guarda automàticament:

```
fotos/
├── pans/
│   ├── 1001_pa_de_pages.jpg
│   └── 1002_pa_integral.jpg
├── pastissos/
│   ├── 2001_pastis_xocolata.jpg
│   └── 2002_braç_de_gitano.jpg
└── brioxeria/
    └── 3001_croissant.jpg
```

## Instal·lació i execució

### Requisits previs
- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- Per iOS: Xcode (macOS)
- Per Android: Android Studio amb SDK

### Passos

```bash
cd PratApp
npm install
npx expo start
```

### Compilar per dispositius

```bash
# Android APK
npx expo run:android

# iOS (requereix macOS amb Xcode)
npx expo run:ios

# Build de producció amb EAS
npx eas build --platform android
npx eas build --platform ios
```

## Format CSV per importació

Fitxer amb columnes separades per punt i coma (`;`):

| Columna | Tipus | Obligatori | Exemple |
|---------|-------|-----------|---------|
| CODI | Text | No | 1001 |
| NOM | Text | Sí | Pa de pagès |
| PREU | Decimal (coma) | No | 2,50 |
| FAMILIA | Text (coma-sep) | No | Pans, Artesania |
| CATEGORIA | Text (coma-sep) | No | Tradicional |
| unitatMesura | Text | No | unitat / kg |
| Descripcio | Text | No | Pa artesanal |

## Tecnologies

- **React Native** amb **Expo SDK 52**
- **expo-sqlite** per base de dades local
- **expo-camera** per captura de fotos
- **expo-file-system** per gestió d'arxius i carpetes
- **React Navigation** per navegació entre pantalles
