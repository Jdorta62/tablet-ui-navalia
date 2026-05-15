# TabletMenus — Claude Code context

## What this is
Tablet UI for a naval simulation running in Unity 6 (UnityWebBrowser v2.2.8 / CEF backend).
HTML/CSS/JS pages rendered inside a Unity WebView on a physical XR table.
Target resolution: 1920×1080 px. Touch interaction (no mouse hover in production).

## Project root
`StreamingAssets/TabletMenus/` — everything lives here, this is the working directory.

## Directory structure
```
TabletMenus/
├── assets/
│   ├── fonts/    ShareTechMono-Regular.woff2
│   ├── images/   Barco.png  Dron.png  Helicoptero.png
│   └── tiles/    {z}/{x}/{y}.png + metadata.json   (ESRI Topo, zoom 11-16, offline)
├── css/
│   └── shared.css      single source for all colours, typography, components
├── js/
│   └── bridge.js       Unity ↔ JS communication layer
├── home/               hub / main menu
├── map/                Leaflet tactical map (tiles offline)
├── drones/             index = list, detail.html = individual drone
├── vessel/             ship platform telemetry
├── helo/               helicopter
├── mission/            mission planning / status
├── settings/           system configuration
└── Example/            original V1.0 reference — DO NOT MODIFY
```

## File conventions
- Each page: `<module>/index.html` (+ `detail.html` where needed)
- Page-specific styles: `<module>/index.css` (same folder as the HTML)
- Page-specific logic: `<module>/index.js`  (same folder as the HTML)
- **No inline `<style>` or `<script>` blocks inside HTML files** — only `<link>` and `<script src="">` tags
- **No inline event handlers** (`onclick`, `onchange`, etc.) — wire everything via `addEventListener` in the .js file

## Relative paths (from a page at `<module>/index.html`)
| Resource | Path |
|---|---|
| shared.css | `../css/shared.css` |
| bridge.js  | `../js/bridge.js`  |
| page css   | `./index.css`      |
| page js    | `./index.js`       |
| images     | `../assets/images/<file>.png` |
| tiles      | `../assets/tiles/{z}/{x}/{y}.png` |
| font (in CSS only) | `../assets/fonts/ShareTechMono-Regular.woff2` |

## Visual style (defined in shared.css)
- Background: `#0d0d0d`
- Accent: military green `#3a7d32` / bright `#4ea844`
- Text: off-white `#e0e0e0`
- Font: ShareTechMono (loaded offline via @font-face), monospace fallback
- Corners: sharp clip-path (`polygon(10px 0%, ...)`) — no border-radius
- No drop-shadows — subtle `box-shadow` glow only on active/hover elements
- Scrollbar: 44 px wide (touch-friendly)
- All values via CSS custom properties (`--accent`, `--bg-base`, `--sp-md`, …)

## Unity ↔ JS bridge (bridge.js)
```
JS → C#  :  Bridge.send('MethodName', { ...data })
             internally: uwb.ExecuteJsMethod('MethodName', jsonString)

C# → JS  :  C# calls browser.ExecuteJavaScript("Bridge.receive(payload)")
             payload = JSON string  { "event": "EventName", "data": { ... } }
             JS side: Bridge.on('EventName', function(data) { ... })
```
When `uwb` is absent (plain browser, dev), sends fall back to a console warning.

### Convenience senders already wired
| Method | C# event |
|---|---|
| `Bridge.setAssetActive(id, bool)` | `OnSetAssetActive` |
| `Bridge.requestTelemetry(id)` | `OnRequestTelemetry` |
| `Bridge.updateSetting(key, value)` | `OnSettingChanged` |
| `Bridge.focusAsset(id)` | `OnFocusAsset` |
| `Bridge.mapPanTo(lat, lon, zoom)` | `OnMapPanTo` |
| `Bridge.pageReady(pageName)` | `OnPageReady` |

