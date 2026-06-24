config.dialogs.push({
    "id": "hablar_con_ejemplo",
    "name": "Ejemplo",
    "lines": [
        {
            "id": 0,
            "say": [
                { "character": "Prota", "text": __("Hola.","m4") },
                { "character": "vecino", "text": __("Buenas. ¿Qué quieres?","m4") }
            ],
            "goto": 1
        },
        {
            "id": 1,
            "options": [
                { "text": __("¿Quién eres?","m4"), "goto": 2 },
                { "text": __("Adiós.","m4"), "goto": -1 }
            ]
        },
        {
            "id": 2,
            "say": [
                { "character": "vecino", "text": __("El vecino de ejemplo.","m4") }
            ],
            "goto": 1,
            actions: function(){
                gameVars.ejemplo_saludado=1;
            }
        }
    ]
});
