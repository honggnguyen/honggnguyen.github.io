import os
import numpy as np
from PIL import Image, ImageFilter

# Exact cell offsets relative to cell0 (dx, dy):
OFFSETS = [
    (0, 0),       # Frame 1
    (5, 0),       # Frame 2
    (11, 0),      # Frame 3
    (5, 0),       # Frame 4
    (-15, 101),   # Frame 5
    (-32, 101),   # Frame 6
    (-32, 101),   # Frame 7
    (-67, 109)    # Frame 8
]

BASE_X = 2131
BASE_Y = 649
FW = 621  # 2752 - 2131 = 621
FH = 770

def make_perfect_cavity_mask(width, height):
    """
    True fireplace cavity geometry:
    - Center cx = 389.0 (centered on inner stone arch ring)
    - Radius rx = 162.0 (inner stone arch boundary spanning x=227 to x=551)
    - Arch apex: y = 285.0 (cy=415, ry=130 -> cy-ry = 285)
    - Hearth level: y = 613 (just above stone hearth step at y=615)
    """
    mask = np.zeros((height, width), dtype=np.uint8)
    Y, X = np.ogrid[:height, :width]
    
    cx = 389.0
    cy = 415.0
    rx = 162.0
    ry = 130.0
    
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_top_arch = top_ellipse & (Y <= cy) & (Y >= cy - ry)
    in_body = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 613)
    
    mask[in_top_arch | in_body] = 255
    return Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.2))

def main():
    bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
    bg_fp = bg.crop((BASE_X, BASE_Y, BASE_X + FW, BASE_Y + FH))
    
    mask_img = make_perfect_cavity_mask(FW, FH)
    
    # Clean the static background fire in bg_fp:
    bg_clean_arr = np.array(bg_fp)
    fire_in_bg = (bg_clean_arr[:, :, 0] > 160) & (bg_clean_arr[:, :, 1] > 80) & (bg_clean_arr[:, :, 2] < 120) & (np.array(mask_img) > 10)
    brick_sample = bg_clean_arr[360, 235, :3] # clean dark brick color [77, 25, 30]
    bg_clean_arr[fire_in_bg, :3] = brick_sample
    bg_clean_fp = Image.fromarray(bg_clean_arr)
    
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    
    cw, ch = 688, 768
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    def process_and_save(sheet, idx, filename):
        c = idx % 4
        r = idx // 4
        cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        dx, dy = OFFSETS[idx]
        
        cell_canvas = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        cell_canvas.paste(cell, (dx, dy))
        
        comp = Image.composite(cell_canvas, bg_clean_fp, mask_img)
        out_path = os.path.join(out_dir, filename)
        comp.save(out_path, 'WEBP', quality=95)

    # 1. 8 idle frames
    print("Generating 8 idle frames...")
    for i in range(8):
        process_and_save(f18, i, f'flame_idle_{i+1}.webp')
        
    # 2. 8 smile frames
    print("Generating 8 smile frames...")
    for i in range(8):
        process_and_save(fs1, i, f'calcifer_smile_{i+1}.webp')

    # 3. 8 talk frames
    print("Generating 8 talk frames...")
    for i in range(8):
        process_and_save(fs2, i, f'calcifer_talk_{i+1}.webp')

    print("All 24 frames updated successfully!")

if __name__ == '__main__':
    main()
