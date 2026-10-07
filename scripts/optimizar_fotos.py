"""Recortes y variantes livianas de las fotos de la tienda.

Uso (desde la raíz del proyecto, Python 3.12 + Pillow 12 con AVIF):
    python scripts/optimizar_fotos.py              # genera lo que falte
    python scripts/optimizar_fotos.py --forzar     # rehace todo
    python scripts/optimizar_fotos.py --hoja .capturas/hoja_fotos.jpg   # + hoja de contactos

Lee scripts/fotos_config.json. Por cada recorte (id estable):
  1. Abre la foto de fotos_originales/ y le aplica sus «parches»: copia una zona vecina encima de un
     texto o pegatina de la historia de Instagram, con bordes difuminados (o un color liso).
  2. Recorta la caja (fracciones 0–1 del original) ajustada a la proporción exacta.
  3. Escribe public/fotos/<id>-<huella>-<ancho>.avif y .webp en los anchos de la config que no
     superen el del recorte (nunca agranda; si el recorte es más ancho que el mayor ancho útil,
     se añade su ancho real).
  4. Crea un placeholder WebP de ~24 px en base64 para el efecto «blur-up».
Y escribe el manifiesto src/data/fotos.json, que es lo único que lee el sitio (src/components/Foto.jsx).

La huella (hash del original + la config del recorte) va en el nombre del archivo: si cambia el recorte,
cambia la URL, así que vercel.json puede pedir caché de un año para /fotos/ sin servir fotos viejas.
"""
import argparse
import base64
import hashlib
import io
import json
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
ORIGINALES = RAIZ / 'fotos_originales'
SALIDA = RAIZ / 'public' / 'fotos'
MANIFIESTO = RAIZ / 'src' / 'data' / 'fotos.json'
CONFIG = json.loads((Path(__file__).parent / 'fotos_config.json').read_text(encoding='utf-8'))
VERSION_SCRIPT = 4  # súbelo si cambia la forma de procesar: invalida todas las huellas


def proporcion(texto):
    a, b = (float(v) for v in texto.split(':'))
    return a / b


def huella(id_, cfg):
    h = hashlib.sha1()
    h.update((ORIGINALES / cfg['origen']).read_bytes())
    h.update(json.dumps([VERSION_SCRIPT, cfg, CONFIG['calidad'], CONFIG['anchos']], sort_keys=True).encode())
    return h.hexdigest()[:8]


def abrir(nombre):
    imagen = Image.open(ORIGINALES / nombre)
    return ImageOps.exif_transpose(imagen).convert('RGB')


def interpolar(imagen, caja, hueco, grano, desenfoque):
    """Rellena el hueco columna a columna, del borde de arriba al de abajo, y le añade grano.

    Conserva los pliegues verticales de la tela y el degradado del piso, que es lo que suele haber
    debajo de las etiquetas y pegatinas de estas fotos. `desenfoque` alisa los bordes antes de
    estirarlos: en telas con pliegues horizontales evita que queden rayas verticales.
    """
    ancho, alto = hueco.size
    tramos = [hueco.crop((x, 0, x + 1, alto)).getbbox() for x in range(ancho)]
    arriba, abajo = Image.new('RGB', (ancho, 1)), Image.new('RGB', (ancho, 1))
    promedio = lambda xi, a, b: imagen.crop((xi, a, xi + 1, b)).resize((1, 1), Image.BOX).getpixel((0, 0))
    for x, tramo in enumerate(tramos):
        # Las columnas sin hueco también toman su color real: el desenfoque de la fila no mete negro.
        yi, yf = caja[1] + (tramo[1] if tramo else 0), caja[1] + (tramo[3] if tramo else alto)
        arriba.putpixel((x, 0), promedio(caja[0] + x, yi - 3, yi))
        abajo.putpixel((x, 0), promedio(caja[0] + x, yf, yf + 3))
    arriba, abajo = (fila.filter(ImageFilter.BoxBlur(desenfoque)) for fila in (arriba, abajo))
    relleno = imagen.crop(caja)
    for x, tramo in enumerate(tramos):
        if tramo:
            pareja = Image.new('RGB', (1, 2))
            pareja.putpixel((0, 0), arriba.getpixel((x, 0)))
            pareja.putpixel((0, 1), abajo.getpixel((x, 0)))
            relleno.paste(pareja.resize((1, tramo[3] - tramo[1]), Image.BILINEAR), (x, tramo[1]))
    if not grano:
        return relleno
    ruido = Image.merge('RGB', [Image.effect_noise((ancho, alto), grano)] * 3)
    return ImageChops.add(relleno, ruido, 1.0, -128)


