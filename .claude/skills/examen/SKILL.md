---
name: examen
description: Convierte una carpeta con material de estudio (fotos de libro, apuntes escaneados, PDF) en apuntes a limpio jerarquizados (apuntes.md) y un juego de preguntas tipo test gamificado con la estética del tema (index.html). Usar cuando el usuario indique una carpeta de material para preparar un examen.
argument-hint: <ruta de la carpeta con el material>
---

# /examen — del material de estudio a un juego de preguntas

Carpeta de material: `$ARGUMENTS`

Si no se indica carpeta, pregunta cuál. Las rutas relativas se resuelven desde la raíz del proyecto.
**Organización del proyecto** (igual que el repo de GitHub): cada tema vive en `examen/<tema>/`, con el nombre en minúsculas, sin acentos y con guiones (p. ej. `examen/revolucio-francesa/`). Si el material está en otra carpeta, propón moverlo ahí antes de empezar.
**Entrada y salida**: el material se deja preferentemente en `examen/<tema>/material/` (el `.gitignore` excluye esa subcarpeta entera) y **todo lo generado va en la raíz del tema** `examen/<tema>/`, nunca dentro de `material/`. Si el usuario indica la carpeta `material/`, `<carpeta>` en los pasos siguientes es su carpeta padre. También se admite el material suelto en la raíz del tema (como en `revolucio-francesa/`). En la raíz hay un `index.html` de portada con todos los temas, generado por `construir-portada.mjs`.
Archivos de apoyo en la carpeta de este skill: `plantilla.html` (motor del juego), `esquema.md` (formato del JSON), `imagenes.mjs` (descarga imágenes libres de Commons), `construir.mjs` (valida, incrusta imágenes y monta el juego), `minijuegos/` + `construir-minijuegos.mjs` + `esquema-minijuegos.md` (4 minijuegos temáticos) y `audio.mjs` (música de dominio público para los minijuegos) y `construir-portada.mjs` (portada con todos los temas).
Antes del paso 6 carga la skill **`frontend-design`** para decidir la dirección visual del tema.

## Reglas de fidelidad (obligatorias)
- Todo el contenido sale **del material**. No añadas datos, fechas ni personajes que no aparezcan en él.
- Si algo no se lee bien, escribe `[ilegible]` o `[dudoso: ...]`; no lo completes de memoria.
- Las preguntas se generan solo a partir de `apuntes.md`.
- Todos los textos (apuntes, preguntas, interfaz del juego) van **en el idioma del material**.
- El jugador es un estudiante de ESO: tono cercano, divertido y nunca humillante.

## Paso 1 — Inventario
1. Lista los archivos del material (`<carpeta>/material/` si existe; si no, la propia carpeta) (imágenes `jpg/jpeg/png/heic/webp` y `pdf`). Ignora `apuntes.md`, `index.html`, `juego-datos.json`, `imagenes-lista.json`, `minijuegos-datos.json` y las subcarpetas `imagenes/` y `minijuegos/` de ejecuciones anteriores.
2. Ordénalos por nombre en orden natural (IMG_2 antes que IMG_10).
3. Si la numeración tiene huecos (p. ej. falta IMG_9832), **avisa al usuario y pregunta** si continuar o esperar a que añada el archivo.
4. Si ya existen `apuntes.md` / `index.html`, pregunta si sobrescribirlos.
5. Dile al usuario cuántos archivos vas a leer antes de empezar.

## Paso 2 — Lectura en orden
Lee cada archivo con la herramienta Read, **uno a uno y en orden**. Por cada página anota:
- Títulos y subtítulos con su nivel (tema, apartado, subapartado).
- Texto principal, recuadros de definición, fechas, personajes, pies de imagen relevantes, esquemas y mapas conceptuales.
- Ignora: numeración de página, marcas editoriales, iconos decorativos. Las actividades y ejercicios del libro no van a los apuntes (puedes usarlas como inspiración para preguntas si su respuesta está en el texto).
- Detecta el idioma del material en las primeras páginas.

## Paso 3 — `apuntes.md`
Escribe `<carpeta>/apuntes.md` con esta estructura:

