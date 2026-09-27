// Descarga imágenes de Wikimedia Commons SOLO si su licencia es libre (dominio público o CC0)
// y guarda sus créditos.
// Uso: node imagenes.mjs <lista.json> <carpeta-salida> [ancho-px=500]
// lista.json: [{ "clave": "portada", "archivo": "File:Nombre exacto.jpg", "lado": 960 }, ...]
// Commons redondea el ancho a tamaños fijos (en pruebas: 500 y 960 px). Usa 960 para la portada y 500 para el resto.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , rutaLista, salida, ladoArg] = process.argv;
if (!rutaLista || !salida) {
  console.error('Uso: node imagenes.mjs <lista.json> <carpeta-salida> [lado-max-px]');
  process.exit(1);
}
const LADO = Number(ladoArg) || 500;
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'ExamenSkill/1.0 (herramienta de estudio personal; contacto local)';
const LIBRES = [/public domain/i, /^pd\b/i, /^pd-/i, /cc0/i, /no restrictions/i];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const limpiar = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function pedir(url, tipo = 'json', intentos = 5) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 429 || r.status >= 500) throw new Error('HTTP ' + r.status);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return tipo === 'json' ? await r.json() : Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (i === intentos) throw e;
      await esperar(2000 * i);
    }
  }
}

const lista = JSON.parse(readFileSync(rutaLista, 'utf8'));
mkdirSync(salida, { recursive: true });
const creditos = {};
const rechazadas = [];

for (const item of lista) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', prop: 'imageinfo', titles: item.archivo,
    iiprop: 'url|extmetadata|mime', iiurlwidth: String(item.lado || LADO),
  });
  let pagina;
  try {
    const datos = await pedir(`${API}?${params}`);
    pagina = Object.values(datos.query.pages)[0];
  } catch (e) {
    rechazadas.push(`${item.clave}: error de red (${e.message})`);
    continue;
  }
  if (!pagina || pagina.missing !== undefined || !pagina.imageinfo) {
    rechazadas.push(`${item.clave}: no existe "${item.archivo}"`);
    continue;
  }
  const info = pagina.imageinfo[0];
  const m = info.extmetadata || {};
  const licencia = limpiar(m.LicenseShortName && m.LicenseShortName.value);
  // Se decide solo por la licencia: Commons marca CC0 como "Copyrighted" aunque la obra sea de uso libre.
  if (!LIBRES.some((re) => re.test(licencia))) {
    rechazadas.push(`${item.clave}: licencia no libre ("${licencia || 'desconocida'}")`);
    continue;
  }
  const url = info.thumburl || info.url;
  const ext = (url.match(/\.(jpe?g|png|webp)(?:$|\?)/i) || [, 'jpg'])[1].toLowerCase().replace('jpeg', 'jpg');
  const nombre = `${item.clave}.${ext}`;
  try {
    const buf = await pedir(url, 'bin');
    writeFileSync(join(salida, nombre), buf);
    creditos[item.clave] = {
      archivo: nombre,
      titulo: limpiar(m.ObjectName && m.ObjectName.value) || pagina.title.replace(/^File:/, ''),
      autor: limpiar(m.Artist && m.Artist.value) || 'Desconegut',
      fecha: limpiar(m.DateTimeOriginal && m.DateTimeOriginal.value),
      licencia,
      fuente: info.descriptionurl,
      kb: Math.round(buf.length / 1024),
    };
    console.log(`OK  ${item.clave.padEnd(26)} ${String(creditos[item.clave].kb).padStart(4)} KB  ${licencia}`);
  } catch (e) {
    rechazadas.push(`${item.clave}: no se pudo descargar (${e.message})`);
  }
  await esperar(1200);
}

writeFileSync(join(salida, 'creditos.json'), JSON.stringify(creditos, null, 2), 'utf8');
const total = Object.values(creditos).reduce((s, c) => s + c.kb, 0);
console.log(`\nDescargadas: ${Object.keys(creditos).length} · Total: ${total} KB (en base64 ocuparán ~${Math.round(total * 1.34)} KB)`);
if (rechazadas.length) {
  console.log('RECHAZADAS:\n - ' + rechazadas.join('\n - '));
  process.exitCode = 2;
}
