// Valida el JSON de datos y genera index.html a partir de plantilla.html.
// Uso: node construir.mjs <datos.json> <salida.html> [apuntes.md]
// Si se pasa apuntes.md, su contenido sustituye al campo "apuntes" del JSON.
// Las imágenes ("archivo", ruta relativa al JSON) se incrustan como data URI: el HTML no depende de otros archivos.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , rutaDatos, rutaSalida, rutaApuntes] = process.argv;
if (!rutaDatos || !rutaSalida) {
  console.error('Uso: node construir.mjs <datos.json> <salida.html> [apuntes.md]');
  process.exit(1);
}

const aqui = dirname(fileURLToPath(import.meta.url));
const plantilla = readFileSync(join(aqui, 'plantilla.html'), 'utf8');

let datos;
try {
  datos = JSON.parse(readFileSync(rutaDatos, 'utf8'));
} catch (e) {
  console.error('JSON no válido:', e.message);
  process.exit(1);
}
if (rutaApuntes) datos.apuntes = readFileSync(rutaApuntes, 'utf8');

// ---------- Validación ----------
const errores = [];
const avisos = [];
const req = (cond, msg) => { if (!cond) errores.push(msg); };

req(datos.meta && datos.meta.titulo, 'meta.titulo es obligatorio');
req(datos.textos, 'textos es obligatorio');
req(Array.isArray(datos.rangos) && datos.rangos.length >= 1, 'rangos debe ser una lista no vacía');
req(Array.isArray(datos.niveles) && datos.niveles.length >= 1, 'niveles debe ser una lista no vacía');

const TEXTOS = ['inicio', 'jugar', 'continuar', 'niveles', 'nivel', 'logros', 'apuntes', 'indice', 'puntos', 'preguntas', 'estrellas',
  'nivelesSuperados', 'rangoActual', 'sinRango', 'siguienteRango', 'rangoMaximo', 'reiniciar', 'confirmarReinicio',
  'bloqueado', 'mejor', 'ayudaMapa', 'dificultad', 'salir', 'confirmarSalir', 'siguiente',
  'verResultado', 'mensajesAcierto', 'mensajesFallo', 'selloAcierto', 'selloFallo', 'laCorrectaEra', 'nivelPerfecto', 'nivelSuperado',
  'nivelNoSuperado', 'aciertos', 'nuevoRecord', 'necesitas', 'desbloqueado', 'nuevoRango', 'repetir',
  'siguienteNivel', 'repasa', 'consigue', 'delTotal', 'logroDesbloqueado', 'silenciar', 'activarSonido',
  'creditos', 'textoCreditos', 'fuenteImagen'];
if (datos.textos) {
  for (const k of TEXTOS) req(datos.textos[k] != null, `textos.${k} falta`);
  const d = datos.textos.dificultad || {};
  req(d.facil && d.media && d.dificil, 'textos.dificultad necesita facil, media y dificil');
  req(Array.isArray(datos.textos.mensajesAcierto) && datos.textos.mensajesAcierto.length, 'textos.mensajesAcierto debe ser una lista');
  req(Array.isArray(datos.textos.mensajesFallo) && datos.textos.mensajesFallo.length, 'textos.mensajesFallo debe ser una lista');
}

if (Array.isArray(datos.rangos)) {
  let previo = -1;
  datos.rangos.forEach((r, i) => {
    req(r.nombre && r.icono, `rangos[${i}] necesita nombre e icono`);
    req(typeof r.umbral === 'number' && r.umbral > 0 && r.umbral <= 1, `rangos[${i}].umbral debe estar entre 0 y 1`);
    req(r.umbral > previo, `rangos[${i}].umbral debe ser mayor que el anterior`);
    previo = r.umbral;
  });
}

