"""Favicon e imagen para compartir, a partir del logo y de las fotos ya optimizadas.

Uso (desde la raíz, Python 3.12 + Playwright; después de scripts/optimizar_fotos.py):
    python scripts/generar_marca.py

Escribe en public/:
  favicon.svg            la mariposa del logo sobre marfil (trazo más grueso para que se lea en 16 px)
  favicon-32.png         lo mismo en PNG, para navegadores sin favicon SVG
  apple-touch-icon.png   180×180 para la pantalla de inicio del iPhone
  og.jpg                 1200×630: la vista previa del enlace en WhatsApp, Instagram, etc.
Los trazos salen de src/components/logoTrazos.js y las letras del og, de las fuentes reales.
"""
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
PUBLICO = RAIZ / 'public'
TRAZOS = (RAIZ / 'src' / 'components' / 'logoTrazos.js').read_text(encoding='utf-8')
FOTOS = json.loads((RAIZ / 'src' / 'data' / 'fotos.json').read_text(encoding='utf-8'))
FUENTES = RAIZ / 'node_modules' / '@fontsource-variable'

MARFIL, TINTA, CAMEL, CAMEL_TITULO = '#F5F0E8', '#151212', '#B5885A', '#A67A4C'


def constante(nombre):
    return re.search(rf"export const {nombre} = '([^']+)'", TRAZOS).group(1)


LETRAS = re.findall(r"^  '([^']+)', //", TRAZOS, flags=re.M)
RIZO, ALA_SUP, ALA_INF, ANTENA = (constante(n) for n in ('RIZO', 'ALA_SUPERIOR', 'ALA_INFERIOR', 'ANTENA'))
BOLA = dict(zip(('cx', 'cy', 'r'), map(float, re.search(r'BOLA = \{ cx: ([-\d.]+), cy: ([-\d.]+), r: ([-\d.]+) \}', TRAZOS).groups())))


def mariposa(grosor):
    return (f'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="{ALA_SUP}" stroke-width="{34 * grosor}"/><path d="{ALA_INF}" stroke-width="{34 * grosor}"/>'
            f'<path d="{ANTENA}" stroke-width="{24 * grosor}"/></g>')


def logo_completo():
    letras = ''.join(f'<path d="{d}"/>' for d in LETRAS)
    return (f'<svg viewBox="80 -2320 3354 2350" fill="currentColor">{letras}'
            f'<path d="{RIZO}" fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round"/>'
            f'<circle cx="{BOLA["cx"]}" cy="{BOLA["cy"]}" r="{BOLA["r"]}"/>{mariposa(1)}</svg>')


def favicon_svg():
    # La mariposa ocupa ~1150×1230 unidades; se centra en un cuadrado de 1600 con esquinas suaves.
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-85 -2504 1600 1600">'
            f'<rect x="-85" y="-2504" width="1600" height="1600" rx="360" fill="{MARFIL}"/>'
            f'<g style="color:{TINTA}" transform="translate(715 -1704) scale(1.04) translate(-715 1704)">{mariposa(2.1)}</g></svg>')


def foto(id_, ancho=720):
    datos = FOTOS[id_]
    elegido = next((a for a in datos['anchos'] if a >= ancho), datos['anchos'][-1])
    return (PUBLICO / f'{datos["base"].lstrip("/")}-{elegido}.webp').as_uri()


def og_html():
    fuente = lambda archivo: (FUENTES / archivo).as_uri()
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: Bodoni; src: url('{fuente('bodoni-moda/files/bodoni-moda-latin-opsz-normal.woff2')}'); font-weight: 400 900; }}
@font-face {{ font-family: Bodoni; font-style: italic; src: url('{fuente('bodoni-moda/files/bodoni-moda-latin-opsz-italic.woff2')}'); font-weight: 400 900; }}
@font-face {{ font-family: Jost; src: url('{fuente('jost/files/jost-latin-wght-normal.woff2')}'); font-weight: 100 900; }}
* {{ margin: 0; box-sizing: border-box; }}
body {{ width: 1200px; height: 630px; overflow: hidden; background: {MARFIL}; color: {TINTA}; position: relative;
  font-family: Jost; -webkit-font-smoothing: antialiased; }}
