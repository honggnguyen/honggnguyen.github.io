import os
import numpy as np
from PIL import Image, ImageFilter

def make_cavity_mask(width=621, height=770):
    mask = np.zeros((height, width), dtype=np.float32)
    Y, X = np.ogrid[:height, :width]
    
    # Fireplace cavity opening geometry:
    # Inner stone arch ring:
    # Center X: 385.0, Center Y: 415.0
    # Horizontal radius: rx = 158.0 (cavity opening spans X: 227..543)
    # Vertical radius: ry = 130.0 (arch apex at Y = 285)
    # Lower cavity body: spans X: 227..543 down to Y = 582
    # Bottom floor cutoff: Y <= 582 (hearth floor stones start at Y = 585)
    cx = 385.0
    cy = 415.0
    rx = 158.0
    ry = 130.0
    
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_arch = top_ellipse & (Y <= cy) & (Y >= (cy - ry))
    in_lower_cavity = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 582)
    
    mask[in_arch | in_lower_cavity] = 1.0
    
    # 1.2px Gaussian feathering for smooth transition along inner shadow
    mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    mask_arr = np.array(mask_img, dtype=np.float32) / 255.0
    
    # Soft linear fade at the very base (Y: 576..584) so zero hard cut lines exist above the hearth
    for y in range(576, 584):
        weight = max(0.0, min(1.0, (584 - y) / 8.0))
        mask_arr[y, :] *= weight
    mask_arr[584:, :] = 0.0
    
    return mask_arr

# Robust landmark-aligned offsets across all sheets:
# Row 0 (frames 1..4): dy = 0
# Row 1 (frames 5..8): dy = 97
OFFSETS_ROW0 = [(5, 0), (10, 0), (16, 0), (11, 0)]
OFFSETS_ROW1 = [(-11, 97), (-23, 97), (-18, 97), (-50, 97)]
OFFSETS = OFFSETS_ROW0 + OFFSETS_ROW1

def render_frame_rgba(sheet, idx, mask_arr):
    FW, FH = 621, 770
    cw, ch = 688, 768
    c = idx % 4
    r = idx // 4
    cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    dx, dy = OFFSETS[idx]
    
    canv = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    canv.paste(cell, (dx, dy))
    
    canv_arr = np.array(canv, dtype=np.float32)
    # Outside the cavity mask, Alpha = 0 (100% transparent)
    # Inside the cavity mask, Alpha = 255 (with feathered transition along inner arch shadow)
    canv_arr[:, :, 3] = canv_arr[:, :, 3] * mask_arr
    return Image.fromarray(canv_arr.astype(np.uint8))

def main():
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    mask_arr = make_cavity_mask()
    
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    
    print("Generating 8 idle frames (lossless transparent WebP)...")
    for i in range(8):
        f = render_frame_rgba(f18, i, mask_arr)
        f.save(os.path.join(out_dir, f'flame_idle_{i+1}.webp'), 'WEBP', lossless=True)
        
    print("Generating 8 smile frames (lossless transparent WebP)...")
    for i in range(8):
        f = render_frame_rgba(fs1, i, mask_arr)
        f.save(os.path.join(out_dir, f'calcifer_smile_{i+1}.webp'), 'WEBP', lossless=True)
        
    print("Generating 8 talk frames (lossless transparent WebP)...")
    for i in range(8):
        f = render_frame_rgba(fs2, i, mask_arr)
        f.save(os.path.join(out_dir, f'calcifer_talk_{i+1}.webp'), 'WEBP', lossless=True)
        
    print("ALL_24_FRAMES_GENERATED_SUCCESSFULLY")

if __name__ == '__main__':
    main()