```markdown
# <Título del tema>
> <Una o dos frases que resumen de qué va el tema>

## 1. <Apartado>
### <Subapartado>
- ⭐ **Clave:** idea que entra seguro en el examen
- Idea importante con **conceptos**, **fechas** y **personajes** en negrita
  - Detalle o ejemplo (un nivel de anidación como máximo)

> 🧠 **Recorda / Recuerda:** 3-5 puntos esenciales del apartado (en el idioma del material)

## Cronologia / Cronología
| Fecha | Hecho |

## Glossari / Glosario
| Concepto | Definición |
```

Jerarquía de importancia: `⭐ Clave` (lo imprescindible) > negrita (conceptos, fechas, personajes) > texto normal > detalle anidado.
Sé fiel al orden del libro. Condensa, pero no pierdas ningún concepto evaluable.
La cronología y el glosario solo si el material da suficientes datos.

## Paso 4 — Preguntas
- **Un nivel por cada apartado `##`** (sin contar Cronología ni Glosario), en el mismo orden.
- 8-10 preguntas por nivel: ~3 fáciles (recordar un dato), ~4 medias (relacionar, causa-efecto), ~3 difíciles (comparar, ordenar hechos, aplicar un concepto).
- 4 opciones por pregunta, 1 correcta. Distractores plausibles, del mismo tema y de longitud parecida a la correcta. Evita "todas las anteriores" / "ninguna".
- Reparte la posición de la correcta (0-3) entre las preguntas.
- Cada pregunta con `explicacion` (1-2 frases) y `fuente` (apartado de los apuntes).
- **Auto-revisión antes de seguir:** para cada pregunta, comprueba en `apuntes.md` que la respuesta correcta está respaldada y que ningún distractor también es correcto. Corrige o elimina las que fallen.

## Paso 5 — Imágenes libres de derechos
Las fotos del material **nunca** se usan en el juego (tienen copyright). Se usan obras de **dominio público o CC0 de Wikimedia Commons**:
1. Busca 1 imagen para la portada y 1 por nivel, relacionadas con cada apartado (cuadros, grabados, mapas, fotos históricas). Búsqueda por API (espacio de nombres File):
   `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=5&format=json&srsearch=<términos>`
   Commons limita las peticiones: haz pocas búsquedas y espaciadas. Si un tema no tiene obras adecuadas (p. ej. matemáticas), usa menos imágenes: el motor se ve bien solo con sus motivos SVG.
2. Escribe `<carpeta>/imagenes-lista.json`: `[{ "clave": "portada", "archivo": "File:…", "lado": 960 }, { "clave": "<id del nivel>", "archivo": "File:…", "lado": 500 }]`. La clave de cada nivel es su `id`.
3. Ejecuta `node "<ruta del skill>/imagenes.mjs" "<carpeta>/imagenes-lista.json" "<carpeta>/imagenes"`. Solo descarga imágenes con licencia libre y escribe `imagenes/creditos.json`. Sustituye las RECHAZADAS por otras.
4. Mira cada imagen descargada (Read) para confirmar que encaja con su apartado.
5. En el JSON, cada imagen lleva `titulo`, `autor` y `anio` **revisados a mano** (los de Commons traen ruido) y `licencia` y `fuente` copiados de `creditos.json`.
6. Presupuesto: `index.html` <= 3 MB (unas 11 imágenes: portada a 960 px y niveles a 500 px).

## Paso 6 — Estética del tema
Diseña una dirección visual propia del tema (época, lugar, disciplina) con `frontend-design`. El motor es una app oscura con tarjetas de "papel"; el tema decide:
- **Colores** (`tema.colores`) y **duotono** de las imágenes: elige colores sacados del mundo del tema, con los contrastes de `esquema.md`.
- **Tipografías**: una display con carácter ligada al tema (p. ej. una didona para la Francia de 1789), una de texto legible y una mono para cifras. Evita Inter, Roboto, Arial y Space Grotesk.
- **Motivo**: patrón (`guilloche`, `puntos`, `rejilla`, `ondas`, `circuito` para temas tecnológicos), texto del sello y monograma.
- **Metáfora de los puntos** (`textos.moneda`): una unidad propia del tema (lliures, dracmas, créditos, kilojulios…).
- **Textos ambientados**: 5 rangos (umbrales 0.10, 0.30, 0.50, 0.75, 0.95), 4 logros especiales, tampón de acierto/fallo y mensajes. **No uses emojis de banderas** (en Windows salen como letras).
- **Épocas** de cada nivel (`epoca`) si el tema es cronológico.
  Ejemplo (Revolución francesa): noche índigo + papel de *assignat*, guilloche, sellos "RF", didona Bodoni Moda, puntos en "lliures", cuadros de David y Delacroix en duotono índigo/papel; rangos Serf → Tercer Estat → Ciutadà → Revolucionari → Líder de la Revolució; tampón "Correcte/Incorrecte".

