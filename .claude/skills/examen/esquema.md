# Esquema del JSON de datos del juego

`construir.mjs` valida este formato, incrusta las imágenes como data URI y rechaza el archivo si falta algo obligatorio.
Todos los textos visibles van **en el idioma del material**. Ejemplo completo: `examen/revolucio-francesa/juego-datos.json`.

```jsonc
{
  "meta": {
    "id": "revolucio-francesa-t1",            // slug único: separa el progreso guardado de cada tema
    "titulo": "De serfs a ciutadans",          // obligatorio; también es el <title> de la página
    "tituloPartido": ["De serfs", "a ciutadans"], // opcional: 2ª parte en cursiva y color oro en la portada
    "eyebrow": "Tema 1 · 1700 — 1848",         // línea pequeña sobre el título (tema, época, asignatura)
    "subtitulo": "…",
    "intro": "Frase corta y motivadora, ambientada en el tema.",
    "idioma": "ca"
  },

  "tema": {
    "colores": {
      "fondo": "#0f1733",        // fondo de la app (oscuro). El texto claro va encima
      "superficie": "#efe3c6",   // "papel" de tarjetas, preguntas y apuntes
      "texto": "#1d1a16",        // texto sobre superficie (contraste >= 7:1)
      "textoSuave": "#5b5244",   // texto secundario sobre superficie (>= 4.5:1)
      "textoClaro": "#efe3c6",   // texto sobre fondo (>= 7:1)
      "acento": "#b3202a",       // botón principal, sellos, cifras destacadas. Texto 'superficie' encima >= 4.5:1
      "oro": "#c9a44c",          // estrellas, marcos, detalles sobre fondo oscuro
      "acierto": "#2f7d4a",
      "fallo": "#b3202a"
    },
    "fuentes": {                  // pilas CSS, SIEMPRE con fallback de sistema. Nada de Inter/Roboto/Arial/Space Grotesk
      "display": "'Bodoni Moda', Didot, Georgia, serif",   // títulos: con carácter y ligada a la época/disciplina
      "texto": "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif",
      "mono": "'DM Mono', ui-monospace, Consolas, monospace" // cifras, contadores, etiquetas
    },
    "googleFonts": "https://fonts.googleapis.com/css2?family=…&display=swap",
    "duotono": ["#0f1733", "#efe3c6"],   // [sombras, luces]: TODAS las imágenes se tiñen así para parecer una colección
    "motivo": {
      "patron": "guilloche",             // guilloche | puntos | rejilla | ondas | circuito (fondo y billete)
      "sello": "République Française",   // texto circular de los sellos de lacre
      "monograma": "RF"                  // 1-3 letras en el centro del sello
    },
    "numeracion": "romana",              // romana | arabe (numeración de niveles)
    "confeti": ["#1f3b7a", "#efe3c6", "#b3202a", "#c9a44c"],
    "imagenes": {
      "portada": {                       // imagen principal de la portada
        "archivo": "imagenes/portada.jpg",   // ruta relativa al JSON; se incrusta como data URI
        "titulo": "La presa de la Bastilla", // título legible, traducido y revisado a mano
        "autor": "Jean-Pierre Houël",
        "anio": "1789",
        "licencia": "Public domain",         // copiar de imagenes/creditos.json (lo declara Commons)
        "fuente": "https://commons.wikimedia.org/wiki/File:…"
      }
    }
  },

  "textos": {
    "inicio": "Inici", "niveles": "Nivells", "nivel": "Nivell", "logros": "Assoliments", "apuntes": "Apunts", "indice": "Índex",
    "jugar": "Comença la revolució", "continuar": "Continua la revolució",
    "moneda": "lliures",                 // opcional: nombre temático de los puntos (si falta se usa "puntos")
    "serie": "Nº",                       // opcional: prefijo del número de serie del billete
    "puntos": "punts", "preguntas": "preguntes", "estrellas": "estrelles", "nivelesSuperados": "nivells superats",
    "rangoActual": "Rang actual", "sinRango": "Súbdit sense rang", "siguienteRango": "Proper rang", "rangoMaximo": "…",
    "reiniciar": "Reinicia el progrés", "confirmarReinicio": "…",
    "bloqueado": "Supera el nivell anterior per desbloquejar-lo", "mejor": "millor", "ayudaMapa": "…",
    "dificultad": { "facil": "Fàcil", "media": "Mitjana", "dificil": "Difícil" },
    "salir": "Surt", "confirmarSalir": "Vols sortir? Perdràs aquesta partida.",
    "siguiente": "Següent", "verResultado": "Veure resultat",
    "selloAcierto": "Correcte", "selloFallo": "Incorrecte",   // texto del tampón que se estampa al responder
    "mensajesAcierto": ["…"], "mensajesFallo": ["…"],         // 3-6 frases ambientadas, nunca humillantes
    "laCorrectaEra": "La correcta era",
    "nivelPerfecto": "…", "nivelSuperado": "…", "nivelNoSuperado": "…", "aciertos": "encerts", "nuevoRecord": "Nou rècord!",
    "necesitas": "…", "desbloqueado": "Nou nivell desbloquejat", "nuevoRango": "Nou rang", "repetir": "Repeteix",
    "siguienteNivel": "Següent nivell", "repasa": "Repassa aquestes preguntes",
    "consigue": "Aconsegueix el", "delTotal": "de les lliures", "logroDesbloqueado": "Assoliment desbloquejat",
    "silenciar": "Silencia el so", "activarSonido": "Activa el so",
    "creditos": "Crèdits de les imatges", "textoCreditos": "…", "fuenteImagen": "Veure a Wikimedia Commons"
  },

  "rangos": [                             // 5 rangos, umbral = fracción de los puntos máximos, creciente
    { "nombre": "Serf", "icono": "🌾", "umbral": 0.10, "descripcion": "…" }
  ],

  "logrosEspeciales": {                   // incluye los cuatro
    "primerNivel": { "nombre": "…", "icono": "🏰", "descripcion": "Supera el teu primer nivell" },
    "perfecto":    { "nombre": "…", "icono": "✋", "descripcion": "Aconsegueix 3 estrelles en un nivell" },
    "todos":       { "nombre": "…", "icono": "📜", "descripcion": "Supera tots els nivells" },
    "maestro":     { "nombre": "…", "icono": "🏆", "descripcion": "3 estrelles a tots els nivells" }
  },

  "niveles": [                            // uno por apartado (##) de los apuntes, en el mismo orden
    {
      "id": "antic-regim",
      "titulo": "Com era l'Antic Règim?",
      "epoca": "Segle XVIII",             // opcional: etiqueta de la línea de tiempo (fechas, bloque, unidad)
      "resumen": "Una línea que resume el apartado",
      "imagen": { "archivo": "imagenes/antic-regim.jpg", "titulo": "…", "autor": "…", "anio": "…", "licencia": "…", "fuente": "…" },
      "preguntas": [                      // 8-10; mezcla de facil, media y dificil
        {
          "texto": "…",
          "opciones": ["…", "…", "…", "…"],  // exactamente 4, sin repetir
          "correcta": 2,                     // índice 0-3; varía la posición entre preguntas
          "dificultad": "facil",             // facil | media | dificil
          "explicacion": "1-2 frases sacadas de los apuntes.",
          "fuente": "1. L'Antic Règim > La societat estamental"
        }
      ]
    }
  ],

  "apuntes": "…"                          // NO lo escribas: construir.mjs lo rellena con apuntes.md (3er argumento)
}
```

## Reglas de los emojis
Solo en rangos y logros (centro de los sellos). **Nunca banderas** (🇫🇷, 🇪🇸...): en Windows salen como letras.

## Puntuación (fija en el motor)
- facil = 100, media = 150, dificil = 200.
- Nivel aprobado con >= 60 %. Estrellas: 1 >= 60 %, 2 >= 80 %, 3 = 100 %.
- Total = suma de la mejor puntuación de cada nivel (repetir no infla).

## Markdown admitido en Apuntes
`#` a `####` (los `##` forman el índice), **negrita**, *cursiva*, `código`, listas `-` / `1.` (un nivel de anidación), citas `>`, tablas y `---`.
