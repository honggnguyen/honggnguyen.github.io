import numpy as np
from PIL import Image

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

def main():
    bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
    # In bg_close (2752x1536), fireplace origin is near (2139, 651).
    # Left pillar capital in cell0 is at x: 120..200, y: 220..300.
    # In bg_close coordinates: x = 2139 + 120 = 2259, y = 651 + 220 = 871.
    left_capital = bg.crop((2259, 871, 2339, 951))
    
    # Also top mantle corner: in cell0 at x: 80..160, y: 140..200
    # In bg_close: x = 2139 + 80 = 2219, y = 651 + 140 = 791
    mantle_corner = bg.crop((2219, 791, 2299, 851))
    
    print("Testing left pillar capital landmark on all 24 frames:")
    for name, sheet_file in [('Flame_1_8', 'Fig/Flame_1_8.png'), ('Flame_smile', 'Fig/Flame_smile.png'), ('Flame_smile2', 'Fig/Flame_smile2.png')]:
        im = Image.open(sheet_file)
        cw, ch = 688, 768
        for i in range(8):
            c, r = i % 4, i // 4
            cell = im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            
            exp_y = 220 if r == 0 else 125
            pos, diff = find_exact_offset(cell, left_capital, 120, exp_y, 80)
            
            # Since in bg_close left_capital is at (2259, 871):
            # cell origin in bg_close:
            bg_x = 2259 - pos[0]
            bg_y = 871 - pos[1]
            print(f"{name} {i+1}: capital at {pos}, diff={diff:.2f} => cell in bg: ({bg_x}, {bg_y})")

if __name__ == '__main__':
    main()
