// Genera la portada del proyecto (index.html en la raíz) con una tarjeta por cada tema de examen/.
// Uso: node construir-portada.mjs [raíz-del-proyecto=.]
// Cada tema es una carpeta examen/<tema>/ con juego-datos.json e index.html. Si tiene minijuegos/, se enlazan.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.argv[2] || '.';
const dirTemas = join(raiz, 'examen');
if (!existsSync(dirTemas)) { console.error(`No existe ${dirTemas}`); process.exit(1); }

// Textos de la portada (cámbialos aquí si el proyecto pasa a otro idioma)
const TX = {
  idioma: 'ca',
  titulo: 'Examen',
  subtitulo: 'Jocs d\'estudi per preparar els exàmens: apunts, preguntes per nivells i minijocs.',
  jugar: 'Comença',
  minijocs: 'Minijocs',
  preguntes: 'preguntes',
  nivells: 'nivells',
  buit: 'Encara no hi ha cap tema.',
  peu: 'Imatges i música de domini públic (crèdits dins de cada joc).',
};
const NOMBRES_MINI = { carrera: 'Carrera', cronologia: 'Línia del temps', parejas: 'Parelles', clasifica: 'Classifica' };

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const temas = [];
for (const nombre of readdirSync(dirTemas).sort()) {
  const dir = join(dirTemas, nombre);
  if (!statSync(dir).isDirectory()) continue;
  const rutaDatos = join(dir, 'juego-datos.json');
  if (!existsSync(rutaDatos) || !existsSync(join(dir, 'index.html'))) { console.log(`AVISO: ${nombre} se omite (falta juego-datos.json o index.html)`); continue; }
  const d = JSON.parse(readFileSync(rutaDatos, 'utf8'));
  let minis = {};
  const rutaMini = join(dir, 'minijuegos-datos.json');
  if (existsSync(rutaMini)) {
    const m = JSON.parse(readFileSync(rutaMini, 'utf8'));
    for (const id of Object.keys(NOMBRES_MINI)) if (m[id] && existsSync(join(dir, 'minijuegos', `${id}.html`))) minis[id] = m[id].titulo || NOMBRES_MINI[id];
  }
  const por = d.tema && d.tema.imagenes && d.tema.imagenes.portada;
  temas.push({
    carpeta: nombre,
    titulo: d.meta.titulo,
    tituloPartido: d.meta.tituloPartido,
    eyebrow: d.meta.eyebrow || '',
    subtitulo: d.meta.subtitulo || '',
    idioma: d.meta.idioma || 'es',
    colores: (d.tema && d.tema.colores) || {},
    fuente: (d.tema && d.tema.fuentes && d.tema.fuentes.display) || null,
    imagen: por && por.archivo ? `examen/${nombre}/${por.archivo}` : null,
    creditoImagen: por ? `${por.titulo} · ${por.autor}` : '',
    niveles: (d.niveles || []).length,
    preguntas: (d.niveles || []).reduce((s, n) => s + (n.preguntas || []).length, 0),
    minis,
  });
}

const tarjeta = (t) => {
  const c = t.colores;
  const vars = `--t-fondo:${c.fondo || '#1b1f2a'};--t-papel:${c.superficie || '#f1ece2'};--t-tinta:${c.texto || '#1d1a16'};--t-acento:${c.acento || '#b3202a'};--t-oro:${c.oro || '#c9a44c'}`;
  const [a, b] = t.tituloPartido || [t.titulo, ''];
  return `<article class="tema" style="${esc(vars)}" lang="${esc(t.idioma)}">
    <a class="cubierta" href="examen/${esc(t.carpeta)}/index.html" aria-label="${esc(TX.jugar + ': ' + t.titulo)}">
      ${t.imagen ? `<img src="${esc(t.imagen)}" alt="" loading="lazy">` : ''}
      <span class="velo"></span>
      <span class="eyebrow">${esc(t.eyebrow)}</span>
      <h2 ${t.fuente ? `style="font-family:${esc(t.fuente)}"` : ''}>${esc(a)}${b ? `<i>${esc(b)}</i>` : ''}</h2>
    </a>
    <div class="cuerpo">
      <p>${esc(t.subtitulo)}</p>
      <p class="datos"><span>${t.niveles} ${esc(TX.nivells)}</span><span>${t.preguntas} ${esc(TX.preguntes)}</span></p>
      <div class="acciones">
        <a class="btn" href="examen/${esc(t.carpeta)}/index.html">${esc(TX.jugar)} →</a>
      </div>
      ${Object.keys(t.minis).length ? `<div class="minis"><span class="eyebrow">${esc(TX.minijocs)}</span><ul>${Object.entries(t.minis).map(([id, tit]) => `<li><a href="examen/${esc(t.carpeta)}/minijuegos/${id}.html">${esc(tit)}</a></li>`).join('')}</ul></div>` : ''}
      ${t.creditoImagen ? `<p class="credito">${esc(t.creditoImagen)}</p>` : ''}
    </div>
  </article>`;
};

