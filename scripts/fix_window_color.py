import numpy as np
from PIL import Image

im_c = Image.open('assets/img/bg_close.webp').convert('RGB')
im_o = Image.open('assets/img/bg_open.webp').convert('RGB')

for name, im in [('bg_close', im_c), ('bg_open', im_o)]:
    a = np.array(im).copy()
    w, h = im.size
    
    # Target outermost right pane
    x1, x2 = int(0.12*w) + 692, int(0.12*w) + 768
    y1, y2 = int(0.08*h) + 330, int(0.08*h) + 710
    
    crop = a[y1:y2, x1:x2].astype(float)
    
    # Stars are bright white or light pink: R > 170 or G > 100
    stars_mask = (crop[..., 0] > 170) | (crop[..., 1] > 100)
    # Mullions (bars) have G > 38 and B < 110:
    bars_mask = (crop[..., 1] > 38) & (crop[..., 0] < 80)
    
    # Sky background is what remains:
    sky_mask = (~stars_mask) & (~bars_mask) & (crop[..., 0] > 40)
    
    # Harmonize sky towards [42, 17, 72] and [65, 20, 80]
    target_crop = crop.copy()
    target_crop[..., 0] = np.where(sky_mask, crop[..., 0] * 0.44 + 3, crop[..., 0])
    target_crop[..., 1] = np.where(sky_mask, crop[..., 1] * 0.65 + 1, crop[..., 1])
    target_crop[..., 2] = np.where(sky_mask, crop[..., 2] * 0.58 + 4, crop[..., 2])
    
    a[y1:y2, x1:x2] = np.clip(target_crop, 0, 255).astype(np.uint8)
    
    # Also fix the upper arch of that right pane
    y_arch1, y_arch2 = int(0.08*h) + 150, int(0.08*h) + 330
    crop_arch = a[y_arch1:y_arch2, x1:x2].astype(float)
    stars_arch = (crop_arch[..., 0] > 170) | (crop_arch[..., 1] > 100)
    bars_arch = (crop_arch[..., 1] > 38) & (crop_arch[..., 0] < 80)
    sky_arch = (~stars_arch) & (~bars_arch) & (crop_arch[..., 0] > 40)
    
    target_arch = crop_arch.copy()
    target_arch[..., 0] = np.where(sky_arch, crop_arch[..., 0] * 0.50 + 2, crop_arch[..., 0])
    target_arch[..., 1] = np.where(sky_arch, crop_arch[..., 1] * 0.68 + 1, crop_arch[..., 1])
    target_arch[..., 2] = np.where(sky_arch, crop_arch[..., 2] * 0.60 + 3, crop_arch[..., 2])
    a[y_arch1:y_arch2, x1:x2] = np.clip(target_arch, 0, 255).astype(np.uint8)
    
    # Save back
    res = Image.fromarray(a)
    res.save(f'assets/img/{name}.webp', quality=95)
    
    # Save preview crop
    crop_res = res.crop((int(0.12*w), int(0.08*h), int(0.42*w), int(0.75*h)))
    crop_res.save(f'/tmp/crop_{name}_perfect.png')

print("Applied window color fix to both bg_close.webp and bg_open.webp!")
