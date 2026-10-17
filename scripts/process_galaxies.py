import os
import numpy as np
from PIL import Image

OUT_DIR = 'assets/img/'
os.makedirs(OUT_DIR, exist_ok=True)

# List of galaxy / universe files in Fig/
GALAXY_MAP = [
    # (src_name, target_webp, constellation_name, id)
    ('Galaxy_0.png', 'galaxy_0.webp', 'Chòm sao Mộng Mơ', 'mongmo'),
    ('Aries.png', 'galaxy_aries.webp', 'Chòm sao Bạch Dương (Aries)', 'aries'),
    ('Taurus.png', 'galaxy_taurus.webp', 'Chòm sao Kim Ngưu (Taurus)', 'taurus'),
    ('Gemini.png', 'galaxy_gemini.webp', 'Chòm sao Song Tử (Gemini)', 'gemini'),
    ('Cancer.png', 'galaxy_cancer.webp', 'Chòm sao Cự Giải (Cancer)', 'cancer'),
    ('Leo.png', 'galaxy_leo.webp', 'Chòm sao Sư Tử (Leo)', 'leo'),
    ('Virgo.png', 'galaxy_virgo.webp', 'Chòm sao Xử Nữ (Virgo)', 'virgo'),
    ('Libra.png', 'galaxy_libra.webp', 'Chòm sao Thiên Bình (Libra)', 'libra'),
    ('Pisces.png', 'galaxy_pisces.webp', 'Chòm sao Song Ngư (Pisces)', 'pisces'),
    ('Ursa Major.png', 'galaxy_ursamajor.webp', 'Chòm sao Đại Hùng (Ursa Major)', 'ursamajor'),
    ('orion.png', 'galaxy_orion.webp', 'Chòm sao Lạp Hộ (Orion)', 'orion'),
    ('Galaxy_1.png', 'galaxy_1.webp', 'Chòm sao Viễn Du', 'vien-du'),
    ('Galaxy_2.png', 'galaxy_2.webp', 'Chòm sao Kỷ Niệm', 'ky-niem'),
]

def remove_gemini_logo(arr):
    h, w, c = arr.shape
    # Logo is in bottom-right corner:
    # We inspect the bottom-right 300x300 box:
    sub = arr[h-300:h, w-300:w].copy()
    diff = np.abs(sub[:, :, 0].astype(int) - sub[:, :, 1].astype(int)) + np.abs(sub[:, :, 1].astype(int) - sub[:, :, 2].astype(int))
    # Logo is bright grey/white:
    is_logo = (sub[:, :, :3].mean(axis=-1) > 90) & (diff < 40)
    
    # If logo is detected in this region:
    if is_logo.sum() > 200:
        ys, xs = np.where(is_logo)
        cx, cy = int(round(xs.mean())), int(round(ys.mean()))
        
        # Create elliptical feather mask around logo:
        Y, X = np.ogrid[:300, :300]
        dist = np.sqrt(((X - cx) / 60.0)**2 + ((Y - cy) / 60.0)**2)
        mask = np.clip(1.0 - (dist - 0.75) / 0.35, 0.0, 1.0)[:, :, None]
        
        # Source patch taken from 150px to the left:
        shifted = np.roll(sub, 150, axis=1)
        blended = (1.0 - mask) * sub.astype(float) + mask * shifted.astype(float)
        arr[h-300:h, w-300:w] = np.clip(blended, 0, 255).astype(np.uint8)
        print(f'   -> Logo removed at cx={cx}, cy={cy} (pixels={is_logo.sum()})')
    else:
        print('   -> No logo detected in bottom-right corner.')
    return arr

for src_name, target_name, title, cid in GALAXY_MAP:
    src_path = os.path.join('Fig', src_name)
    target_path = os.path.join(OUT_DIR, target_name)
    
    if not os.path.exists(src_path):
        print(f'Warning: {src_path} not found!')
        continue
        
    im = Image.open(src_path).convert('RGBA')
    w, h = im.size
    print(f'Processing {src_name} ({w}x{h})...')
    
    arr = np.array(im)
    arr = remove_gemini_logo(arr)
    
    # Standardize aspect ratio to 16:9 (1920x1080) for web:
    # If image is ultrawide (e.g. 3168x1344), pad top and bottom with deep space color
    # so none of the artwork is cropped!
    TARGET_RATIO = 16.0 / 9.0
    current_ratio = w / h
    
    clean_im = Image.fromarray(arr, 'RGBA')
    
    if current_ratio > TARGET_RATIO + 0.05:
        # Ultrawide image: pad height to 16:9
        new_h = int(round(w / TARGET_RATIO))
        # Cosmic background color sampled from corners
        bg_col = tuple(arr[:10, :10, :3].mean(axis=(0,1)).astype(int)) + (255,)
        padded = Image.new('RGBA', (w, new_h), bg_col)
        # Paste vertically centered
        y_offset = (new_h - h) // 2
        padded.paste(clean_im, (0, y_offset))
        final_im = padded.resize((1920, 1080), Image.LANCZOS)
    else:
        final_im = clean_im.resize((1920, 1080), Image.LANCZOS)
        
    final_im.save(target_path, 'WEBP', quality=90, method=6)
    print(f'   -> Saved {target_path} (1920x1080 WebP, {os.path.getsize(target_path)//1024} KB)')

print('\nAll galaxy images processed and cleaned successfully!')
