import os
import numpy as np
from PIL import Image, ImageFilter

# Cavity-local geometry shared by mask + background
CX, CY, RX, RY = 393.5, 415.0, 162.5, 122.5
BX, BY = 2131, 649            # canvas origin inside the full background image
SEAM_BAND = 4.0               # cross-dissolve width (px) around bottom seam

# Exact landmark-aligned offsets across all 24 frames:
# Calibrated so LeftPost X = 266, BotRail Y = 582 across every frame.
# This aligns the grate rails, posts, cavity walls, and right groove (< 0.5px).
OFFSETS = {
    'flame_idle_{}': [(-5, -9), (3, 1), (8, 2), (3, 2), (-21, 73), (-38, 73), (-38, 85), (-8, 98)],
    'calcifer_smile_{}': [(-4, -10), (3, -10), (-6, -14), (-2, -10), (-21, 73), (-38, 74), (-38, 92), (-72, 100)],
    'calcifer_talk_{}': [(-3, -14), (0, -9), (6, -14), (3, -10), (-20, 74), (-38, 75), (-38, 94), (-72, 100)],
}

def make_cavity_mask(width=621, height=770, yb=None):
    """Cavity alpha mask.
    
    The top arch is an ellipse with apex at CY - RY = 292.5 and springline at CY = 415.0,
    ending at X = 556.0 on the right and X = 231.0 on the left.
    The lower cavity continues vertically from Y = 415.0 down to the floor
    strictly between X = 231.0 and X = 556.0, meeting the arch seamlessly with ZERO ledge.
    """
    mask = np.zeros((height, width), dtype=np.float32)
    Y, X = np.ogrid[:height, :width]
    
    cx, cy, rx, ry = CX, CY, RX, RY
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_arch = top_ellipse & (Y <= cy) & (Y >= (cy - ry))
    # Lower cavity strictly bounds X between [cx - rx] (231.0) and [cx + rx] (556.0)
    in_lower_cavity = (X >= (cx - rx)) & (X <= (cx + rx)) & (Y > cy) & (Y <= 640)
    
    mask[in_arch | in_lower_cavity] = 1.0
    
    # 1.2px Gaussian feathering along natural dark groove
    mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    mask_arr = np.array(mask_img, dtype=np.float32) / 255.0
    
    Yg = np.arange(height)[:, None].astype(np.float32)
    if yb is None:
        yb = np.full(width, 584.0, dtype=np.float32)
    
    # Bottom seam: dissolve across SEAM_BAND px centred on the bottom seam path
    soft_bottom = np.clip((np.asarray(yb, np.float32)[None, :] + 0.5 - Yg) / SEAM_BAND + 0.5, 0.0, 1.0)
    mask_arr *= soft_bottom
    
    return mask_arr

def _dp_seam(cost, maxstep=1):
    """Min-cost 1-D path through cost[L, K]; path index changes by <= maxstep per step."""
    L, K = cost.shape
    acc = cost.astype(np.float64).copy()
    back = np.zeros((L, K), dtype=np.int32)
    for l in range(1, L):
        prev = acc[l - 1]
        best = np.full(K, np.inf)
        arg = np.zeros(K, dtype=np.int32)
        for d in range(-maxstep, maxstep + 1):
            shifted = np.full(K, np.inf)
            if d < 0:
                shifted[-d:] = prev[:K + d]
            elif d > 0:
                shifted[:K - d] = prev[d:]
            else:
                shifted = prev.copy()
            better = shifted < best
            best = np.where(better, shifted, best)
            arg = np.where(better, np.arange(K) + d, arg)
        acc[l] += best
        back[l] = arg
    k = int(np.argmin(acc[-1]))
    path = [k]
    for l in range(L - 1, 0, -1):
        k = int(back[l, k])
        path.append(k)
    return np.array(path[::-1]), float(acc[-1].min() / L)