const html = `<!doctype html>
<html lang="${TX.idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(TX.titulo)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,500..900;1,500..900&family=DM+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;600;700&display=swap">
<style>
  :root { color-scheme: dark; --fondo: #12141b; --fondo-2: #1b1e28; --texto: #ece6d8; --suave: #a9a295; --linea: rgba(236,230,216,.14); }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--fondo); color: var(--texto); font-family: "Hanken Grotesk", "Segoe UI", system-ui, sans-serif; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  .envoltorio { max-width: 1120px; margin: 0 auto; padding: 56px 16px 72px; }
  header { display: grid; gap: 12px; margin-bottom: 40px; max-width: 62ch; }
  header .eyebrow { color: var(--suave); }
  h1 { font-family: "Bodoni Moda", Didot, Georgia, serif; font-weight: 800; font-style: italic; font-size: clamp(3rem, 9vw, 5.5rem); line-height: .95; margin: 0; letter-spacing: -.02em; }
  header p { margin: 0; color: var(--suave); font-size: 1.1rem; }
  .eyebrow { font-family: "DM Mono", ui-monospace, monospace; font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; }
  .temas { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 24px; }
  .tema { display: grid; grid-template-rows: auto 1fr; border-radius: 8px; overflow: hidden; background: var(--t-papel); color: var(--t-tinta); box-shadow: 0 30px 60px -30px rgba(0,0,0,.8); }
  .cubierta { position: relative; display: grid; align-content: end; gap: 6px; min-height: 230px; padding: 20px; color: var(--t-papel); text-decoration: none; background: var(--t-fondo); overflow: hidden; }
  .cubierta img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); mix-blend-mode: luminosity; opacity: .55; transition: transform .6s ease, opacity .3s; }
  .cubierta:hover img { transform: scale(1.04); opacity: .7; }
  .velo { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 20%, var(--t-fondo) 100%); }
  .cubierta .eyebrow, .cubierta h2 { position: relative; }
  .cubierta .eyebrow { color: var(--t-oro); }
  .cubierta h2 { margin: 0; font-family: "Bodoni Moda", Georgia, serif; font-weight: 800; font-size: clamp(1.9rem, 5vw, 2.5rem); line-height: 1; text-wrap: balance; }
  .cubierta h2 i { display: block; font-weight: 500; color: var(--t-oro); }
  .cuerpo { display: grid; gap: 12px; align-content: start; padding: 20px; }
  .cuerpo p { margin: 0; }
  .datos { display: flex; gap: 16px; font-family: "DM Mono", ui-monospace, monospace; font-size: .85rem; font-variant-numeric: tabular-nums; opacity: .75; }
  .btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; background: var(--t-acento); color: var(--t-papel); font-weight: 700; text-decoration: none; }
  .btn:hover { filter: brightness(1.08); }
  .minis ul { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
  .minis a { display: inline-block; padding: 6px 12px; border: 1px solid color-mix(in srgb, var(--t-tinta) 25%, transparent); border-radius: 999px; color: inherit; text-decoration: none; font-size: .9rem; }
  .minis a:hover { border-color: var(--t-acento); }
  .minis .eyebrow { opacity: .65; }
  .credito { font-size: .75rem; opacity: .6; font-style: italic; }
  a:focus-visible { outline: 2px solid var(--t-oro, #c9a44c); outline-offset: 3px; }
  footer { margin-top: 48px; color: var(--suave); font-size: .82rem; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<div class="envoltorio">
  <header>
    <span class="eyebrow">${temas.length} ${temas.length === 1 ? 'tema' : 'temes'}</span>
    <h1>${esc(TX.titulo)}</h1>
    <p>${esc(TX.subtitulo)}</p>
  </header>
  <main class="temas">
    ${temas.length ? temas.map(tarjeta).join('\n') : `<p>${esc(TX.buit)}</p>`}
  </main>
  <footer>${esc(TX.peu)}</footer>
</div>
</body>
</html>
`;
writeFileSync(join(raiz, 'index.html'), html, 'utf8');
console.log(`OK: ${join(raiz, 'index.html')} (${temas.length} tema${temas.length === 1 ? '' : 's'}: ${temas.map((t) => t.carpeta).join(', ')})`);
