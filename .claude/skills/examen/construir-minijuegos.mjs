// Genera los minijuegos autocontenidos a partir de las plantillas de minijuegos/.
// Uso: node construir-minijuegos.mjs <juego-datos.json> <minijuegos-datos.json> <carpeta-salida>
// Toma meta, tema y algunos textos del examen (juego-datos.json) y el contenido de cada minijuego de minijuegos-datos.json.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , rutaExamen, rutaMini, salida] = process.argv;
if (!rutaExamen || !rutaMini || !salida) {
  console.error('Uso: node construir-minijuegos.mjs <juego-datos.json> <minijuegos-datos.json> <carpeta-salida>');
  process.exit(1);
}
const aqui = join(dirname(fileURLToPath(import.meta.url)), 'minijuegos');
const leerJSON = (r) => { try { return JSON.parse(readFileSync(r, 'utf8')); } catch (e) { console.error(`JSON no válido (${r}):`, e.message); process.exit(1); } };
const examen = leerJSON(rutaExamen);
const mini = leerJSON(rutaMini);
const css = readFileSync(join(aqui, 'comun.css'), 'utf8');
const js = readFileSync(join(aqui, 'comun.js'), 'utf8');

const errores = [], avisos = [];
const req = (c, m) => { if (!c) errores.push(m); };
// Minijuegos DOM que se montan desde su plantilla. La carrera (datos "carrera") solo existe en 3D: ver más abajo.
const JUEGOS = ['cronologia', 'clasifica'];

const TEXTOS = ['jugar', 'pausa', 'continuar', 'reiniciar', 'record', 'tambienTactil', 'victoria', 'finPartida', 'guanyes', 'nuevoRecord',
  'repetir', 'volver', 'vidas', 'porta', 'ai', 'encerts', 'errors', 'objetos', 'ronda', 'temps', 'pistaCronoTactil', 'pistaCronoTeclado',
  'deixaAqui', 'ratxa', 'restants', 'tempsEsgotat', 'triaTactil', 'triaTeclat', 'rapidesa'];
for (const k of TEXTOS) req(mini.textos && mini.textos[k] != null, `textos.${k} falta`);