def aplicar_parche(imagen, parche):
    """Tapa un texto o una pegatina de la historia: clona una zona vecina («desde»), la rellena
    interpolando sus bordes de arriba y abajo («metodo": "interpolar") o la pinta de un color.

    La zona es una `caja` [x0, y0, x1, y1] o un `poligono` [[x, y], …], en fracciones del original.
    """
    W, H = imagen.size
    puntos = parche.get('poligono') or [
        [parche['caja'][0], parche['caja'][1]], [parche['caja'][2], parche['caja'][1]],
        [parche['caja'][2], parche['caja'][3]], [parche['caja'][0], parche['caja'][3]]]
    puntos = [(x * W, y * H) for x, y in puntos]
    suave = parche.get('suave', 12)
    xs, ys = [p[0] for p in puntos], [p[1] for p in puntos]
    caja = (max(0, round(min(xs)) - suave), max(3, round(min(ys)) - suave),
            min(W, round(max(xs)) + suave), min(H - 3, round(max(ys)) + suave))
    ancho, alto = caja[2] - caja[0], caja[3] - caja[1]
    hueco = Image.new('L', (ancho, alto), 0)
    ImageDraw.Draw(hueco).polygon([(x - caja[0], y - caja[1]) for x, y in puntos], fill=255)

    # Opaca en toda la zona y difuminada hacia fuera: así no queda el contorno de la pegatina.
    radio = suave // 2
    ampliado = hueco.filter(ImageFilter.MaxFilter(2 * radio + 1)) if radio else hueco
    mascara = ampliado.filter(ImageFilter.GaussianBlur(radio)) if radio else hueco

    metodo = parche.get('metodo', 'clonar')
    if metodo == 'color':
        fuente = Image.new('RGB', (ancho, alto), parche['color'])
    elif metodo == 'interpolar':
        fuente = interpolar(imagen, caja, ampliado, parche.get('grano', 3), parche.get('desenfoque', 1))
    else:
        dx, dy = round(parche['desde'][0] * W), round(parche['desde'][1] * H)
        fuente = imagen.crop((caja[0] + dx, caja[1] + dy, caja[2] + dx, caja[3] + dy))
    imagen.paste(fuente, caja[:2], mascara)


def caja_exacta(imagen, cfg):
    """Caja en píxeles con la proporción exacta: recorta el lado sobrante alrededor del centro."""
    W, H = imagen.size
    x0, y0, x1, y1 = (v * (W if i % 2 == 0 else H) for i, v in enumerate(cfg.get('caja', [0, 0, 1, 1])))
    ancho, alto = x1 - x0, y1 - y0
    if 'proporcion' in cfg:
        p = proporcion(cfg['proporcion'])
        if ancho / alto > p:
            x0 += (ancho - alto * p) / 2
            ancho = alto * p
        else:
            y0 += (alto - ancho / p) / 2
            alto = ancho / p
        # Redondea un lado y deriva el otro: la proporción queda exacta en píxeles.
        ancho = int(ancho)
        alto = round(ancho / p)
    ancho, alto = round(ancho), round(alto)
    x0, y0 = min(round(x0), W - ancho), min(round(y0), H - alto)  # sin salirse de la foto
    return x0, y0, x0 + ancho, y0 + alto


def anchos_para(ancho_real):
    anchos = [a for a in CONFIG['anchos'] if a <= ancho_real]
    # El recorte entero, si aporta resolución que no cubre el mayor ancho estándar.
    if not anchos or ancho_real > anchos[-1] * 1.12:
        anchos.append(ancho_real)
    return anchos


def placeholder(recorte):
    ancho = CONFIG['placeholder']
    alto = max(1, round(recorte.height * ancho / recorte.width))
    chico = recorte.resize((ancho, alto), Image.LANCZOS)
    buffer = io.BytesIO()
    chico.save(buffer, 'WEBP', quality=45, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buffer.getvalue()).decode()


def color_medio(recorte):
    r, g, b = recorte.resize((1, 1), Image.BOX).getpixel((0, 0))
    return f'#{r:02x}{g:02x}{b:02x}'


def recortar(id_, cfg):
    imagen = abrir(cfg['origen'])
    for parche in cfg.get('parches', []):
        aplicar_parche(imagen, parche)
    return imagen.crop(caja_exacta(imagen, cfg))


