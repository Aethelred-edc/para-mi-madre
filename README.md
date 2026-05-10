# 🌹 Regalo Madres Interactivo

Experiencia web interactiva y personalizada para el Día de las Madres. Estética elegante en Vino · Blanco Hueso · Oro.

## Uso

Abre `index.html` en un servidor local (no funciona directo desde el sistema de archivos por los módulos ES).

```bash
npx serve .
# o
python3 -m http.server 8080
```

## Personalización via URL

| URL | Destinataria |
|-----|-------------|
| `index.html?v=m` | Madre |
| `index.html?v=s` | Suegra |

También acepta Base64: `index.html?v=bQ==` (equivale a `m`).

## Personalizar Contenido

Edita `data/content.json`. Cambia poemas, fechas y respuestas de los retos sin tocar código.

**Importante:** actualiza `reto_respuesta` y `reto_respuesta_2` con las respuestas correctas reales para cada destinataria.

## Estructura

```
regalo-madres-interactivo/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   ├── main.css
│   ├── animations.css
│   └── components.css
├── js/
│   ├── app.js
│   ├── target-logic.js
│   ├── audio-engine.js
│   ├── game-engine.js
│   └── visuals.js
├── data/
│   └── content.json
└── assets/
    ├── sounds/
    └── vectors/
```

## Funcionalidades

- Rosas matemáticas animadas en Canvas (ecuaciones polares)
- Música de piano generativa en tiempo real con Tone.js
- Sistema de retos con validación y progreso persistente
- Confeti de pétalos al completar los retos
- Corazones y pétalos flotantes animados
- PWA con soporte offline via Service Worker
- Mobile-first, diseño responsive