function comunes(j, id) {
  req(j, `${id}: falta la sección`);
  if (!j) return false;
  req(j.titulo, `${id}.titulo falta`);
  const ins = j.instrucciones || {};
  for (const k of ['tactil', 'teclado']) req(Array.isArray(ins[k]) && ins[k].length && ins[k].every((x) => Array.isArray(x) && x.length === 2), `${id}.instrucciones.${k} debe ser una lista de [tecla, texto]`);
  req(j.premio && j.premio.objetivo > 0 && j.premio.tope > 0, `${id}.premio necesita objetivo y tope > 0`);
  return true;
}
// carrera
if (comunes(mini.carrera, 'carrera')) {
  const p = mini.carrera.puertas || [];
  req(p.length >= 3, 'carrera.puertas necesita al menos 3 preguntas');
  p.forEach((q, i) => {
    req(q.pregunta, `carrera.puertas[${i}].pregunta falta`);
    req(Array.isArray(q.opciones) && q.opciones.length === 3, `carrera.puertas[${i}] debe tener exactamente 3 opciones (una por carril)`);
    req(Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta <= 2, `carrera.puertas[${i}].correcta debe ser 0, 1 o 2`);
    (q.opciones || []).forEach((o) => req(String(o).length <= 14, `carrera.puertas[${i}]: la opción "${o}" supera 14 caracteres (no cabe en la puerta)`));
    if (q.opciones && new Set(q.opciones).size !== q.opciones.length) errores.push(`carrera.puertas[${i}] tiene opciones repetidas`);
  });
  const ESCENAS = ['paris-1789', 'placa-base'];  // escenarios que sabe dibujar carrera3d.html
  if (mini.carrera.escena != null && !ESCENAS.includes(mini.carrera.escena)) errores.push(`carrera.escena "${mini.carrera.escena}" no existe; valores posibles: ${ESCENAS.join(', ')}`);
}
// cronologia
if (comunes(mini.cronologia, 'cronologia')) {
  const r = mini.cronologia.rondas || [];
  req(r.length >= 1, 'cronologia.rondas vacío');
  r.forEach((ro, i) => {
    const ev = ro.eventos || [];
    req(ev.length >= 4 && ev.length <= 6, `cronologia.rondas[${i}] debe tener entre 4 y 6 eventos`);
    ev.forEach((e, k) => req(e.texto && e.fecha && typeof e.orden === 'number', `cronologia.rondas[${i}].eventos[${k}] necesita texto, fecha y orden numérico`));
    if (new Set(ev.map((e) => e.orden)).size !== ev.length) errores.push(`cronologia.rondas[${i}] tiene valores de orden repetidos`);
    if (new Set(ev.map((e) => e.fecha)).size !== ev.length) errores.push(`cronologia.rondas[${i}] tiene fechas repetidas (el jugador no podría distinguir los huecos)`);
  });
}
// clasifica
if (comunes(mini.clasifica, 'clasifica')) {
  const r = mini.clasifica.rondas || [];
  req(r.length >= 1, 'clasifica.rondas vacío');
  r.forEach((ro, i) => {
    req(ro.izquierda && ro.derecha, `clasifica.rondas[${i}] necesita izquierda y derecha`);
    const t = ro.tarjetas || [];
    req(t.length >= 4, `clasifica.rondas[${i}] necesita al menos 4 tarjetas`);
    t.forEach((c, k) => req(c.texto && (c.lado === 'izquierda' || c.lado === 'derecha'), `clasifica.rondas[${i}].tarjetas[${k}] necesita texto y lado (izquierda|derecha)`));
    if (!t.some((c) => c.lado === 'izquierda') || !t.some((c) => c.lado === 'derecha')) errores.push(`clasifica.rondas[${i}] debe tener tarjetas de los dos lados`);
  });
}
// ---------- Sonido: preset y música grabada (se incrusta como data URI) ----------
const PRESETS = ['revolucion', 'antiguedad', 'medieval', 'naturaleza', 'tecnologia'];
const MIME_AUDIO = { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.opus': 'audio/ogg' };
for (const id of ['carrera', ...JUEGOS]) {
  const so = mini[id] && mini[id].sonido;
  if (!so) continue;
  if (so.preset) req(PRESETS.includes(so.preset), `${id}.sonido.preset debe ser uno de: ${PRESETS.join(', ')}`);
  const m = so.musica;
  if (!m) continue;
  for (const k of ['archivo', 'titulo', 'interprete', 'licencia', 'fuente']) req(m[k], `${id}.sonido.musica.${k} falta (toda grabación necesita crédito completo)`);
  if (!m.archivo) continue;
  const ruta = join(dirname(rutaMini), m.archivo), ext = extname(ruta).toLowerCase();
  if (!existsSync(ruta)) { errores.push(`${id}.sonido.musica: no existe ${ruta}`); continue; }
  if (!MIME_AUDIO[ext]) { errores.push(`${id}.sonido.musica: formato no admitido (${ext}); usa .mp3`); continue; }
  if (ext !== '.mp3') avisos.push(`${id}.sonido.musica: ${ext} puede no sonar en todos los móviles; se recomienda .mp3`);
  m.src = `data:${MIME_AUDIO[ext]};base64,${readFileSync(ruta).toString('base64')}`;
  delete m.archivo;
}

if (errores.length) { console.error('ERRORES (' + errores.length + '):\n - ' + errores.join('\n - ')); process.exit(1); }

// ---------- Construcción ----------
const et = examen.textos || {};
const textos = Object.assign(
  { puntos: et.puntos, moneda: et.moneda, silenciar: et.silenciar, activarSonido: et.activarSonido, selloAcierto: et.selloAcierto, selloFallo: et.selloFallo },
  mini.textos,
);
const tema = Object.assign({}, examen.tema);
delete tema.imagenes; // las imágenes del examen no se usan aquí: ahorra peso
const escJSON = (o) => JSON.stringify(o).replace(/</g, '\\u003c').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
const escHTML = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

mkdirSync(salida, { recursive: true });
// Portada con todos los temas: la raíz del proyecto es la carpeta que contiene examen/ (salida = examen/<tema>/minijuegos)
let portada = null;
for (let d = resolve(salida), k = 0; k < 5; k++, d = dirname(d)) {
  if (existsSync(join(d, 'examen')) && existsSync(join(d, 'index.html'))) { portada = (relative(resolve(salida), d).replace(/\\/g, '/') || '.') + '/index.html'; break; }
}
if (!portada) avisos.push('no se encuentra la portada (index.html junto a la carpeta examen/): los minijuegos no tendrán botón para volver a ella');
for (const id of JUEGOS) {
  const plantilla = readFileSync(join(aqui, `${id}.html`), 'utf8');
  const datos = { meta: examen.meta, tema, textos, portada, juego: Object.assign({ id }, mini[id]) };
  for (const m of ['/*__COMUN_CSS__*/', '/*__COMUN_JS__*/', '/*__DATOS__*/null']) if (!plantilla.includes(m)) { console.error(`${id}.html no contiene ${m}`); process.exit(1); }
  const html = plantilla
    .replace('/*__COMUN_CSS__*/', () => css)
    .replace('/*__COMUN_JS__*/', () => js)
    .replace('/*__DATOS__*/null', () => escJSON(datos))
    .replace('<title>Minijuego</title>', () => `<title>${escHTML(mini[id].titulo)}</title>`);
  const ruta = join(salida, `${id}.html`);
  writeFileSync(ruta, html, 'utf8');
  const kb = Buffer.byteLength(html) / 1024;
  if (kb > 3072) avisos.push(`${id}.html pesa ${(kb / 1024).toFixed(2)} MB (límite recomendado 3 MB)`);
  console.log(`OK  ${ruta}  (${kb.toFixed(0)} KB)`);
}
// ---------- Carrera 3D (Three.js incrustado) ----------
// Datos de la sección "carrera". Archivo carrera.html, id "carrera".
const rutaV2 = join(aqui, 'carrera3d.html'), rutaThree = join(aqui, 'vendor', 'three.min.js');
if (mini.carrera && existsSync(rutaV2)) {
  if (!existsSync(rutaThree)) {
    errores.push('carrera no generada: falta minijuegos/vendor/three.min.js (three@0.159.0/build/three.min.js)');
  } else {
    // Se quita el aviso de "build obsoleta" que Three.js r159 muestra en la consola al cargarse
    const three = readFileSync(rutaThree, 'utf8').replace(/^console\.warn\('[^']*'\),/, '0,');
    const plantilla = readFileSync(rutaV2, 'utf8');
    const datos = { meta: examen.meta, tema, textos, portada, juego: Object.assign({}, mini.carrera, { id: 'carrera', titulo: mini.carrera.titulo + (mini.carrera.sufijo3d ?? ' 3D') }) };
    for (const m of ['/*__COMUN_CSS__*/', '/*__COMUN_JS__*/', '/*__DATOS__*/null', '/*__THREE__*/']) if (!plantilla.includes(m)) { console.error(`carrera3d.html no contiene ${m}`); process.exit(1); }
    const html = plantilla
      .replace('/*__COMUN_CSS__*/', () => css)
      .replace('/*__COMUN_JS__*/', () => js)
      .replace('/*__THREE__*/', () => three)
      .replace('/*__DATOS__*/null', () => escJSON(datos))
      .replace('<title>Minijuego</title>', () => `<title>${escHTML(datos.juego.titulo)}</title>`);
    const ruta = join(salida, 'carrera.html');
    writeFileSync(ruta, html, 'utf8');
    const kb = Buffer.byteLength(html) / 1024;
    if (kb > 3072) avisos.push(`carrera.html pesa ${(kb / 1024).toFixed(2)} MB (límite recomendado 3 MB)`);
    console.log(`OK  ${ruta}  (${kb.toFixed(0)} KB, 3D)`);
  }
}

if (errores.length) { console.error('ERRORES (' + errores.length + '):\n - ' + errores.join('\n - ')); process.exit(1); }
if (avisos.length) console.log('AVISOS:\n - ' + avisos.join('\n - '));
