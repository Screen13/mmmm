# Documentacion del formato de datos del juego (gamedata)

Documentacion completa del formato JSON utilizado para definir **escenas** y **dialogos** en el motor M4Engine.

---

## INDICE

- [Escenas (Scenes)](#escenas-scenes)
  - [Estructura raiz de una escena](#estructura-raiz-de-una-escena)
  - [enters (puntos de entrada)](#enters-puntos-de-entrada)
  - [exits (puertas/salidas)](#exits-puertassalidas)
  - [areas (zonas transitables)](#areas-zonas-transitables)
  - [items (objetos interactivos)](#items-objetos-interactivos)
  - [characters (personajes NPC)](#characters-personajes-npc)
  - [animations (animaciones)](#animations-animaciones)
  - [actions (acciones de un item/personaje)](#actions-acciones-de-un-itempersonaje)
  - [Acciones declarativas (action/params)](#acciones-declarativas-actionparams)
  - [click_action (accion directa al hacer click)](#click_action-accion-directa-al-hacer-click)
  - [before() y everyupdate()](#before-y-everyupdate)
- [Dialogos (Dialogs)](#dialogos-dialogs)
  - [Estructura raiz de un dialogo](#estructura-raiz-de-un-dialogo)
  - [lines (lineas del dialogo)](#lines-lineas-del-dialogo)
  - [say (lineas habladas)](#say-lineas-habladas)
  - [options (opciones del jugador)](#options-opciones-del-jugador)
  - [Condicionales (if)](#condicionales-if)
  - [Flujo con goto](#flujo-con-goto)
  - [actions en dialogos](#actions-en-dialogos)
- [Funciones del motor accesibles desde codigo](#funciones-del-motor-accesibles-desde-codigo)
  - [Personaje principal](#personaje-principal)
  - [Otros personajes](#otros-personajes)
  - [Escena](#escena)
  - [Items/Objetos](#itemsobjetos)
  - [Inventario](#inventario)
  - [Libreta (Notebook)](#libreta-notebook)
  - [Interfaz (OSD)](#interfaz-osd)
  - [Cursor](#cursor)
  - [Sonido](#sonido)
  - [Camara](#camara)
  - [Cola de acciones (LActions)](#cola-de-acciones-lactions)
  - [Utilidades globales](#utilidades-globales)
  - [Transiciones](#transiciones)
  - [Variables de juego](#variables-de-juego)

---

# Escenas (Scenes)

## Estructura raiz de una escena

```javascript
config.scenes.push({
    "id":               "Nombre_Escena",          // String. Identificador unico
    "img":              "fondo_principal.png",     // String|null. Imagen de la capa principal
    "imgBack":          ["fondo_lejano.png"],      // Array<String>. Capas de fondo (parallax trasero)
    "imgFront":         ["primer_plano.png"],      // Array<String>. Capas delanteras (parallax frontal)
    "imgSpeed":         [0.6, 0.8, 1, 1.2],       // Array<Number>. Velocidad parallax por capa
    "enters":           [],                        // Array<Enter>. Puntos de entrada
    "exits":            [],                        // Array<Exit>. Puertas/salidas
    "areas":            [],                        // Array<Array<Number>>. Poligonos transitables
    "items":            [],                        // Array<Item>. Objetos interactivos
    "characters":       [],                        // Array<Character>. Personajes NPC
    "escape_target":    "Otra_Escena",             // String|false|undefined. Escena al pulsar ESC
    "escape_target_door": 0,                       // Number. Indice de entrada en la escena destino
    "noOptionsMenu":    true,                      // Boolean (opcional). Si es true, ESC no abre el menu de opciones
    before:             function(vieneDeGosub){},  // Function. Se ejecuta al cargar la escena
    everyupdate:        function(){}               // Function. Se ejecuta cada frame
});
```

### Notas sobre capas y parallax

Las capas se organizan en este orden: `imgBack[0]`, `imgBack[1]`, ..., `img`, `imgFront[0]`, `imgFront[1]`, ...

El array `imgSpeed` asigna una velocidad de scroll a cada capa. Velocidad `1` es la capa principal. Valores menores (ej: `0.6`) se mueven mas lento (fondo lejano). Valores mayores (ej: `1.2`) se mueven mas rapido (primer plano).

---

## enters (puntos de entrada)

Definen donde aparece el personaje al entrar en la escena. Se referencian por indice (0, 1, 2...).

```javascript
"enters": [
    {
        "inix": 700,    // Number. Posicion X inicial del personaje
        "iniy": 347,    // Number. Posicion Y inicial
        "endx": 500,    // Number. Posicion X destino (camina hasta aqui)
        "endy": 347     // Number. Posicion Y destino
    }
]
```

**Valores especiales:**
- Si `iniy < -1000`, el personaje queda oculto (no visible en la escena).
- Si `inix == endx` e `iniy == endy`, el personaje no camina al entrar.

---

## exits (puertas/salidas)

Definen zonas clicables que transportan a otra escena.

```javascript
"exits": [
    {
        "id":           "puerta_tienda",             // String. Identificador unico
        "name":         __("Puerta", "m4"),          // String. Nombre visible (localizado)
        "x":            500,                         // Number. Posicion X
        "y":            200,                         // Number. Posicion Y
        "z":            0,                           // Number. Capa (-3 a +3 respecto a la principal)
        "width":        100,                         // Number. Ancho del area clicable
        "height":       200,                         // Number. Alto del area clicable
        "goto":         "Interior_Tienda",           // String. ID de la escena destino
        "gotoEnter":    0,                           // Number. Indice del enter en la escena destino
        "cursorImage":  "osd_cursor_arriba.png",     // String (opcional). Cursor personalizado
        "images":       ["null.png"],                // Array<String> (opcional). Frames de animacion
        "loop":         false                        // Boolean (opcional). Si la animacion hace loop
    }
]
```

**Valores especiales de `gotoEnter`:**
- Valores `>= 1000`: El personaje llega en un vehiculo (accion `gotoDoorInmediate`). El enter real es `gotoEnter - 1000`. La salida debe definir ademas:

```javascript
"vehicle": "mini_coche",       // id del item de la escena que se desliza hasta la salida
"vehicleSound": "snd_coche"    // (opcional) sonido al arrancar
```

---

## areas (zonas transitables)

Definen poligonos dentro de los cuales el personaje puede caminar. Los puntos se definen como pares de coordenadas X,Y en un array plano.

```javascript
"areas": [
    [
        50, 347,      // Punto 1 (x, y)
        750, 347,     // Punto 2
        750, 400,     // Punto 3
        50, 400       // Punto 4
    ]
]
```

Se pueden definir multiples poligonos. Un array vacio `[]` significa que no hay zona transitable.

---

## items (objetos interactivos)

```javascript
"items": [
    {
        // --- Identificacion ---
        "id":           "obj_lampara",               // String. Identificador unico
        "name":         __("Lampara", "m4"),          // String. Nombre visible (localizado)

        // --- Posicion y tamano ---
        "x":            300,                         // Number. Posicion X
        "y":            200,                         // Number. Posicion Y
        "z":            0,                           // Number. Capa (-3 a +3)
        "width":        50,                          // Number (opcional). Ancho clicable
        "height":       60,                          // Number (opcional). Alto clicable

        // --- Visual ---
        "images":       ["lampara.png"],             // Array<String>. Frames del sprite
        "loop":         false,                       // Boolean. Si la animacion hace loop
        "interactive":  true,                        // Boolean. Si se puede clicar

        // --- Texto (alternativa a imagenes) ---
        "textcontent":  "Texto a mostrar",           // String (opcional). Texto en vez de imagen
        "textformat":   {                            // Object (opcional). Estilo del texto
            font: '11px normal-font',
            fill: 0x888888,
            stroke: 0x000000,
            strokeThickness: 1,
            align: 'center',
            padding: 2,
            lineHeight: 12
        },

        // --- Animaciones ---
        "animations":   {                            // Object (opcional). Ver seccion Animations
            "stop": [0],
            "anim1": [1, 2, 3, 4]
        },

        // --- Cursor ---
        "cursorImage":  "osd_cursor_2.png",          // String (opcional). Cursor al pasar por encima

        // --- Interacciones ---
        "actions":      {},                          // Object. Ver seccion Actions
        "click_action": function() {}                // Function (opcional). Ver seccion click_action
    }
]
```

---

## characters (personajes NPC)

```javascript
"characters": [
    {
        "id":           "dependiente",               // String. Identificador unico
        "name":         "Dependiente",               // String. Nombre del personaje
        "color":        "#8a8371",                   // String. Color del texto de dialogo (hex)
        "x":            500,                         // Number. Posicion X
        "y":            345,                         // Number. Posicion Y
        "z":            0,                           // Number (opcional). Capa

        "images": [                                  // Array<String>. Frames del sprite
            "dep_stop.png",
            "dep_walk_1.png", "dep_walk_2.png",
            "dep_talk_1.png", "dep_talk_2.png"
        ],

        "animations": {                              // Object. Animaciones con nombre
            "stop": [0],
            "walk": [1, 2, 3, 4, 5, 6],
            "talk": [[7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18]]
            //        ^ bocas cerradas/abiertas para lip-sync
        },

        "actions": {                                 // Object. Ver seccion Actions
            "hablar": [
                { "action": "dialog", "params": "hablar_con_dependiente" }
            ],
            "mirar": [
                { "action": "say", "params": "Es el dependiente." }
            ]
        }
    }
]
```

### Campos opcionales de un personaje

Cualquier personaje (incluido el protagonista en `config.characters`) admite:

```javascript
"speedH": 1,                       // velocidad horizontal propia (por defecto config.base.speedH)
"speedV": 2,                       // velocidad vertical propia
"footsteps": {                     // sonidos de pasos propios (por defecto config.base.footsteps)
    "frames": [1, 4],              // posiciones del ciclo de andar que suenan
    "sounds": ["snd_p1","snd_p2"]
},
"animationSounds": {               // sonido al lanzar una animacion con doAnimation
    "escribe": "snd_escribe"
},
"attachments": [                   // sprites pegados al personaje
    { "id":"bigote", "images":["obj_bigote.png"], "x":-8, "y":-130, "visible":false }
],                                 // accesibles como personaje.attachments.bigote y personaje.bigote
onUpdate: function(ch){},          // hook llamado cada frame (logica visual del juego)
beforeSay: function(ch,text,naction){} // hook llamado al empezar a hablar
```

### Formato especial de `talk` en animations

La animacion `talk` tiene un formato diferente al resto. Es un array de dos sub-arrays:
- `talk[0]`: Frames "neutros" o de boca cerrada (indices que se usan para silencios, comas, espacios).
- `talk[1]`: Array de 8 frames correspondientes a diferentes posiciones de boca para lip-sync (el mapa letra->boca es `config.base.lipsync`, configurable por juego/idioma; este es el de por defecto):
  - `[0]` = silencio (`.`, `,`, ` `)
  - `[1]` = vocal "a"
  - `[2]` = vocales "o", "u"
  - `[3]` = vocales "e", "i"
  - `[4]` = consonantes t, s, c, g, k, r, y, z, d, j, x, q, w
  - `[5]` = consonantes l, n, n
  - `[6]` = consonantes m, b, p
  - `[7]` = consonantes f, v

---

## animations (animaciones)

Formato comun para items y characters:

```javascript
"animations": {
    "nombre_animacion": [0, 1, 2, 3, 4],   // Array<Number>. Indices de frames
    "stop":  [0],                            // Parado (obligatorio para characters)
    "walk":  [1, 2, 3, 4, 5, 6],            // Caminar (obligatorio para characters)
    "talk":  [[cerradas], [bocas]],          // Hablar (obligatorio para characters, formato especial)
    "pick":  [7, 8, 9, 10],                 // Coger objeto (opcional)
    "custom": [11, 12, 13]                   // Cualquier nombre personalizado
}
```

Los numeros son indices del array `images`. La animacion se reproduce en secuencia a la velocidad definida por `animationSpeed` (por defecto 0.1).

---

## actions (acciones de un item/personaje)

El objeto `actions` mapea verbos a listas de acciones. Los verbos estandar son: `"mirar"`, `"coger"`, `"hablar"`.

```javascript
"actions": {
    "mirar": [                                  // Al examinar el objeto
        { "action": "say", "params": "Es una lampara vieja." }
    ],
    "coger": [                                  // Al intentar coger el objeto
        { "action": "say", "params": "No puedo coger eso." }
    ],
    "hablar": [                                 // Al intentar hablar con el objeto
        { "action": "dialog", "params": "id_dialogo" }
    ],
    "useAt": {                                  // Al usar un item del inventario SOBRE este objeto
        "llave": [                              // Clave = ID del item del inventario
            { "action": "say", "params": "La llave encaja!" },
            { "action": "removeInventory", "params": "llave" }
        ],
        "otro_item": [
            { "action": "say", "params": "Eso no funciona." }
        ]
    }
}
```

Si un verbo no esta definido, el motor muestra un texto por defecto (`getVerb(verb).defaultText`).

Si `useAt` no tiene una entrada para el item que se esta usando, muestra un texto generico.

---

## Acciones declarativas (action/params)

Cada accion se define con un objeto `{ action, params, if }`. Se procesan en orden secuencial.

### Tabla completa de acciones

| action | params | Descripcion |
|--------|--------|-------------|
| `say` | `"Texto"` | El protagonista dice el texto. Mira hacia el objeto. |
| `otherSay` | `"Texto"` | El NPC objetivo dice el texto. |
| `dialog` | `"id_dialogo"` | Camina hacia el objeto, mira, e inicia el dialogo. |
| `dialogNoGoto` | `"id_dialogo"` | Inicia el dialogo sin caminar. |
| `gotoNdialog` | `"x,y,id_dialogo"` | Camina a coordenadas (x,y), mira al objeto, inicia dialogo. |
| `pick` | `"id_item_inventario"` | Camina al objeto, animacion de coger, lo elimina de la escena y lo anade al inventario. |
| `walkToObject` | (sin params) | Camina cerca del objeto actual. |
| `lookObject` | `"id_item"` | Gira el personaje hacia el objeto indicado. |
| `walk` | `"id_personaje,x,y"` | Hace caminar a un personaje a las coordenadas. |
| `goto` | `"id_escena"` | Cambia a otra escena. |
| `gotosub` | `"id_escena,accion"` | Cambia de escena guardando la posicion actual para poder volver con `core.gosubReturn()`. |
| `sound` | `"id_sonido"` | Reproduce un efecto de sonido. |
| `animation` | `"id_personaje,nombre_anim"` | Reproduce una animacion una vez. |
| `animation` | `"id_personaje,nombre_anim,loop"` | Con 3 parametros, reproduce la animacion en bucle. |
| `objAnimation` | `"id_item,nombre_anim"` | Reproduce animacion de un item una vez. |
| `objAnimation` | `"id_item,nombre_anim,loop"` | Con 3 parametros, animacion de item en bucle. |
| `addInventory` | `"id_item"` | Anade un item al inventario (sin animacion de coger). |
| `removeInventory` | `"id_item"` | Elimina un item del inventario. |
| `closeInventory` | `""` | Cierra el panel de inventario. |
| `combine` | `["item1", "item2", "resultado"]` | Elimina item1 e item2 del inventario, anade resultado. **Nota: params es un Array, no un String.** |
| `setVar` | `"nombre_variable,valor"` | Establece `gameVars[nombre] = valor`. El valor se parsea con JSON: `"x,1"` guarda el numero 1 y `"x,true"` el booleano true; si no parsea, se guarda como texto. |
| `hideObject` | `"id_item"` | Oculta un item de la escena (invisible + no interactivo). |
| `showObject` | `"id_item"` | Muestra un item oculto (visible + interactivo). |
| `showObjectNoInteractive` | `"id_item"` | Muestra un item pero sin hacerlo clicable. |
| `moveObject` | `"id_item,x,y"` | Mueve un item a nuevas coordenadas. |
| `osdOff` | `""` | Oculta toda la interfaz (cursor, inventario, etc). |
| `osdOn` | `""` | Muestra la interfaz. |
| `showNotebook` | (sin params) | Abre la libreta de notas. |
| `escribe` | `"texto"` | Anade texto a la libreta. |

### Acciones propias de cada juego (customActions)

Un juego puede definir acciones nuevas (o sobreescribir las del motor) sin tocar
`m4engine`, registrandolas en `config.customActions` (normalmente desde su
`extensions.js`):

```javascript
config.customActions = {
    "miAccion": function(params, thing){
        //thing es el item/personaje sobre el que se ejecuto el verbo (puede ser undefined)
        core.lactions.add(function(naction){
            core.character.say("params era: "+params, naction);
        });
    }
};
```

Y en cualquier escena/dialogo: `{ "action": "miAccion", "params": "lo que sea" }`.

Declara estas funciones en el `extensions.js` de tu gamedata
(ver `docs/gamedata_template/extensions.js` para un ejemplo).

### Condicional `if` en acciones

Cualquier accion puede llevar un campo `"if"` para ejecutarla condicionalmente:

```javascript
{
    "if":     "nombre_variable,valor_esperado",
    "action": "say",
    "params": "Esto solo se dice si la variable tiene el valor esperado."
}
```

La condicion evalua `gameVars[nombre_variable] == JSON.parse(valor_esperado)`. Si no se cumple, la accion se omite. Las demas acciones de la lista siguen ejecutandose.

### Acciones especiales del sistema (no declarativas)

Ademas de los verbos del jugador, el motor procesa internamente estas acciones:

| Accion interna | Cuando se ejecuta |
|----------------|-------------------|
| `gotoDoor` | Al clicar una salida (exit). Camina a la puerta y cambia de escena. |
| `gotoDoorInmediate` | Al clicar una salida con `gotoEnter >= 1000`. Desliza el mini_coche y cambia de escena. |
| `useAt` | Al usar un item del inventario sobre un objeto/personaje. Busca la clave en `actions.useAt`. |

---

## click_action (accion directa al hacer click)

Si un item tiene `click_action`, al hacer clic se ejecuta directamente esta funcion **en lugar de** mostrar la rueda de verbos. Se usa para items con comportamiento especial.

```javascript
"click_action": function() {
    gameVars.puerta_abierta = true;
    core.loadScene(getScene('Otra_Escena'), 1);
}
```

---

## before() y everyupdate()

### before(vieneDeGosub)

Se ejecuta **una sola vez** al cargar la escena. Recibe `vieneDeGosub` (boolean) que indica si se llego mediante `gotosub`/`gosubReturn`.

Usos tipicos:
- Reproducir musica
- Ocultar/mostrar items segun el estado del juego
- Ejecutar cutscenes con `core.lactions`
- Configurar la interfaz

```javascript
before: function(vieneDeGosub) {
    core.m4sound.stopAllSounds();
    core.m4sound.playSound('musica_tienda', true);

    if (gameVars.puerta_rota) {
        getItem("puerta").visible = false;
        getItem("puerta").interactive = false;
    }

    if (!vieneDeGosub) {
        core.lactions.stop();
        core.lactions.add("core.character.say('Aqui estoy de nuevo.', naction)");
        core.lactions.play();
    }
}
```

### everyupdate()

Se ejecuta **cada frame** mientras la escena esta activa. Se usa para logica continua.

`coreVars.sceneTime` es un contador que se incrementa cada frame desde que se cargo la escena.

```javascript
everyupdate: function() {
    // Logica temporal
    if (coreVars.sceneTime == 100) {
        fadeIn();
    }

    // Mover objetos continuamente
    getItem("nube").x += 0.5;
    if (getItem("nube").x > 1000) {
        getItem("nube").x = -200;
    }

    // Reaccionar a variables de estado
    if (gameVars.alarma_activada) {
        getItem("luz_roja").visible = !getItem("luz_roja").visible;
    }
}
```

---

# Dialogos (Dialogs)

## Estructura raiz de un dialogo

```javascript
config.dialogs.push({
    "id":    "hablar_con_dependiente",   // String. Identificador unico
    "name":  "Dependiente",              // String. Nombre descriptivo
    "lines": []                          // Array<Line>. Lineas del dialogo
});
```

Se pueden definir multiples dialogos en un mismo archivo `.js`.

---

## lines (lineas del dialogo)

Cada linea tiene un `id` numerico y puede contener texto hablado (`say`), opciones (`options`), un destino (`goto`) y acciones (`actions`).

```javascript
"lines": [
    {
        "id": 0,                             // Number. Identificador de la linea
        "say": [/* ... */],                  // Array<SayLine>. Texto hablado (opcional)
        "options": [/* ... */],              // Array<Option>. Opciones del jugador (opcional)
        "goto": 1,                           // Number. Siguiente linea (-1 = fin)
        "onlyonce": true,                    // Boolean (opcional). Solo se reproduce una vez
        "actions": function() { }            // Function (opcional). Codigo a ejecutar
    }
]
```

Una linea tiene `say` **o** `options`, no ambos.

---

## say (lineas habladas)

```javascript
"say": [
    {
        "character": "Protagonista",         // String. ID del personaje que habla
        "text": __("Hola, que tal?", "m4"),  // String. Texto (localizado con __())
        "if": "variable,valor"               // String (opcional). Condicion
    },
    {
        "character": "dependiente",
        "text": __("Bienvenido a la tienda.", "m4")
    }
]
```

Las lineas de `say` se reproducen en secuencia. El personaje indicado muestra el texto en un bocadillo con lip-sync automatico.

---

## options (opciones del jugador)

```javascript
"options": [
    {
        "text": __("Que tienes a la venta?", "m4"),   // String. Texto de la opcion
        "goto": 2,                                     // Number. Linea destino al elegir
        "if": "variable,valor"                         // String (opcional). Solo visible si se cumple
    },
    {
        "text": __("Adios.", "m4"),
        "goto": -1                                     // -1 = finalizar dialogo
    }
]
```

**Opcion terminadora oculta:** Una opcion con `"text": ""` y `"goto": -1` cierra el dialogo sin mostrar opciones al jugador.

```javascript
"options": [{ "text": "", "goto": -1 }]
```

---

## Condicionales (if)

El campo `"if"` se puede usar tanto en lineas de `say` como en `options`:

```javascript
"if": "nombre_variable,valor_esperado"
```

Evalua: `gameVars[nombre_variable] == JSON.parse(valor_esperado)`

- En **say**: si no se cumple, esa linea no se dice (se salta).
- En **options**: si no se cumple, esa opcion no se muestra al jugador.

Ejemplos:
```javascript
"if": "tiene_llave,1"          // gameVars.tiene_llave == 1
"if": "puerta_abierta,true"    // gameVars.puerta_abierta == true
"if": "estado_quest,0"         // gameVars.estado_quest == 0
```

---

## Flujo con goto

El campo `"goto"` controla la navegacion entre lineas:

- `"goto": N` (N >= 0) — salta a la linea con `"id": N`.
- `"goto": -1` — finaliza el dialogo, restaura el estado de la interfaz.

El flujo tipico es:
1. Empieza en linea `id: 0`.
2. Se reproducen las lineas `say` en secuencia.
3. Se ejecuta `actions()` si existe.
4. Se salta a la linea indicada por `goto`.
5. Si la nueva linea tiene `options`, se muestran al jugador.
6. Al elegir, se salta al `goto` de la opcion elegida.
7. Se repite hasta llegar a `goto: -1`.

---

## actions en dialogos

La propiedad `actions` de una linea es una funcion JavaScript que se ejecuta cuando se llega a esa linea (despues de reproducir el `say`, antes de seguir el `goto`).

```javascript
{
    "id": 3,
    "say": [
        { "character": "Protagonista", "text": __("Toma, aqui tienes.", "m4") }
    ],
    "goto": -1,
    actions: function() {
        gameVars.objeto_entregado = true;

        core.lactions.stop();
        core.lactions.add("core.osd.inventoryPanel.out('objeto', naction)");
        core.lactions.add("getCharacter('dependiente').say('" +
            __("Muchas gracias!", "m4") + "', naction)");
        core.lactions.add("getCharacter('dependiente').hideme(naction)");
        core.lactions.play();
    }
}
```

### Ejemplo completo de dialogo

```javascript
config.dialogs.push({
    "id": "hablar_con_vecina",
    "name": "Vecina",
    "lines": [
        {
            "id": 0,
            "say": [
                { "character": "Protagonista", "text": __("Buenos dias.", "m4") },
                { "character": "vecina", "text": __("Hola, detective.", "m4") }
            ],
            "goto": 1
        },
        {
            "id": 1,
            "options": [
                {
                    "text": __("Ha visto algo sospechoso?", "m4"),
                    "goto": 2
                },
                {
                    "text": __("Conoce al senor Lopez?", "m4"),
                    "goto": 3,
                    "if": "conoce_lopez,1"
                },
                {
                    "text": __("Adios.", "m4"),
                    "goto": -1
                }
            ]
        },
        {
            "id": 2,
            "say": [
                { "character": "vecina", "text": __("Vi a alguien merodeando anoche.", "m4") }
            ],
            "goto": 1,
            actions: function() {
                gameVars.pista_vecina = 1;
            }
        },
        {
            "id": 3,
            "say": [
                { "character": "vecina", "text": __("Si, vive en el piso de arriba.", "m4") }
            ],
            "goto": 1
        }
    ]
});
```

---

# Funciones del motor accesibles desde codigo

Estas funciones se pueden llamar desde `before()`, `everyupdate()`, `click_action`, y las `actions` de dialogos. Tambien se pueden usar como strings en `core.lactions.add()`.

> **Nota sobre `naction`:** Cuando una funcion se ejecuta dentro de la cola de acciones (`lactions`), el parametro `naction` es proporcionado automaticamente por el motor. Es necesario para que la cola sepa cuando una accion ha terminado y puede pasar a la siguiente.

---

## Personaje principal

```javascript
core.character.walkTo(x, y, naction)
// Camina a las coordenadas (x, y). Se gira automaticamente.

core.character.lookAt("id_item_o_personaje", naction)
// Gira el personaje hacia el objeto o personaje indicado.

core.character.say("Texto a decir", naction)
// Muestra un bocadillo con lip-sync. Bloquea hasta que termina.

core.character.pick("id_item", naction)
// Reproduce la animacion de coger un objeto.

core.character.doAnimation("nombre_anim", naction)
// Reproduce una animacion personalizada una vez.

core.character.doAnimationLoop("nombre_anim", naction)
// Reproduce una animacion en bucle (no bloquea la cola).

core.character.hideme(naction)
// Oculta el personaje (visible=false, interactive=false).

core.character.stop()
// Detiene toda animacion y vuelve a "stop". Oculta bocadillo.
```

---

## Otros personajes

```javascript
getCharacter("id_personaje").say("Texto", naction)
getCharacter("id_personaje").walkTo(x, y, naction)
getCharacter("id_personaje").walk2To(x, y, naction)    // Animacion alternativa
getCharacter("id_personaje").lookAt("id_otro", naction)
getCharacter("id_personaje").doAnimation("anim", naction)
getCharacter("id_personaje").doAnimationLoop("anim", naction)
getCharacter("id_personaje").hideme(naction)
getCharacter("id_personaje").stop()
getCharacter("id_personaje").gotoAndPlayAnimation("nombre", loop)
// loop: true/false
```

---

## Escena

```javascript
core.scene.addItem(item, x, y, layer, naction)
// Anade un item a la escena dinamicamente.

core.scene.removeItem("id_item", naction)
// Elimina un item de la escena completamente.

core.scene.hideItem("id_item", naction)
// Oculta un item (visible=false, interactive=false).

core.scene.showItem("id_item", naction)
// Muestra un item oculto (visible=true, interactive=true).

core.scene.showItemNoInteractive("id_item", naction)
// Muestra un item pero sin hacerlo clicable.

core.scene.moveItem("id_item", x, y, naction)
// Mueve un item a nuevas coordenadas.

core.scene.loff()
// Desactiva la interactividad de todos los items y personajes.

core.scene.lon()
// Reactiva la interactividad de todos los items y personajes.

core.scene.stopTalking(inmediato)
// Detiene el bocadillo del personaje que este hablando.
// inmediato: true para cortar sin esperar el tiempo minimo.
```

---

## Items/Objetos

```javascript
getItem("id_item").visible = true/false
getItem("id_item").interactive = true/false
getItem("id_item").x = 100
getItem("id_item").y = 200
getItem("id_item").setPosition(x, y)
getItem("id_item").hide()                    // visible=false, alpha=0
getItem("id_item").show()                    // visible=true, alpha=1
getItem("id_item").fadeIn()                  // Aparicion gradual
getItem("id_item").fadeOut()                 // Desaparicion gradual
getItem("id_item").slideTo(x, y, naction)    // Desliza el item hasta (x,y)
getItem("id_item").doAnimation("anim", naction)
getItem("id_item").doAnimationLoop("anim", naction)
getItem("id_item").gotoAndPlayAnimation("nombre", loop)
getItem("id_item").textobj.text = "nuevo texto"   // Para items con textcontent
```

---

## Inventario

```javascript
core.osd.inventoryPanel.in("id_item", naction)
// Anade un item al inventario. Reproduce sonido y parpadeo del icono.

core.osd.inventoryPanel.out("id_item", naction)
// Elimina un item del inventario.

core.osd.inventoryPanel.show()
// Abre el panel de inventario.

core.osd.inventoryPanel.hide()
// Cierra el panel de inventario.

core.osd.inventoryPanel.has("id_item")
// Devuelve true si el jugador tiene el item.

core.osd.inventoryPanel.pick("id_item")
// Mueve el item al cursor (status=2).

core.osd.inventoryPanel.let("id_item")
// Devuelve el item del cursor al inventario (status=1).
```

**Estados de un item de inventario:**
- `0` = no lo tienes
- `1` = lo tienes
- `2` = lo tienes en el cursor

---

## Libreta (Notebook)

```javascript
core.osd.notebookPanel.in("Texto a anotar", naction)
// Anade texto a la libreta. El texto se acumula.

core.osd.notebookPanel.show()
// Abre la libreta.

core.osd.notebookPanel.hide()
// Cierra la libreta.
```

**Formato del texto:**
- `|` = salto de parrafo (doble salto de linea)
- `##` al final de una linea = forzar salto de pagina

---

## Interfaz (OSD)

```javascript
core.osd.show(naction)
// Muestra toda la interfaz (cursor, inventario, texto inferior).

core.osd.hide(naction)
// Oculta toda la interfaz. Desactiva interaccion.

core.osd.enable()
// Activa la interaccion con la interfaz.

core.osd.disable()
// Desactiva la interaccion (no oculta visualmente).

core.osd.closeInventory(naction)
// Cierra el contenedor del inventario pero mantiene el boton visible.

core.osd.nameItem("texto")
// Muestra texto en la barra inferior (nombre del item).

core.osd.cleanItem()
// Limpia el texto de la barra inferior.

core.osd.showActionsPanel(x, y)
// Muestra la rueda de verbos en la posicion indicada.

core.osd.hideActionsPanel()
// Oculta la rueda de verbos.

core.osd.showOptionsPanel()
// Muestra el menu de opciones (pausa).

core.osd.hideOptionsPanel()
// Oculta el menu de opciones.
```

---

## Cursor

```javascript
core.osd.cursor.addItem(item)
// Adjunta un item al cursor (para usar sobre otro objeto).

core.osd.cursor.removeItem(naction)
// Retira el item del cursor.

core.osd.cursor.lon(cursorImage)
// Activa cursor especial (imagen personalizada).

core.osd.cursor.loff()
// Vuelve al cursor normal.

core.osd.cursor.visible = true/false
```

---

## Sonido

```javascript
core.m4sound.playSound("id_sonido", loop, volume, naction)
// Reproduce un sonido. loop: true/false.

core.m4sound.stopAllSounds()
// Detiene todos los sonidos en reproduccion.
```

---

## Camara

```javascript
core.camera.follow("nombre_personaje")
// La camara sigue a un personaje.

core.camera.noFollow()
// La camara deja de seguir.

core.camera.setPos(x, y, inmediato)
// Mueve la camara a una posicion. inmediato: true para salto instantaneo.
```

---

## Cola de acciones (LActions)

Sistema para encadenar acciones que se ejecutan en secuencia, una por frame.

```javascript
core.lactions.stop()
// Limpia la cola y ejecuta el callback si existe.

core.lactions.add(function(naction){ ... })
// Anade una accion a la cola (formato recomendado). El texto puede llevar
// comillas y apostrofes sin problema:
//   core.lactions.add(function(naction){ core.character.say("It's fine", naction); });

core.lactions.add("funcion_como_string")
// Formato antiguo: se ejecuta con eval() y 'naction' es inyectado
// automaticamente. Se mantiene por compatibilidad. Ojo con los apostrofes
// dentro de los textos.

core.lactions.play(callback)
// Comienza la ejecucion secuencial de la cola.
// callback (opcional): funcion a ejecutar cuando la cola termina.

core.lactions.isLast()
// Devuelve true si se esta ejecutando la ultima accion.

core.lactions.clear()
// Limpia la cola sin ejecutar callback.
```

### Ejemplo de uso

```javascript
core.lactions.stop();
core.lactions.add(function(naction){ core.character.walkTo(300, 347, naction); });
core.lactions.add(function(naction){ core.character.say("He llegado!", naction); });
core.lactions.add(function(naction){ core.osd.inventoryPanel.in("llave", naction); });
core.lactions.play(function() {
    // Se ejecuta cuando toda la cola ha terminado
    gameVars.mision_completada = true;
});
```

---

## Utilidades globales

```javascript
getItem("id")              // Busca un item en la escena actual por ID
getCharacter("id")         // Busca un personaje en la escena actual por ID
getItemInventory("id")     // Busca un item en el inventario por ID
getDoor("id")              // Busca una salida/puerta por ID (alias: getExit)
getScene("id")             // Busca una escena en config.scenes por ID
getDialog("id")            // Crea una instancia de Dialog y la devuelve
getVerb("nombre")          // Busca la config de un verbo por nombre

setVar("nombre", valor, naction)
// Establece gameVars[nombre] = valor.

multiline(texto, longitud)
// Inserta saltos de linea cada 'longitud' caracteres (word-wrap).

clone(objeto)
// Copia profunda de un objeto.

shouldSkip("variable,valor")    // (alias antiguo: testExp)
// Devuelve true si gameVars[variable] != valor (logica invertida: true = saltar).

cursorIn("id_item")
// Devuelve true si el cursor esta sobre el item indicado.
```

---

## Transiciones

```javascript
fadeIn(inmediato, callback)
// Transicion de negro a visible.
// inmediato: true para cambio instantaneo (sin transicion).
// callback: funcion a ejecutar al terminar.

fadeOut(inmediato, callback)
// Transicion de visible a negro.
// inmediato: true para cambio instantaneo.
// callback: funcion a ejecutar al terminar.
```

---

## Variables de juego

```javascript
gameVars                    // Objeto global con todas las variables de estado del juego
gameVars.nombre = valor     // Establecer directamente

coreVars.sceneTime          // Number. Contador de frames de la escena actual
coreVars.totalTime          // Number. Contador global de frames
coreVars.onDialog           // Boolean. Si hay un dialogo activo
coreVars.drawdebug          // Boolean. Si el modo debug esta activo
```

---

## Carga de escenas y gosub

```javascript
core.loadScene(getScene("id_escena"), gotoEnter)
// Cambia a otra escena. gotoEnter: indice del enter (por defecto 0).

core.gosubReturn()
// Vuelve a la escena guardada por gotosub, restaurando la posicion del personaje.
```

El sistema `gotosub` guarda en `coreVars`:
- `gosubScene`: ID de la escena de origen
- `gosubPosition`: `{x, y, scale}` del personaje
- `gosubAction`: parametro extra (opcional)

---

## Save/Load

```javascript
core.saveGame(slot)         // Guarda en localStorage (slot 0-13)
core.loadGame(slot)         // Carga desde localStorage
```

El save guarda: escena actual, posicion del personaje, estado de todos los items (`gameVars`), y estado del inventario.

---

# Configuracion del motor (config.base)

El motor tiene valores por defecto para casi todo (ver `applyConfigDefaults()` en
`m4engine/Core.js`); el `config.js` de cada juego solo define lo que cambia y lo
obligatorio (`assets`, `snd`, `verbs`, `initScene`, `folder`, `name`).

Opciones destacables:

```javascript
"width": 640, "height": 360,        // resolucion logica
"pixelPerfect": true,               // redondear posiciones (pixel art)
"speedH": 3, "speedV": 3,           // velocidad de paso por defecto
"footsteps": {                      // sonidos de pasos globales (null = sin pasos)
    "frames": [1, 4],
    "sounds": ["snd_paso1","snd_paso2"]
},
"inventorySound": "snd_mete",       // sonido al recibir un item (null = silencio)
"fontFamily": "normal-font",        // fuente de la interfaz
"notebookFontFamily": "notepen",    // fuente de la libreta
"fonts": ["normal-font","notepen"], // fuentes a esperar antes de arrancar
"lipsync": { "a":1, "o":2, ... },   // mapa letra -> posicion de boca (por idioma)
"verbRadius": 28                    // radio de la rueda de verbos
```

Cada verbo de `base.verbs` define:

```javascript
{
    "name": "coger",
    "isPickup": true,                                  // en el inventario, pone el item en el cursor
    "icons": ["osd_ico_mano_1.png","osd_ico_mano_2.png"], // icono normal y hover en la rueda
    "defaultText": "No puedo coger eso.",              // respuesta si el item no define el verbo
    "useAtText": "No parece buena idea.",              // "usar X con Y" sin respuesta definida (#item# = nombre del item)
    "useAtCharText": "No quiero dárselo."              // idem sobre un personaje
}
```

---

# Montar un juego nuevo

1. Copia `gamedata_template/` como tu carpeta de gamedata (su README detalla los
   sprites que el motor espera: cursores, inventario, libreta, iconos de verbos...).
2. `index.html` no lista escenas: carga `gamedata/manifest.js` y de ahi saca la
   lista de scripts. Añadir una escena = crear el fichero + una linea en el manifest.
3. El codigo especifico del juego (acciones nuevas, attachments y hooks del
   protagonista, helpers) vive en `extensions.js`, no en el motor.
4. Para depurar: `?scene=Nombre_Escena` en la URL arranca en esa escena, y
   `docs/ia/smoke_test.js` (node) carga motor+gamedata sin navegador y valida que
   todas las referencias (escenas, dialogos, acciones) existan.

---

# Menu inicial e idiomas

```javascript
"menuAtStart": true,        // arranca mostrando el menu sobre negro (GUARDAR y
                            // CONTINUAR salen velados); NUEVO JUEGO empieza la
                            // partida y CARGAR recupera un slot
"languages": ["es","en"],   // idiomas validos; el primero es el de por defecto
```

- El selector de idioma del menu de opciones se genera solo a partir de
  `languages`: basta con anadir el codigo aqui y un fichero `lang/<codigo>.js`
  al manifest (mismas claves que los demas; ver `gamedata/lang/en.js` como
  referencia, y `docs/ia/check_lang.js <codigo>` para validar que no falta ni
  sobra ninguna clave). Los nombres mostrados (Espanol, English, Francais,
  Deutsch, Italiano...) estan en `langNames` dentro de `m4engine/Options.js`.
- El idioma elegido se guarda en localStorage y persiste entre sesiones.
- Cambiar el idioma recarga el juego automaticamente: al instante desde el menu
  inicial, con confirmacion si hay partida en marcha (se pierde el progreso no
  guardado).
- "NUEVO JUEGO" restaura el estado inicial real (gameVars, inventario y libreta)
  via `core.newGame()`; ya no se usa el antiguo slot 13.
- Con `?scene=Nombre` en la URL se salta el menu inicial (depuracion).