const ids = new Set();
const DIF = ['facil', 'media', 'dificil'];
if (Array.isArray(datos.niveles)) {
  datos.niveles.forEach((n, i) => {
    const donde = `niveles[${i}]`;
    req(n.id && n.titulo, `${donde} necesita id y titulo`);
    req(!ids.has(n.id), `${donde}.id "${n.id}" está repetido`);
    ids.add(n.id);
    req(Array.isArray(n.preguntas) && n.preguntas.length > 0, `${donde}.preguntas está vacío`);
    if (!Array.isArray(n.preguntas)) return;
    if (n.preguntas.length < 8 || n.preguntas.length > 10) avisos.push(`${donde} tiene ${n.preguntas.length} preguntas (recomendado 8-10)`);
    const vistas = new Set();
    n.preguntas.forEach((p, j) => {
      const q = `${donde}.preguntas[${j}]`;
      req(p.texto, `${q}.texto falta`);
      req(Array.isArray(p.opciones) && p.opciones.length === 4, `${q} debe tener exactamente 4 opciones`);
      req(Number.isInteger(p.correcta) && p.correcta >= 0 && p.correcta < (p.opciones || []).length, `${q}.correcta fuera de rango`);
      req(DIF.includes(p.dificultad), `${q}.dificultad debe ser facil, media o dificil`);
      req(p.explicacion, `${q}.explicacion falta`);
      if (Array.isArray(p.opciones) && new Set(p.opciones.map((o) => String(o).trim().toLowerCase())).size !== p.opciones.length) {
        errores.push(`${q} tiene opciones repetidas`);
      }
      if (vistas.has(p.texto)) avisos.push(`${q} repite el enunciado de otra pregunta del nivel`);
      vistas.add(p.texto);
    });
    const cuenta = Object.fromEntries(DIF.map((d) => [d, n.preguntas.filter((p) => p.dificultad === d).length]));
    if (!cuenta.facil || !cuenta.media || !cuenta.dificil) avisos.push(`${donde} no tiene preguntas de las tres dificultades (${JSON.stringify(cuenta)})`);
  });
}

// ---------- Imágenes ----------
const base = dirname(rutaDatos);
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
let pesoImg = 0;
function incrustar(im, donde) {
  if (!im) return;
  for (const k of ['archivo', 'titulo', 'autor', 'licencia', 'fuente']) req(im[k], `${donde}.${k} falta (toda imagen necesita crédito completo)`);
  if (!im.archivo) return;
  const ruta = join(base, im.archivo);
  const mime = MIME[extname(ruta).toLowerCase()];
  if (!existsSync(ruta)) { errores.push(`${donde}: no existe ${ruta}`); return; }
  if (!mime) { errores.push(`${donde}: formato no admitido (${ruta})`); return; }
  const buf = readFileSync(ruta);
  pesoImg += buf.length;
  im.src = `data:${mime};base64,${buf.toString('base64')}`;
  delete im.archivo;
}
if (datos.tema && datos.tema.imagenes) incrustar(datos.tema.imagenes.portada, 'tema.imagenes.portada');
else avisos.push('Sin imagen de portada: la portada se verá solo con tipografía');
(datos.niveles || []).forEach((n, i) => { if (n.imagen) incrustar(n.imagen, `niveles[${i}].imagen`); else avisos.push(`niveles[${i}] sin imagen`); });

if (errores.length) {
  console.error('ERRORES (' + errores.length + '):\n - ' + errores.join('\n - '));
  process.exit(1);
}

// ---------- Construcción ----------
const json = JSON.stringify(datos)
  .replace(/</g, '\\u003c')
  .split(String.fromCharCode(0x2028)).join('\\u2028')
  .split(String.fromCharCode(0x2029)).join('\\u2029');
const MARCA = '/*__DATOS__*/null';
if (!plantilla.includes(MARCA)) {
  console.error('La plantilla no contiene el marcador ' + MARCA);
  process.exit(1);
}
const titulo = String(datos.meta.titulo).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const html = plantilla
  .replace(MARCA, () => json)
  .replace('<title>Juego de estudio</title>', () => `<title>${titulo}</title>`);
writeFileSync(rutaSalida, html, 'utf8');

const totalPreg = datos.niveles.reduce((s, n) => s + n.preguntas.length, 0);
const mb = Buffer.byteLength(html, 'utf8') / 1048576;
if (mb > 3) avisos.push(`index.html pesa ${mb.toFixed(2)} MB (límite recomendado 3 MB): usa imágenes más pequeñas o menos imágenes`);
console.log(`OK: ${rutaSalida} (${mb.toFixed(2)} MB, imágenes ${(pesoImg / 1024).toFixed(0)} KB)`);
console.log(`Niveles: ${datos.niveles.length} · Preguntas: ${totalPreg} · Rangos: ${datos.rangos.length}`);
datos.niveles.forEach((n, i) => console.log(`  ${i + 1}. ${n.titulo} (${n.preguntas.length})`));
if (avisos.length) console.log('AVISOS:\n - ' + avisos.join('\n - '));
