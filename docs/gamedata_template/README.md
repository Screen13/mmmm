# Plantilla de gamedata para M4Engine

Esqueleto mínimo para empezar un juego nuevo con el motor `m4engine`.

## Cómo usarla

1. Copia esta carpeta con el nombre que quieras (p.ej. `gamedata_mijuego/`).
2. Copia el `index.html` del proyecto y cambia en él las dos referencias a
   `gamedata/` por tu carpeta (la del manifest y la del bucle de carga).
3. Pon tus assets en `<tu_carpeta>/assets/` y regístralos en `config.js`
   (`base.assets` para spritesheets, `base.snd` para audio).
4. Arranca: la escena inicial es `base.initScene`. Para probar otra escena
   sin tocar el config, abre el juego con `?scene=Nombre_Escena` en la URL.

El formato completo de escenas, diálogos y acciones está documentado en
`GAMEDATA_FORMAT.md` (en `docs/`).

## Estructura

```
gamedata_mijuego/
├── manifest.js      ← lista ordenada de scripts a cargar (config, escenas, diálogos...)
├── config.js        ← configuración, personaje principal, inventario
├── extensions.js    ← código propio del juego: customActions, hooks de personajes...
├── lang/
│   └── en.js        ← traducciones (opcional)
├── scenes/          ← una escena por fichero (config.scenes.push({...}))
├── dialogs/         ← diálogos (config.dialogs.push({...}))
└── assets/          ← spritesheets (.png + .json), snd/, musica/
```

## Sprites que el motor espera encontrar

Estos frames deben existir en alguno de los spritesheets cargados, porque la
interfaz los usa por nombre:

| Frame | Uso |
|---|---|
| `osd_cursor_1.png`, `osd_cursor_2.png` | cursor normal y cursor sobre objeto |
| `osd_aro.png` | fondo de la rueda de verbos |
| iconos de cada verbo | los que declares en `base.verbs[].icons` (2 por verbo: normal y hover) |
| `inventario.png` | panel del inventario |
| `inventario_ico.png`, `inventario_ico_on.png` | botón del inventario |
| `libreta.png` | fondo de la libreta de notas |
| `null.png` | sprite transparente de 1×1, comodín para zonas clicables sin imagen |
| un frame por item del inventario | los que declares en `config.inventory[].images` |

El personaje principal necesita como mínimo las animaciones `stop`, `walk`,
`talk` (formato especial de lip-sync, ver GAMEDATA_FORMAT.md) y `pick`.

## Fuentes

Por defecto el motor usa las familias `normal-font` (interfaz) y `notepen`
(libreta), declaradas con `@font-face` en `index.html` y servidas desde
`m4engine/fonts/`. Puedes cambiarlas con `base.fontFamily`,
`base.notebookFontFamily` y `base.fonts` en tu `config.js`.
