# M4Engine

Motor de **aventuras gráficas point & click 2D** en JavaScript, sin paso de
compilación. Renderiza con [PixiJS](https://pixijs.com/) y suena con
[Howler.js](https://howlerjs.com/) y va como un tiro.

El motor está separado del contenido del juego: toda la lógica vive en
`m4engine/`, y un juego concreto se define por completo con datos (escenas,
diálogos, items, idiomas, assets) en una carpeta `gamedata/` (o como la quieras 
llamar) aparte. Este repo publica **solo el motor y su documentación**; el arte 
y los guiones del juego con el que nació no se incluyen. Pero hazte tu unos, 
que es bien entretenido.

## Qué trae

```
m4engine/                 ← el motor
index.html                ← carga el motor y la gamedata
docs/
├── GAMEDATA_FORMAT.md     ← referencia completa del formato de datos
└── gamedata_template/     ← esqueleto de ejemplo de un juego nuevo
```

## Cómo arrancar

El motor no necesita build. Sírvelo con cualquier servidor estático (no funciona
abriendo el `index.html` con `file://` por las restricciones de carga del
navegador). Por ejemplo, si tienes python:

```bash
python3 -m http.server 8000
# y luego abres http://localhost:8000/ con un navegador decente (como Firefox, no las mierdas esas que usáis los jovenes)
```
Y si no, con SimpleWebServer o similar también va.

**OJO:** `index.html` intenta cargar los datos desde una carpeta `./gamedata/` que **no viene en
este repo**. Para probar el esqueleto de ejemplo, cópialo de docs a la raíz.

> Nota: la plantilla es un punto de partida mínimo; todavía no incluye assets, así
> que sirve como referencia de estructura pero no furula.

## Cómo hacer tu juego

1. Copia `docs/gamedata_template/` a `./gamedata/`.
2. Pon tus spritesheets (`.png` + `.json` estilo TexturePacker) y audio en
   `gamedata/assets/` y regístralos en `gamedata/config.js`.
3. Crea escenas en `gamedata/scenes/` y diálogos en `gamedata/dialogs/`, y
   añádelos a `gamedata/manifest.js`.
4. El formato completo (escenas, diálogos, acciones, condicionales, API del
   motor accesible desde el código...) está en
   [`docs/GAMEDATA_FORMAT.md`](docs/GAMEDATA_FORMAT.md).

## Fuentes

El motor referencia varias familias por `@font-face` en `index.html`
(`m4engine/fonts/`), pero **las fuentes no se incluyen en el repo** porque
no quiero líos con las licencias. Pon las tuyas en `m4engine/fonts/` y ajusta 
las declaraciones `@font-face`, o cambia las familias desde tu `config.js`
(`base.fontFamily`, `base.notebookFontFamily`, `base.fonts`). Sin fuentes, el
motor funciona igual usando las del sistema.

## Licencia

[MIT](LICENSE) © Screen13