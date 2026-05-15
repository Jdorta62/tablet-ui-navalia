# MesaXR Interactive Menu V1.0

## Descripción
Sistema de navegación interactivo para VR embebido en Unity utilizando UnityWebBrowser (CEF). Interfaz de gestión de activos operativos (Drone, Helicóptero, Barco) con diseño naval/militar futurista.

## Estructura del Proyecto

```
InteractableMenuV1.0/
├── index.html              ← Página de bienvenida "Bienvenida a la Mesa XR"
├── drone.html              ← Panel de información del Drone (UAV Táctico)
├── helicoptero.html        ← Panel de información del Helicóptero (Transporte Táctico)
├── barco.html              ← Panel de información del Barco (Patrullero Avanzado)
├── css/
│   ├── base.css            ← Reset, variables CSS, tipografía, layout base
│   ├── components.css      ← Componentes reutilizables (cards, badges, tablas)
│   └── theme.css           ← Efectos visuales, animaciones, gradientes
├── js/
│   └── main.js             ← Navegación, animaciones de entrada
├── assets/                 ← Reservada para futuros recursos (vacía)
└── README.md               ← Este archivo
```

## Características Técnicas

### Resolución y Viewport
- **Objetivo**: 1920x1080px (sin scroll)
- **Optimizado para**: VR touch interaction
- **Mínimo alto interactivo**: 60px (botones, cards, etc.)
- **Browser**: UnityWebBrowser v2.2.8 (CEF backend)

### Identidad Visual MesaXR
- **Paleta de colores**:
  - Azul marino profundo: `#0d1b2a`
  - Cian eléctrico: `#00c8c8`
  - Púrpura: `#7b4fcf`
  - Verde neon: `#00ff88`
  - Fondo oscuro: `#0a0f15`

- **Tipografía**:
  - Display: Orbitron (Google Fonts) — sci-fi/naval futurista
  - Body: System fonts (Segoe UI, Roboto)

- **Efectos**:
  - Glow sutil en elementos (cian/púrpura)
  - Scan-line effect en fondo
  - Animaciones slide/fade en entrada
  - Pulso en indicadores de estado

### Sistema de Componentes

#### Stat Cards
Tarjetas de especificación técnica con valor grande y label. Hover activa glow cian.
```html
<div class="stat-card">
  <div class="stat-card-label">Autonomía</div>
  <div>
    <span class="stat-card-value">45</span>
    <span class="stat-card-unit">min</span>
  </div>
</div>
```

#### Status Badges
Indicadores de estado (ON/OFF/STANDBY) con led pulsante.
```html
<span class="status-badge status-on">● Operacional</span>
<span class="status-badge status-standby">⚠ Standby</span>
<span class="status-badge status-off">● Offline</span>
```

#### Navigation Buttons
Botones grandes para navegación principal (mínimo 70px de alto).
```html
<a href="drone.html" class="nav-btn">
  <div class="nav-btn-icon">🛸</div>
  <div class="nav-btn-label">Drone</div>
</a>
```

#### Cards & Sections
Contenedores con bordes cian, fondo oscuro y glow en hover.

### CSS Variables
Todas las variables están definidas en `css/base.css` para fácil personalización:
- Colores: `--color-cian`, `--color-purple`, `--color-navy`, etc.
- Espaciado: `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`
- Tipografía: `--font-primary`, `--font-size-*`
- Transiciones: `--transition-fast`, `--transition-base`, `--transition-slow`

## Flujo de Navegación

```
index.html (Bienvenida)
    ↓
    ├─→ drone.html (Especificaciones UAV)
    ├─→ helicoptero.html (Especificaciones Helicóptero)
    └─→ barco.html (Especificaciones Barco)
        ↓
        [Back Button] ←─ vuelve a index.html
```

## Uso

### Carga en Unity
1. Los archivos HTML se sirven desde `StreamingAssets/InteractableMenuV1.0/`
2. URL de carga: `file:///<path>/InteractableMenuV1.0/index.html`
3. UnityWebBrowser renderiza la página en CEF

### Touch Interaction (VR)
- Todos los botones y elementos tienen mínimo 60px de alto para dedos grandes
- Input nativo del browser soportado
- Sin frameworks externos (vanilla HTML/CSS/JS)

### Personalización
- **Colores**: Editar variables CSS en `css/base.css`
- **Especificaciones técnicas**: Editar valores en drone.html, helicoptero.html, barco.html
- **Sistemas a bordo**: Agregar/quitar badges en secciones "Sistemas a Bordo"
- **Animaciones**: Ajustar duraciones en `--transition-*` en base.css

## Performance
- Zero external dependencies (excepto Google Fonts para Orbitron)
- CSS compilado, sin pre-procesadores
- JavaScript vanilla sin frameworks
- Optimizado para baja latencia en VR

## Browser Compatibility
- Soportado en: Chrome/Chromium (CEF via UnityWebBrowser)
- No requiere: JavaScript ES6+ features
- Layout: Flexbox + CSS Grid

## Notas de Desarrollo

### Agregar Nueva Página
1. Crear `nueva-pagina.html` en la raíz de InteractableMenuV1.0/
2. Incluir los tres CSS en `<head>`:
   ```html
   <link rel="stylesheet" href="css/base.css">
   <link rel="stylesheet" href="css/components.css">
   <link rel="stylesheet" href="css/theme.css">
   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
   ```
3. Envolver contenido en `<div class="container">` con nav-bar
4. Incluir `<script src="js/main.js"></script>` al final del body

### Agregar Animaciones
- Usar clases de animación: `animate-fade-in`, `animate-slide-up`, `animate-slide-down`, etc.
- Para cascada (stagger): agregar clase `stagger-1`, `stagger-2`, etc.
- El script main.js automáticamente crea delays de 0.1s entre elementos

### Debug
- main.js incluye `console.log('MesaXR Interface initialized')` en consola del navegador
- Ver DevTools de CEF en UnityWebBrowser

## Archivos Antiguos
Los archivos HTML anteriores (test-interactions.html, bottons.html, etc.) han sido movidos a `_archi/` para mantener la carpeta StreamingAssets limpia y organizada.

## Créditos
- Diseño: Identidad visual naval/militar futurista MesaXR
- Framework: Vanilla HTML5, CSS3, JavaScript ES5+
- Tipografía: Orbitron (Google Fonts)
- Plataforma: Unity 6000.3.8f1 + Meta XR SDK v83 + UnityWebBrowser v2.2.8
