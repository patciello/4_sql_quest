"""Gera os ícones do PWA (icons/*.png) com Pillow: cilindro de banco de dados em lima sobre preto-tinta.
Uso: python tools/gerar_icones.py   (precisa de: pip install pillow)"""
from pathlib import Path
from PIL import Image, ImageDraw

BG, LIME = (11, 11, 11, 255), (230, 255, 50, 255)
OUT = Path(__file__).resolve().parent.parent / "icons"


def desenhar(size: int, maskable: bool) -> Image.Image:
    k = 4                                    # supersampling para suavizar as bordas
    S = size * k
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:                             # fundo até a borda; o glifo fica na zona segura (~60%)
        d.rectangle([0, 0, S, S], fill=BG)
        scale = 0.60
    else:                                    # cantos arredondados
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=BG)
        scale = 0.64
    g = S * scale
    x0, x1 = (S - g) / 2, (S + g) / 2
    h = g * 0.22                             # altura de cada elipse
    gap = g * 0.27                           # distância entre os discos
    top = (S - (gap * 2 + h)) / 2            # centraliza o glifo na vertical
    stroke = max(2, int(g * 0.075))
    # três discos empilhados (topo cheio, dois arcos inferiores) e as laterais
    d.ellipse([x0, top, x1, top + h], outline=LIME, width=stroke)
    for i in (1, 2):
        y = top + gap * i
        d.arc([x0, y, x1, y + h], 0, 180, fill=LIME, width=stroke)
    d.line([x0 + stroke / 2 - 1, top + h / 2, x0 + stroke / 2 - 1, top + gap * 2 + h / 2], fill=LIME, width=stroke)
    d.line([x1 - stroke / 2 + 1, top + h / 2, x1 - stroke / 2 + 1, top + gap * 2 + h / 2], fill=LIME, width=stroke)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name, size, mask in [("icon-192.png", 192, False), ("icon-512.png", 512, False),
                             ("icon-maskable-512.png", 512, True), ("apple-touch-icon.png", 180, True)]:
        desenhar(size, mask).save(OUT / name, optimize=True)
        print("gerado", OUT / name)


if __name__ == "__main__":
    main()
