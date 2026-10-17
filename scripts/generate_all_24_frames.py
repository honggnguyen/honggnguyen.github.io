import os
import numpy as np
from PIL import Image, ImageFilter

def find_exact_offset(big_img, small_patch, expected_x, expected_y, search_radius=120):
    b_arr = np.array(big_img.convert('L'), dtype=float)
    p_arr = np.array(small_patch.convert('L'), dtype=float)
    ph, pw = p_arr.shape
    H, W = b_arr.shape
    
    y_min = max(0, expected_y - search_radius)
    y_max = min(H - ph, expected_y + search_radius)
    x_min = max(0, expected_x - search_radius)
    x_max = min(W - pw, expected_x + search_radius)
    
    sub_b = b_arr[y_min:y_max + ph, x_min:x_max + pw]
    best_diff = 1e9
    best_pos = (expected_x, expected_y)
    
    for y in range(y_max - y_min):
        for x in range(x_max - x_min):
            diff = np.mean(np.abs(sub_b[y:y+ph, x:x+pw] - p_arr))
            if diff < best_diff:
                best_diff = diff
                best_pos = (x_min + x, y_min + y)
                
    return best_pos, best_diff

def make_cavity_mask(width=613, height=768):
    mask = np.zeros((height, width), dtype=np.uint8)
    Y, X = np.ogrid[:height, :width]
    
    cx = 335.0
    cy = 360.0
    rx = 142.0
    ry = 115.0
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_top_arch = top_ellipse & (Y <= cy) & (Y >= cy - ry)
    in_body = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 622)
    
    mask[in_top_arch | in_body] = 255
    return Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.5))

def main():
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
    FX, FY, FW, FH = 2139, 651, 613, 768
    bg_fireplace = bg.crop((FX, FY, FX + FW, FY + FH))
    mask = make_cavity_mask(FW, FH)
    
    # Keystone template from bg_close at (2420, 860):
    keystone = bg.crop((2420, 860, 2500, 940))
    
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    
    cw, ch = 688, 768
    
    def process_and_save(sheet, cell_idx, out_filename):
        c = cell_idx % 4
        r = cell_idx // 4
        cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        
        # Expected keystone position inside cell:
        # row 0: near (280, 210)
        # row 1: near (300, 115)
        exp_y = 210 if r == 0 else 115
        k_pos, diff = find_exact_offset(cell, keystone, 280, exp_y, 140)
        
        # In bg_close coordinates, keystone is at (2420, 860):
        # Cell paste pos in bg_close:
        paste_x = 2420 - k_pos[0]
        paste_y = 860 - k_pos[1]
        
        # Shift relative to fireplace crop (FX=2139, FY=651):
        rel_x = paste_x - FX
        rel_y = paste_y - FY
        
        # Place cell on 613x768 fireplace canvas:
        cell_on_fp = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        cell_on_fp.paste(cell, (rel_x, rel_y))
        
        # Composite inner cavity into bg_fireplace using feathered arch mask:
        comp = Image.composite(cell_on_fp, bg_fireplace, mask)
        
        # Save as optimized WebP:
        out_path = os.path.join(out_dir, out_filename)
        comp.save(out_path, 'WEBP', quality=92)
        print(f"Processed {out_filename}: cell {cell_idx}, rel=({rel_x}, {rel_y}), diff={diff:.2f}", flush=True)

    print("=== Generating 8 Flame_1_8 idle frames ===", flush=True)
    for i in range(8):
        process_and_save(f18, i, f'flame_idle_{i+1}.webp')
        
    print("=== Generating 8 Flame_smile frames ===", flush=True)
    for i in range(8):
        process_and_save(fs1, i, f'calcifer_smile_{i+1}.webp')

    print("=== Generating 8 Flame_smile2 frames ===", flush=True)
    for i in range(8):
        process_and_save(fs2, i, f'calcifer_talk_{i+1}.webp')

    print("=== All 24 frames generated successfully! ===", flush=True)

if __name__ == '__main__':
    main()
