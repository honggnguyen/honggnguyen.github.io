import os
from PIL import Image
import numpy as np

def main():
    bg = Image.open('assets/img/bg_close.webp').convert('RGBA')
    FX, FY, FW, FH = 2139, 651, 613, 768
    bg_fp = bg.crop((FX, FY, FX + FW, FY + FH))
    bg_fp.save('/tmp/bg_fp_raw.png')
    
    # Let's inspect where the fire is in bg_close:
    arr = np.array(bg_fp)
    # Fire has high R, high G:
    fire_pixels = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 90) & (arr[:, :, 2] < 90)
    ys, xs = np.where(fire_pixels)
    print(f"Fire in bg_close spans: x={xs.min()}..{xs.max()}, y={ys.min()}..{ys.max()}")
    print(f"Fire center: x={xs.mean():.1f}, y={ys.mean():.1f}")

if __name__ == '__main__':
    main()
