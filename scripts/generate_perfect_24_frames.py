import os
import numpy as np
from PIL import Image, ImageFilter

def make_cavity_mask(width=621, height=770):
    mask = np.zeros((height, width), dtype=np.float32)
    Y, X = np.ogrid[:height, :width]
    
    # Exact fireplace cavity opening geometry:
    # Left groove: X = 231.0
    # Right groove: X = 556.0
    # Center X: (231 + 556) / 2 = 393.5
    # Radius X: (556 - 231) / 2 = 162.5
    # Center Y: 415.0
    # Radius Y: 122.5 (apex at cy - ry = 292.5, strictly below stone arch rim)
    cx = 393.5
    cy = 415.0
    rx = 162.5
    ry = 122.5
    
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_arch = top_ellipse & (Y <= cy) & (Y >= (cy - ry))
    in_lower_cavity = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 583)
    
    mask[in_arch | in_lower_cavity] = 1.0
    
    # 1.2px Gaussian feathering along natural dark groove
    mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    mask_arr = np.array(mask_img, dtype=np.float32) / 255.0
    
    # Soft linear fade right at bottom edge into shadow under bottom rail (Y: 581..584)
    for y in range(581, 584):
        weight = max(0.0, min(1.0, (584 - y) / 3.0))
        mask_arr[y, :] *= weight
    mask_arr[584:, :] = 0.0
    
    return mask_arr

# Exact landmark-aligned offsets across all sheets:
# Ensures iron grate rails, posts, and hearth align to < 1px across all 24 frames
OFFSETS = [
    (0, 0),     # Frame 1
    (5, 0),     # Frame 2
    (11, 0),    # Frame 3
    (5, 0),     # Frame 4
    (-19, 91),  # Frame 5
    (-36, 91),  # Frame 6
    (-36, 91),  # Frame 7
    (-71, 101)  # Frame 8
]

def render_frame_rgba(sheet, idx, mask_arr, clean_right_wall):
    FW, FH = 621, 770
    cw, ch = 688, 768
    c = idx % 4
    r = idx // 4
    cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    dx, dy = OFFSETS[idx]
    
    canv = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    canv.paste(cell, (dx, dy))
    
    canv_arr = np.array(canv)
    
    # Eliminate any fireplace stone pillar/arch intrusion along the right wall:
    # Cell 4 (Frame 5, talk_5) is the gold standard with zero stone pillar.
    # Calcifer's body/flames NEVER touch X >= 538, so we directly copy
    # the right wall strip X=[538..560] from talk_5 for all other frames.
    # This avoids threshold-based detection which has false positives from fire glow.
    if idx != 4:
        canv_arr[320:565, 538:560] = clean_right_wall[320:565, :]
            
    canv_arr_f = canv_arr.astype(np.float32)
    canv_arr_f[:, :, 3] *= mask_arr
    return Image.fromarray(canv_arr_f.astype(np.uint8))

def clean_bg_apex_sparks(filepath):
    if not os.path.exists(filepath):
        return
    bg = Image.open(filepath).convert('RGB')
    bg_arr = np.array(bg)
    BX, BY = 2131, 649
    
    # Clean the static tip baked into the stone arch rim (Y: 279..285, X: 348..357)
    y1, y2 = BY + 279, BY + 286
    x1, x2 = BX + 348, BX + 357
    tip_mask = (bg_arr[y1:y2, x1:x2, 0] > 120) & (bg_arr[y1:y2, x1:x2, 1] > 55)
    bg_arr[y1:y2, x1:x2][tip_mask] = [88, 48, 50]
    
    cleaned = Image.fromarray(bg_arr)
    cleaned.save(filepath, 'WEBP', quality=98)
    print(f"Cleaned static arch tip in {filepath}")

def main():
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Clean background images
    clean_bg_apex_sparks('assets/img/bg_close.webp')
    clean_bg_apex_sparks('assets/img/bg_open.webp')
    
    # 2. Generate cavity mask
    mask_arr = make_cavity_mask()
    
    # 3. Reference clean right wall from talk_5 (Row 1, Col 0 of Flame_smile2)
    #    X=[538..560] range - Calcifer never touches these columns.
    cw, ch = 688, 768
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    canv4 = Image.new('RGBA', (621, 770), (0, 0, 0, 0))
    canv4.paste(fs2.crop((0 * cw, 1 * ch, 1 * cw, 2 * ch)), (-19, 91))
    clean_right_wall = np.array(canv4)[:, 538:560]
    
    # 4. Open sprite sheets
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    
    print("Generating 8 idle frames (lossless transparent WebP)...")
    for i in range(8):
        f = render_frame_rgba(f18, i, mask_arr, clean_right_wall)
        f.save(os.path.join(out_dir, f'flame_idle_{i+1}.webp'), 'WEBP', lossless=True)
        
    print("Generating 8 smile frames (lossless transparent WebP)...")
    for i in range(8):
        f = render_frame_rgba(fs1, i, mask_arr, clean_right_wall)
        f.save(os.path.join(out_dir, f'calcifer_smile_{i+1}.webp'), 'WEBP', lossless=True)
        
    print("Generating 8 talk frames (lossless transparent WebP)...")
    for i in range(8):
        f = render_frame_rgba(fs2, i, mask_arr, clean_right_wall)
        f.save(os.path.join(out_dir, f'calcifer_talk_{i+1}.webp'), 'WEBP', lossless=True)
        
    print("ALL_24_FRAMES_GENERATED_SUCCESSFULLY")

if __name__ == '__main__':
    main()