def procesar(args):
    """Devuelve (id, entrada del manifiesto, bytes escritos, error)."""
    id_, cfg, forzar = args
    try:
        firma = huella(id_, cfg)
        recorte = recortar(id_, cfg)
        anchos = anchos_para(recorte.width)
        escritos = 0
        for ancho in anchos:
            alto = round(recorte.height * ancho / recorte.width)
            variante = recorte if ancho == recorte.width else recorte.resize((ancho, alto), Image.LANCZOS)
            for formato, opciones in (('avif', {'quality': CONFIG['calidad']['avif'], 'speed': 4}),
                                      ('webp', {'quality': CONFIG['calidad']['webp'], 'method': 6})):
                destino = SALIDA / f'{id_}-{firma}-{ancho}.{formato}'
                if forzar or not destino.exists():
                    variante.save(destino, formato.upper(), **opciones)
                    escritos += destino.stat().st_size
        entrada = {
            'ancho': recorte.width,
            'alto': recorte.height,
            'anchos': anchos,
            'base': f'/fotos/{id_}-{firma}',
            'placeholder': placeholder(recorte),
            'color': color_medio(recorte),
            'alt': cfg.get('alt', ''),
        }
        return id_, entrada, escritos, None
    except Exception as error:  # un recorte con error no detiene los demás
        return id_, None, 0, f'{type(error).__name__}: {error}'


def hoja_de_contactos(destino):
    """Todos los recortes en una lámina, con su id, para revisarlos de un vistazo."""
    alto_celda = 420
    piezas = []
    for id_, cfg in CONFIG['fotos'].items():
        recorte = recortar(id_, cfg)
        escala = alto_celda / recorte.height
        piezas.append((id_, recorte.resize((round(recorte.width * escala), alto_celda), Image.LANCZOS)))
    columnas, margen = 6, 16
    ancho_celda = max(p.width for _, p in piezas)
    filas = (len(piezas) + columnas - 1) // columnas
    hoja = Image.new('RGB', (columnas * (ancho_celda + margen) + margen, filas * (alto_celda + 40) + margen), '#f5f0e8')
    dibujo = ImageDraw.Draw(hoja)
    try:
        fuente = ImageFont.truetype('arial.ttf', 18)
    except OSError:
        fuente = ImageFont.load_default()
    for i, (id_, pieza) in enumerate(piezas):
        x = margen + (i % columnas) * (ancho_celda + margen)
        y = margen + (i // columnas) * (alto_celda + 40)
        hoja.paste(pieza, (x, y))
        dibujo.text((x, y + alto_celda + 6), f'{id_}  {CONFIG["fotos"][id_].get("proporcion", "original")}', fill='#151212', font=fuente)
    Path(destino).parent.mkdir(parents=True, exist_ok=True)
    hoja.save(destino, quality=88)
    print(f'Hoja de contactos: {destino}')


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--forzar', action='store_true', help='rehace todas las variantes')
    parser.add_argument('--hoja', help='ruta de una hoja de contactos JPG para revisar los recortes')
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')  # la consola de Windows no es UTF-8 por defecto

    SALIDA.mkdir(parents=True, exist_ok=True)
    manifiesto, errores, total = {}, [], 0
    trabajos = [(id_, cfg, args.forzar) for id_, cfg in CONFIG['fotos'].items()]
    with ProcessPoolExecutor() as grupo:
        for id_, entrada, escritos, error in grupo.map(procesar, trabajos):
            if error:
                errores.append(f'{id_}: {error}')
                continue
            manifiesto[id_] = entrada
            total += escritos
            if escritos:
                print(f'  {id_:<22} {entrada["ancho"]}x{entrada["alto"]}  {entrada["anchos"]}  {escritos / 1024:.0f} KB')

    # Borra las variantes que ya no corresponden a ningún recorte vigente.
    vigentes = {f'{Path(e["base"]).name}-{a}.{f}' for e in manifiesto.values() for a in e['anchos'] for f in ('avif', 'webp')}
    for archivo in SALIDA.glob('*.*'):
        if archivo.name not in vigentes:
            archivo.unlink()

    MANIFIESTO.parent.mkdir(parents=True, exist_ok=True)
    MANIFIESTO.write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    peso = sum(f.stat().st_size for f in SALIDA.glob('*.*'))
    print(f'{len(manifiesto)} recortes · public/fotos: {peso / 1e6:.2f} MB · escrito ahora: {total / 1024:.0f} KB')
    if args.hoja:
        hoja_de_contactos(args.hoja)
    for e in errores:
        print('ERROR', e, file=sys.stderr)
    sys.exit(1 if errores else 0)


if __name__ == '__main__':
    main()
