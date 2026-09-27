// Descarga una grabación de Wikimedia Commons SOLO si su licencia es libre (dominio público o CC0)
// y la recomprime a MP3 mono de baja tasa para incrustarla en un minijuego.
// Uso: node audio.mjs "<File:Nombre exacto.ogg>" <salida.mp3> [kbps=48] [segundos-máx]
// Requiere ffmpeg: variable de entorno FFMPEG, o el paquete de Python imageio-ffmpeg (pip install --user imageio-ffmpeg).
import { writeFileSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const [, , titulo, salida, kbpsArg, segArg] = process.argv;
if (!titulo || !salida) {
  console.error('Uso: node audio.mjs "<File:Nombre.ogg>" <salida.mp3> [kbps=48] [segundos-máx]');
  process.exit(1);
}
const KBPS = Number(kbpsArg) || 48;
const UA = 'ExamenSkill/1.0 (herramienta de estudio personal)';
const LIBRES = [/public domain/i, /^pd\b/i, /^pd-/i, /cc0/i, /no restrictions/i];
const limpiar = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function ffmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  for (const py of ['python', 'py', 'python3']) {
    try { return execFileSync(py, ['-c', 'import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())'], { encoding: 'utf8' }).trim(); } catch (e) {}
  }
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch (e) {}
  console.error('No se encuentra ffmpeg. Instala imageio-ffmpeg (pip install --user imageio-ffmpeg) o define FFMPEG.');
  process.exit(1);
}

// Sale con código en lugar de process.exit() para evitar un fallo de Node en Windows con conexiones abiertas
async function main() {
  const params = new URLSearchParams({ action: 'query', format: 'json', prop: 'imageinfo', titles: titulo, iiprop: 'url|extmetadata|size' });
  const r = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
  const pagina = Object.values((await r.json()).query.pages)[0];
  if (!pagina || pagina.missing !== undefined || !pagina.imageinfo) { console.error(`No existe "${titulo}" en Commons`); return 1; }
  const info = pagina.imageinfo[0], m = info.extmetadata || {};
  const licencia = limpiar(m.LicenseShortName && m.LicenseShortName.value);
  if (!LIBRES.some((re) => re.test(licencia))) { console.error(`RECHAZADA: licencia no libre ("${licencia || 'desconocida'}")`); return 2; }

  const orig = Buffer.from(await (await fetch(info.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  const tmp = join(tmpdir(), 'examen-audio-' + Date.now() + (info.url.match(/\.\w+$/) || ['.bin'])[0]);
  writeFileSync(tmp, orig);
  mkdirSync(dirname(salida), { recursive: true });
  const args = ['-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-ar', '22050', '-b:a', `${KBPS}k`];
  if (segArg) args.push('-t', String(Number(segArg)));
  args.push(salida);
  execFileSync(ffmpeg(), args, { stdio: 'inherit' });

  const credito = {
    titulo: limpiar(m.ObjectName && m.ObjectName.value) || titulo.replace(/^File:/, ''),
    autor: limpiar(m.Artist && m.Artist.value),
    licencia,
    fuente: info.descriptionurl,
    kbOriginal: Math.round(orig.length / 1024),
    kb: Math.round(statSync(salida).size / 1024),
  };
  writeFileSync(salida.replace(/\.mp3$/i, '') + '.credito.json', JSON.stringify(credito, null, 2), 'utf8');
  console.log(`OK  ${salida}  ${credito.kbOriginal} KB -> ${credito.kb} KB  (${licencia})`);
  console.log('Revisa y completa a mano el crédito (intérprete, año) en minijuegos-datos.json.');
  return 0;
}
process.exitCode = await main();