def compute_bottom_seam(canvases, bg_paths, width=621, height=770):
    """Find bottom cut line where every frame is closest to the background."""
    stack = np.array([c[:, :, :3].astype(np.float32) for c in canvases])
    cost = np.zeros((height, width), dtype=np.float32)
    for p in bg_paths:
        bg = np.array(Image.open(p).convert('RGB').crop((BX, BY, BX + width, BY + height))).astype(np.float32)
        cost = np.maximum(cost, np.abs(stack - bg[None]).mean(3).max(0))
    cost = np.array(Image.fromarray(np.clip(cost, 0, 255).astype(np.uint8))
                    .filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
    
    # Bottom: search Y 580..610 between left and right groove (231..556)
    y0, y1 = 580, 611
    xs0, xs1 = int(CX - RX), int(CX + RX)
    path_b, cb = _dp_seam(cost[y0:y1, xs0:xs1].T)
    yb = np.full(width, float(y0 + int(np.median(path_b))), dtype=np.float32)
    yb[xs0:xs1] = path_b + y0
    
    k = np.ones(5) / 5.0
    yb = np.convolve(np.pad(yb, 2, mode='edge'), k, mode='valid').astype(np.float32)
    print(f'Bottom seam: Y {yb[xs0:xs1].min():.0f}..{yb[xs0:xs1].max():.0f}, mean cost {cb:.1f}')
    return yb

def build_canvas(sheet_name, sheet, idx, clean_upper_wall):
    """Place one sprite cell on the 621x770 canvas."""
    FW, FH = 621, 770
    cw, ch = 688, 768
    c = idx % 4
    r = idx // 4
    cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    dx, dy = OFFSETS[sheet_name][idx]
    
    canv = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    canv.paste(cell, (dx, dy))
    canv_arr = np.array(canv)
    
    # Frames 6, 7, 8 (indices 5, 6, 7) have a stone pillar intrusion in the upper cavity
    # along X=[546..556], Y=[320..510]. Clean this using Frame 5 (idx 4) strictly above the
    # grate (Y <= 510).
    # Frames 1..5 are pristine and naturally end at the groove X=556 with full grate intact;
    # they are NEVER overwritten.
    if idx in (5, 6, 7) and clean_upper_wall is not None:
        RW0, RW1 = 546, 557
        w = np.clip((np.arange(RW0, RW1) - RW0 + 1) / 3.0, 0.0, 1.0)[None, :, None]
        region = canv_arr[320:510, RW0:RW1].astype(np.float32)
        clean = clean_upper_wall[320:510, :].astype(np.float32)
        w = np.broadcast_to(w, region.shape[:2] + (1,)).copy()
        canv_arr[320:510, RW0:RW1] = np.round(region * (1.0 - w) + clean * w).astype(np.uint8)
        
    return canv_arr

def render_frame_rgba(canv_arr, mask_arr):
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
    
    # 2. Reference clean upper right wall from Frame 5 (idx 4)
    #    Col X=[546..557], Row Y=[320..510]
    cw, ch = 688, 768
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    
    sheets = [('flame_idle_{}', f18), ('calcifer_smile_{}', fs1), ('calcifer_talk_{}', fs2)]
    
    # Build clean upper right walls per sheet from each sheet's own Frame 5
    clean_walls = {}
    for pattern, sheet in sheets:
        canv5 = Image.new('RGBA', (621, 770), (0, 0, 0, 0))
        dx5, dy5 = OFFSETS[pattern][4]
        cell5 = sheet.crop((0 * cw, 1 * ch, 1 * cw, 2 * ch))
        canv5.paste(cell5, (dx5, dy5))
        clean_walls[pattern] = np.array(canv5)[:, 546:557]
    
    # 3. Build all 24 unmasked canvases
    canvases = {}
    for pattern, sheet in sheets:
        for i in range(8):
            canvases[pattern.format(i + 1)] = build_canvas(pattern, sheet, i, clean_walls[pattern])
    
    # 4. Cavity mask with minimum-contrast bottom seam valid for ALL frames
    yb = compute_bottom_seam(list(canvases.values()),
                             ['assets/img/bg_close.webp', 'assets/img/bg_open.webp'])
    mask_arr = make_cavity_mask(yb=yb)
    
    print("Generating 24 frames (lossless transparent WebP)...")
    for name, arr in canvases.items():
        f = render_frame_rgba(arr, mask_arr)
        f.save(os.path.join(out_dir, f'{name}.webp'), 'WEBP', lossless=True)
        
    print("ALL_24_FRAMES_GENERATED_SUCCESSFULLY")

if __name__ == '__main__':
    main()
