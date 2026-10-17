import numpy as np
from PIL import Image

def main():
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    cw, ch = 688, 768
    
    # Let's save crops of all 24 cells around the arch area (x: 100..600, y: 100..700):
    for name, sheet in [('f18', f18), ('fs1', fs1), ('fs2', fs2)]:
        for i in range(8):
            c = i % 4
            r = i // 4
            cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            cell.save(f'/tmp/{name}_raw_{i+1}.png')
    print("Saved all 24 raw cells to /tmp/")

if __name__ == '__main__':
    main()
