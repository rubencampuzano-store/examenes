# Esquema de `minijuegos-datos.json`

`construir-minijuegos.mjs` lo valida y genera `<carpeta>/minijuegos/{carrera-v2,cronologia,parejas,clasifica}.html` (la carrera solo existe en 3D).
El tema visual, `meta` y algunos textos (`puntos`, `moneda`, `selloAcierto`, `selloFallo`, `silenciar`, `activarSonido`) se toman de `juego-datos.json`.
Todo el contenido sale de `apuntes.md` y va **en el idioma del material**. Ejemplo completo: `examen/revolucio-francesa/minijuegos-datos.json`.

## Estructura
```jsonc
{
  "textos": {                 // interfaz común (todas obligatorias)
    "jugar", "pausa", "continuar", "reiniciar", "record", "tambienTactil", "victoria", "finPartida", "guanyes",
    "nuevoRecord", "repetir", "volver", "vidas", "porta", "ai", "encerts", "errors", "objetos", "ronda", "temps",
    "pistaCronoTactil", "pistaCronoTeclado", "deixaAqui", "ratxa", "millorRatxa", "parelles", "moviments",
    "cartaTapada", "restants", "tempsEsgotat",
    "triaTactil", "triaTeclat", "rapidesa",  // carrera: indicación al pararse ante las puertas y nombre del bonus
    "musica", "silenciarMusica", "activarMusica",  // opcionales: crédito y botón de música
    "volverExamenes",  // opcional: botón para volver a la portada con todos los temas (barra superior y ventana final); sin él se usa "volver"
    "audio", "ambiente", "efectos", "detalleAmbiente", "detalleEfectos", "activat", "desactivat"  // opcionales: interruptores del menú de pausa
  },

  // Campos comunes a los 4 juegos:
  //   titulo, subtitulo, textoVictoria, (textoDerrota),
  //   instrucciones: { "tactil": [["icono o tecla", "texto"], ...], "teclado": [[...], ...] }
  //   premio: { "objetivo": puntos que dan el premio completo, "tope": lliures máximas (300 recomendado) }

  "carrera": {                // datos de la carrera 3D (carrera-v2.html). Correr por 3 carriles hacia un objetivo; en cada puerta el corredor SE DETIENE
                              // y no sigue hasta que se elige (1/2/3, tocar la puerta o el botón del panel).
                              // La pregunta solo aparece al pararse. Sin límite de tiempo; bonus de rapidez
                              // (+100 si responde en <= 2 s, baja hasta 0 a los 10 s). Fallo = -1 vida.
    "sonido": {                           // opcional (ver "Sonido" más abajo)
      "preset": "revolucion",             // revolucion | antiguedad | medieval | naturaleza | tecnologia
      "volumenMusica": 0.55,
      "musica": { "archivo": "audio/marsellesa.mp3", "titulo": "La Marseillaise", "interprete": "United States Navy Band",
                  "anio": "c. 1987", "licencia": "Domini públic", "fuente": "https://commons.wikimedia.org/wiki/File:La_Marseillaise.ogg" }
    },
    "escena": "paris-1789",               // opcional: paris-1789 (por defecto) | placa-base (bus de datos hasta la CPU)
    "objetivo": "la Bastilla",            // meta del recorrido (nombre del lugar)
    "sufijo3d": " 3D",                   // opcional: se añade al título (por defecto " 3D"; "" para no añadir nada)
    "textoLlegada": "…",                  // opcional, solo placa-base: rótulo que se enciende al llegar (por defecto "Instrucció executada!")
    "objeto": { "plural": "Escarapel·les" },
    "vidas": 3,
    "numPuertas": 8,                      // se eligen al azar de "puertas" en cada partida
    "puertas": [                          // >= numPuertas; mejor 10-12 para que varíe
      { "pregunta": "…", "opciones": ["…", "…", "…"], "correcta": 0 }  // 3 opciones (una por carril), <= 14 caracteres
    ]
  },

  "cronologia": {             // arrastrar hechos a su fecha
    "tiempoRonda": 45,
    "rondas": [               // 3-4 rondas, en orden cronológico
      { "titulo": "…", "eventos": [ { "texto": "…", "fecha": "14/7/1789", "orden": 1789.53 } ] }  // 4-6 eventos; fecha y orden únicos por ronda
    ]
  },

  "parejas": {                // memoria 4×4
    "etiquetaA": "Personatge", "etiquetaB": "Idea o obra",
    "parejas": [ { "a": "Montesquieu", "b": "Divisió de poders" } ]   // exactamente 8; textos <= 32 caracteres
  },

  "clasifica": {              // lanzar tarjetas a izquierda o derecha
    "tiempoRonda": 30,
    "rondas": [               // 3 rondas de 8 tarjetas, equilibradas entre los dos lados
      { "izquierda": "Privilegiats", "derecha": "Tercer Estat", "tarjetas": [ { "texto": "Noblesa", "lado": "izquierda" } ] }
    ]
  }
}
```

