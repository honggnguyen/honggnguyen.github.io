import os
import numpy as np
from PIL import Image
from scipy.ndimage import label

CANVAS_W, CANVAS_H = 640, 420
CANVAS_HEAD_X = 480
GROUND_CANVAS_Y = 395

im = Image.open('Fig/Dog_frame.png')
arr = np.array(im)

boxes = [
    (443, 843, 31, 606),
    (443, 843, 621, 1188),
    (443, 843, 1203, 1770),
    (443, 843, 1787, 2356),
    (927, 1329, 31, 606),
    (927, 1329, 621, 1188),
    (927, 1329, 1203, 1770),
    (927, 1329, 1787, 2356),
]

for idx, (y1, y2, x1, x2) in enumerate(boxes, 1):
    sub = arr[y1:y2, x1:x2].copy()
    
    # Clear outer 2px boundary
    sub[:2, :] = [255, 255, 255, 255]
    sub[-2:, :] = [255, 255, 255, 255]
    sub[:, :2] = [255, 255, 255, 255]
    sub[:, -2:] = [255, 255, 255, 255]
    
    # White background removal
    is_white = (sub[:, :, 0] > 240) & (sub[:, :, 1] > 240) & (sub[:, :, 2] > 240)
    labeled, _ = label(is_white)
    border_labels = set(np.unique(np.concatenate([labeled[0, :], labeled[-1, :], labeled[:, 0], labeled[:, -1]])))
    border_labels.discard(0)
    sub[np.isin(labeled, list(border_labels)), 3] = 0
    
    # Keep only the dog
    lab_dog, _ = label(sub[:, :, 3] > 0)
    sizes = np.bincount(lab_dog.ravel())
    sizes[0] = 0
    sub[lab_dog != np.argmax(sizes)] = 0
    
    # For frames where the tail tip touched the boundary (Frame 3, 4, 7, 8),
    # soften the leftmost 3-pixel edge of the tail tip to make it fluffy:
    ys, xs = np.where(sub[:, :, 3] > 0)
    tail_min_x = xs.min()
    
    # Check if leftmost column has a flat vertical run:
    leftmost_ys = ys[xs == tail_min_x]
    if len(leftmost_ys) > 5:
        # Round the top and bottom corners of the tail tip
        top_cut = leftmost_ys.min()
        bot_cut = leftmost_ys.max()
        mid_cut = (top_cut + bot_cut) / 2
        # Taper the tip pixels naturally
        for y_cur in leftmost_ys:
            dist_from_mid = abs(y_cur - mid_cut) / ((bot_cut - top_cut) / 2)
            if dist_from_mid > 0.65:
                # Remove sharp corners at the boundary cut
                sub[y_cur, tail_min_x, 3] = 0
                if dist_from_mid > 0.85 and tail_min_x + 1 < sub.shape[1]:
                    sub[y_cur, tail_min_x + 1, 3] = 0

    # Recalculate tight bounds after fluffing:
    ys, xs = np.where(sub[:, :, 3] > 0)
    dog_cropped = sub[ys.min():ys.max()+1, xs.min():xs.max()+1]
    dog_pil = Image.fromarray(dog_cropped, 'RGBA')
    
    # Head anchor:
    hy, hx = np.where(sub[50:150, 350:520, 3] > 0)
    box_head_x = 350 + hx.mean()
    cropped_head_x = box_head_x - xs.min()
    pos_x = int(round(CANVAS_HEAD_X - cropped_head_x))
    
    # Ground anchor:
    box_ground_y = 390 if idx <= 4 else 376
    cropped_ground_y = box_ground_y - ys.min()
    pos_y = int(round(GROUND_CANVAS_Y - cropped_ground_y))
    
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(dog_pil, (pos_x, pos_y), dog_pil)
    
    webp_path = f'assets/img/dog_walk{idx}.webp'
    png_path = f'Fig/dog_frame{idx}.png'
    
    canvas.save(webp_path, 'WEBP', lossless=True, quality=100)
    canvas.save(png_path, 'PNG')
    print(f'Frame {idx}: saved {webp_path} and {png_path} (tail_x={pos_x}, width={dog_cropped.shape[1]})')

print('\nAll 8 dog walking frames exported with full fluffy tail and rock-solid anchor!')