## Offline constraint
Zero external requests anywhere — no CDN, no Google Fonts, no analytics.
All asset paths must be relative and resolve locally.

## Map tiles
- Provider: ESRI Topo
- Center: 42.757 °N / -8.999 °W (Galicia, North Atlantic)
- Zoom levels available: 11–16
- Metadata: `assets/tiles/metadata.json`
- Leaflet integration is pending — the `<div id="map">` placeholder is in `map/index.html`

---

## Módulo `drones/` — arquitectura propia

El módulo de drones **no usa `bridge.js`**. Tiene su propio puente Unity ↔ JS implementado en `DroneTabletBridge.cs`.

### Códigos de estado (`Drone.Status : int`)
| Valor | Nombre | Dot CSS | Significado |
|---|---|---|---|
| 0 | DESCONECTADO | `off` (gris) | Sin señal OSC |
| 1 | PATRULLA | `ok` (verde) | Volando / ejecutando misión |
| 2 | RTL | `warn` (ámbar) | Return-to-launch |
| 3 | ENCUBIERTA | `info` (azul) | En cubierta, disponible |

Condición operativo (puede recibir misión): `Status == 3 && !StatusRescueArea`.

### Unity → `index.html` (telemetría de lista)
```javascript
DroneSelectionAPI.setDrone(id, { name, battery, altitude, operative, status })
// id: "drone_1" | "drone_2" | "drone_3"
// Se llama cada 1 s desde DroneTabletBridge.SendTelemetry()
```

### Unity → `mission.html` (telemetría de estado)
```javascript
MissionAPI.onTelemetry(droneId, operative)   // cada 1 s, solo mientras mission.html está cargada
MissionAPI.onMissionConfirmed()              // cuando Drone.Status pasa a 1 tras enviar misión
```

### JS → Unity (envío de misión)
```javascript
uwb.ExecuteJsMethod('launchMission', droneId, { lat, lon }, width, height)
// width y height son int (step=50, parseInt) — RegisterJsMethod registrado con <int,int>
```
El stub `window.MissionAPI.launchMission` es sobreescrito por `DroneTabletBridge.OnPageLoaded`
para enrutar la llamada por UWB cuando la URL contiene `mission.html`.

### Flujo de envío de misión y restricciones del botón

```
[Usuario confirma modal]
  → _missionPending = true
  → btn-launch DESACTIVADO
  → barra ámbar parpadeante "Esperando confirmación..."
  → setTimeout(60 s) → timeout → barra roja + btn re-activado

[Telemetría: Status → 1]
  → onMissionConfirmed()
  → clearPendingTimer()           ← NO re-activa el botón
  → barra verde "Misión activa — drone en vuelo"
  → btn sigue DESACTIVADO

[Telemetría: operative → true (Status==3 && !StatusRescueArea)]
  → onTelemetry(droneId, true)
  → btn re-ACTIVADO + barra oculta

[Telemetría: operative → false mientras sin misión pendiente]
  → onTelemetry(droneId, false)
  → btn DESACTIVADO
```

**Regla clave:** el botón de lanzar solo se reactiva vía `onTelemetry(operative=true)`.
Seleccionar un área nueva en el mapa NO reactiva el botón si `_missionPending === true`.

### Estados de la barra de estado (`mission.html`)
| Clase CSS | Color | Activa cuando |
|---|---|---|
| `pending` | Ámbar, pulso | Misión enviada, esperando Status→1 |
| `confirmed` | Verde | `onMissionConfirmed()` recibido |
| `timeout` | Rojo | 60 s sin confirmación |
| `hidden` | — | `onTelemetry(operative=true)` |

---

## Reference example
`Example/InteractableMenuV1.0/` — original V1.0 with cyan/purple sci-fi palette.
Study it for CEF interaction patterns. The key bridge call found there:
```javascript
uwb.ExecuteJsMethod("toggleDrone");   // drone.html line 163
```
