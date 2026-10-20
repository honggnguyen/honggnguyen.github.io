import numpy as np
from PIL import Image
from scipy import ndimage as ndi

W = np.array([245, 245, 250], np.float32)
CX, CY, R, P = 351.0, 349.0, 52.0, 0.75   # Gemini sparkle in the bottom-right of every r5c4 cell


def star_dist(shape):
    yy, xx = np.mgrid[:shape[0], :shape[1]].astype(np.float32)
    return (np.abs(xx - CX) / R) ** P + (np.abs(yy - CY) / R) ** P


def remove_logo(rgb, a0=0.62):
    """Un-blend the translucent white sparkle from the pixels that sit on the sprite (not on the checker).
    Alpha ramps down smoothly across the star edge so anti-aliased border pixels are not over-corrected."""
    p = rgb.astype(np.float32)
    s = star_dist(p.shape[:2])
    ramp = np.clip((1.12 - s) / 0.30, 0.0, 1.0)          # 1 inside, 0 beyond the rim
    mx, mn = p.max(2), p.min(2)
    tinted = ((mx - mn) > 5).astype(np.float32)
    a = a0 * ramp * ndi.maximum_filter(tinted, size=3) * tinted
    u = np.clip((p - a[:, :, None] * W) / np.maximum(1 - a[:, :, None], 0.05), 0, 255)
    return u.astype(np.uint8)
