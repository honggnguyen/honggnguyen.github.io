import os
from PIL import Image
import numpy as np

def main():
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    # Cavity rectangle inside any 688x768 cell:
    crop_box = (200, 260, 520, 660) # (w=320, h=400)
    
    sheet_1_8 = Image.open('Fig/Flame_1_8.png')
    sheet_smile = Image.open('Fig/Flame_smile.png')
    sheet_smile2 = Image.open('Fig/Flame_smile2.png')
    
    cell_w, cell_h = 688, 768
    
    def get_cell(sheet, idx):
        c = idx % 4
        r = idx // 4
        cell = sheet.crop((c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h))
        return cell.crop(crop_box)
    
    # 1. Idle frames:
    # Frame 1: natural flame from Flame_1_8 cell 0
    f1 = get_cell(sheet_1_8, 0)
    # Frame 3: natural flame from Flame_1_8 cell 2
    f3 = get_cell(sheet_1_8, 2)
    
    # Generate 4-frame idle animation:
    a1 = np.array(f1).astype(float)
    a3 = np.array(f3).astype(float)
    
    f2 = Image.fromarray(np.clip(0.6 * a1 + 0.4 * a3, 0, 255).astype(np.uint8))
    f4 = Image.fromarray(np.clip(0.3 * a1 + 0.7 * a3, 0, 255).astype(np.uint8))
    
    idle_frames = [f1, f2, f3, f4]
    for i, frm in enumerate(idle_frames):
        frm.save(os.path.join(out_dir, f'flame_idle_{i+1}.webp'), 'WEBP', quality=90)
    print("Saved 4 flame_idle frames")
    
    # 2. Awaken & Talk frames from Flame_smile2:
    # 0: sleep
    # 1: surprise awaken ('O')
    # 2: greeting hands
    # 3: happy smile
    # 4: laugh arms
    # 5: talk open
    # 6: talk wide
    # 7: laugh big
    for idx in range(8):
        frm = get_cell(sheet_smile2, idx)
        frm.save(os.path.join(out_dir, f'calcifer_talk_{idx+1}.webp'), 'WEBP', quality=90)
    print("Saved 8 calcifer_talk frames from smile2")
    
    # 3. Add extra expressions from Flame_smile:
    # cell 1 (idx 1): squint eyes happy `> <`
    get_cell(sheet_smile, 1).save(os.path.join(out_dir, 'calcifer_talk_9.webp'), 'WEBP', quality=90)
    # cell 2 (idx 2): super happy
    get_cell(sheet_smile, 2).save(os.path.join(out_dir, 'calcifer_talk_10.webp'), 'WEBP', quality=90)
    print("Saved extra expressions 9 and 10")

if __name__ == '__main__':
    main()