## Paso 7 — Montar el juego
1. Escribe `<carpeta>/juego-datos.json` siguiendo **exactamente** `esquema.md`. No incluyas el campo `apuntes`: lo añade el script.
2. Ejecuta (con comillas, las rutas pueden tener espacios y acentos):
   ```
   node "<ruta del skill>/construir.mjs" "<carpeta>/juego-datos.json" "<carpeta>/index.html" "<carpeta>/apuntes.md"
   ```
3. Si el script da ERRORES, corrige el JSON y vuelve a ejecutarlo. Revisa también los AVISOS (peso > 3 MB, niveles sin imagen).
4. Opcional: si el usuario quiere verlo en el móvil, ofrece publicarlo como artifact privado (pide confirmación antes).

## Paso 8 — Minijuegos
Tres minijuegos temáticos en archivos separados (de momento no están integrados en `index.html`). Controles pensados para ordenador, móvil y tablet.
1. Escribe `<carpeta>/minijuegos-datos.json` siguiendo **exactamente** `esquema-minijuegos.md`, con contenido sacado solo de `apuntes.md`:
   - `carrera`: 10-12 preguntas de respuesta muy corta (≤ 14 caracteres, 3 opciones), un "objetivo" propio del tema y la `escena` 3D más adecuada.
   - `cronologia`: 3-4 rondas de 5 hechos con su fecha (o pasos de un proceso si el tema no es histórico).
   - `clasifica`: 3 rondas de 8 tarjetas con dos categorías excluyentes.
   Títulos y textos ambientados en el tema (como en el Paso 6).
2. Ejecuta:
   ```
   node "<ruta del skill>/construir-minijuegos.mjs" "<carpeta>/juego-datos.json" "<carpeta>/minijuegos-datos.json" "<carpeta>/minijuegos"
   ```
3. Corrige los ERRORES y revisa los AVISOS (textos demasiado largos para móvil).
   La carrera se genera solo en 3D (`carrera.html`, con los datos de `carrera`); necesita `minijuegos/vendor/three.min.js`. El escenario se elige con `carrera.escena`: `paris-1789` (por defecto: calles de París y llegada a la Bastilla) o `placa-base` (bus de datos de una placa base hasta la CPU; temas de informática y tecnología). Si ninguna escena encaja con el tema, **pregunta al usuario** si quiere usar una de las existentes, adaptar `carrera3d.html` con una escena nueva (añadiéndola también a `ESCENAS` en `construir-minijuegos.mjs`) u omitir la sección `carrera`.
4. Sonido de `carrera` (ver "Sonido" en `esquema-minijuegos.md`): elige el `preset` más cercano al tema y, si hay una grabación adecuada de dominio público o CC0 en Wikimedia Commons, descárgala y comprímela con
   `node "<ruta del skill>/audio.mjs" "File:Nombre.ogg" "<carpeta>/audio/nombre.mp3" 48`
   y añádela en `carrera.sonido.musica` con su crédito completo. Si no hay ninguna adecuada, deja solo el `preset` (ambiente y efectos sintetizados).

## Paso 9 — Portada del proyecto
Regenera la portada de la raíz para que incluya el tema nuevo:
```
node "<ruta del skill>/construir-portada.mjs" "<raíz del proyecto>"
```
Las fotos del material **no se suben al repo** (el `.gitignore` las excluye por tener derechos de autor): no las muevas a `imagenes/` ni les cambies el nombre para esquivarlo.

## Paso 10 — Resumen al usuario
- Archivos leídos y si hubo páginas ilegibles o dudosas (cuáles).
- Imágenes usadas (autor, obra, licencia) y peso final de `index.html`.
- Apartados detectados y número de preguntas por nivel.
- Enlaces a `apuntes.md`, `index.html` y los 4 minijuegos de `minijuegos/` (se abren con doble clic en el navegador).
- Recuerda que conviene revisar los apuntes y una muestra de preguntas, porque las ha generado una IA.