.halo {{ position: absolute; right: -120px; top: -160px; width: 760px; height: 760px; border-radius: 50%;
  background: radial-gradient(circle, #EFD3CF 0%, rgba(239,211,207,0.55) 38%, rgba(245,240,232,0) 70%); }}
.texto {{ position: absolute; left: 72px; top: 92px; width: 600px; }}
.logo {{ width: 232px; color: {TINTA}; }}
.logo svg {{ width: 100%; height: auto; display: block; }}
h1 {{ font-family: Bodoni; font-weight: 400; font-size: 70px; line-height: 0.96; letter-spacing: -0.02em;
  margin-top: 40px; white-space: nowrap; }}
h1 em {{ font-style: italic; color: {CAMEL_TITULO}; }}
.linea {{ width: 64px; height: 2px; background: {CAMEL}; margin: 30px 0 20px; }}
.datos {{ font-size: 17px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; }}
.cuenta {{ margin-top: 12px; font-size: 18px; letter-spacing: 0.04em; color: #3B2A22; opacity: 0.8; }}
.carta {{ position: absolute; width: 228px; height: 405px; border-radius: 18px; overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(26,20,18,0.45), 0 10px 20px -10px rgba(26,20,18,0.25); }}
.carta img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
.c1 {{ left: 668px; top: 130px; transform: rotate(-9deg); }}
.c2 {{ left: 950px; top: 116px; transform: rotate(8deg); }}
.c3 {{ left: 806px; top: 96px; width: 246px; height: 437px; transform: rotate(-1deg); z-index: 2; }}
.mariposa {{ position: absolute; left: 1064px; top: 44px; width: 74px; color: {CAMEL}; transform: rotate(14deg); z-index: 3; }}
</style></head><body>
<div class="halo"></div>
<div class="texto">
  <div class="logo">{logo_completo()}</div>
  <h1>Moda que resalta<br>tu <em>belleza</em></h1>
  <div class="linea"></div>
  <p class="datos">Guacara · Envíos a todo el país</p>
  <p class="cuenta">@ellie_co73</p>
</div>
<div class="carta c1"><img src="{foto('historia-camel')}"></div>
<div class="carta c2"><img src="{foto('historia-carteras')}"></div>
<div class="carta c3"><img src="{foto('vestido-rojo')}"></div>
<svg class="mariposa" viewBox="140 -2318 1150 1228">{mariposa(1.5)}</svg>
</body></html>"""


def main():
    PUBLICO.mkdir(exist_ok=True)
    svg = favicon_svg()
    (PUBLICO / 'favicon.svg').write_text(svg + '\n', encoding='utf-8')
    with sync_playwright() as p:
        navegador = p.chromium.launch(channel='chrome')
        for nombre, lado in (('favicon-32.png', 32), ('apple-touch-icon.png', 180)):
            pagina = navegador.new_page(viewport={'width': lado, 'height': lado})
            pagina.set_content(f'<body style="margin:0">{svg.replace("<svg ", f"<svg width={lado} height={lado} ")}</body>')
            pagina.screenshot(path=str(PUBLICO / nombre), omit_background=True)
            pagina.close()
        # Desde un archivo (no set_content): Chrome solo deja cargar fotos y fuentes locales a file://.
        borrador = RAIZ / '.capturas' / 'og.html'
        borrador.parent.mkdir(exist_ok=True)
        borrador.write_text(og_html(), encoding='utf-8')
        pagina = navegador.new_page(viewport={'width': 1200, 'height': 630})
        pagina.goto(borrador.as_uri(), wait_until='networkidle')
        pagina.evaluate('document.fonts.ready.then(() => true)')
        pagina.screenshot(path=str(PUBLICO / 'og.jpg'), type='jpeg', quality=88)
        navegador.close()
    for nombre in ('favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og.jpg'):
        print(f'  public/{nombre}  {(PUBLICO / nombre).stat().st_size / 1024:.1f} KB')


if __name__ == '__main__':
    main()