## Cómo adaptar a otros temas
- **carrera**: el "objetivo" es el lugar o meta del tema (p. ej. "Troia", "el cim"). Las preguntas de las puertas deben tener respuestas muy cortas (años, nombres, una palabra).
- **cronologia**: si el tema no es histórico, usa secuencias de un proceso (fases de la mitosis, pasos de un método) con `orden` 1, 2, 3… y `fecha` como etiqueta del paso.
- **parejas**: concepto ↔ definición, autor ↔ obra, término ↔ ejemplo.
- **clasifica**: dos categorías excluyentes por ronda (vertebrado/invertebrado, metal/no metal…).

## Carrera 3D (`carrera-v2.html`)
Única versión de la carrera, con Three.js (plantilla `minijuegos/carrera3d.html`). Usa la sección `carrera` de los datos. El archivo y el id se llaman `carrera-v2` para no romper enlaces ni récords guardados.
- Controles: ← → / A D o deslizar/tocar para cambiar de carril; en las puertas, 1/2/3, tocar la puerta 3D o los botones del panel.
- Escena generada por código (sin imágenes externas): calle de adoquines con casas del París de 1789, faroles colgados, luna y estrellas, corredor low-poly animado, barricadas con soldados del rey, escarapelas, puertas con carteles y, al final, la plaza con la Bastilla (bandera, multitud y fuegos artificiales).
- Three.js r159 incrustado desde `minijuegos/vendor/three.min.js` (licencia MIT en `vendor/THREE-LICENSE.txt`): funciona sin internet. Peso ≈ 1,4 MB con música.
- Rendimiento: resolución limitada y **calidad automática** (si baja de ~40 fps quita sombras y luego resolución). Sin WebGL muestra un aviso.
- La escena está pensada para la Revolución francesa (París nocturno y la Bastilla). Para otros temas, el texto `carrera.objetivo` se sigue mostrando, pero los edificios y la fortaleza son los mismos: adaptar la escena de `carrera3d.html` si el tema lo pide.
- Textos opcionales: `sinWebgl`, `sinWebglAyuda`.

## Sonido
Tres canales independientes: **música**, **ambiente** y **efectos** (este último comparte preferencia con el examen). En la cabecera hay botón de música y de efectos; en el **menú de pausa** hay un interruptor por cada canal que tenga el juego (los minijuegos sin `sonido` solo muestran Efectes). Cada preferencia se guarda en `localStorage` (`…:musica`, `…:ambiente`, `…:sonido`).
- **Música**: una grabación real de dominio público o CC0, incrustada. Suena en bucle; en `carrera` su tempo sigue la velocidad (0,9×–1,15×, sin cambiar el tono) y baja de volumen cuando el corredor se para ante las puertas.
  - Buscar en Wikimedia Commons (espacio de nombres File, `filetype:audio`). Buenas fuentes: bandas militares o de gobiernos (p. ej. U.S. Navy Band, U.S. Air Force Band: obras del Gobierno de EE. UU., dominio público) y grabaciones antiguas marcadas como dominio público.
  - Descargar y comprimir: `node "<ruta del skill>/audio.mjs" "File:Nombre.ogg" "<carpeta>/audio/nombre.mp3" 48` → MP3 mono 48 kbps (~6 KB por segundo). Rechaza licencias no libres. Necesita ffmpeg (`pip install --user imageio-ffmpeg`).
  - Completar a mano `interprete` y `anio`; `licencia` y `fuente` salen del `.credito.json` generado. El crédito se muestra en la intro y en el resultado.
- **Ambiente y efectos**: sintetizados por código según el `preset`:

| preset | Ambiente | Ocasional | Percusión / redoble | Fanfarria y trompeta |
|---|---|---|---|---|
| `revolucion` | multitud | campanas de alarma | caja militar | metal (dientes de sierra) |
| `antiguedad` | viento | — | tambor de marco | lira (triangular) |
| `medieval` | multitud | campanas | tabor | chirimía (cuadrada) |
| `naturaleza` | agua/hojas | pájaros | madera | campanillas (seno) |
| `tecnologia` | pulsos graves | — | electrónica | cuadrada |

- Momentos en `carrera`: pasos sobre adoquines, golpe de madera (barricada), tintineo (objeto), redoble mientras se elige, cañonazo + fanfarria (acierto), trompeta grave (fallo), aclamación + campanas (victoria), tambor lento (derrota).
- Los demás minijuegos pueden usar `MJ.sonido` y los mismos efectos (`MJ.sfx.*`) si se les añade `sonido` en sus datos.

## Resultado para la integración con el examen
Al terminar, cada minijuego:
- Guarda récord en `localStorage` (`juego-estudio:<meta.id>:minijuegos` → `{ <id>: { record, mejorLliures, partidas } }`).
- Calcula `lliures = round(tope × min(1, puntos / objetivo))` y 0-3 estrellas (30 %, 60 %, 90 % del objetivo).
- Envía `window.parent.postMessage({ tipo: 'minijuego', id, puntos, lliures, estrellas, victoria }, '*')` y lanza `CustomEvent('minijuego-fin')`.
- Si está dentro de un iframe muestra "Torna a l'examen", que envía `{ tipo: 'minijuego-cerrar', id }`.
- **Todavía no modifica el progreso del examen**: eso se hará al integrarlos.
