import os
from PIL import Image, ImageDraw, ImageFont

# Ensure directories exist
os.makedirs("public", exist_ok=True)
os.makedirs("app", exist_ok=True)

# Size: 512x512 for main master icon
size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 1. Background Rounded Rectangle with Gradient (Emerald #10b981 to Teal #0f766e)
top_color = (16, 185, 129, 255)    # #10b981
bottom_color = (15, 118, 110, 255) # #0f766e

# Create gradient mask
gradient = Image.new("RGBA", (size, size))
g_draw = ImageDraw.Draw(gradient)
for y in range(size):
    r = int(top_color[0] + (bottom_color[0] - top_color[0]) * (y / size))
    g = int(top_color[1] + (bottom_color[1] - top_color[1]) * (y / size))
    b = int(top_color[2] + (bottom_color[2] - top_color[2]) * (y / size))
    g_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

# Rounded mask with corner radius 110
mask = Image.new("L", (size, size), 0)
m_draw = ImageDraw.Draw(mask)
m_draw.rounded_rectangle([(16, 16), (size - 16, size - 16)], radius=100, fill=255)

# Composite gradient background
img.paste(gradient, (0, 0), mask)

# Inner gold subtle border
d = ImageDraw.Draw(img)
d.rounded_rectangle([(18, 18), (size - 18, size - 18)], radius=98, outline=(255, 255, 255, 60), width=4)

# 2. Draw Elegant Stylized "A" Arch (Golden/White Islamic Arch & Letter A)
# Arch peak at (256, 75), legs going down to (100, 420) and (412, 420)
arch_points = [
    (256, 70), (280, 85), (370, 160), (395, 260), (390, 410), (350, 410),
    (350, 270), (320, 190), (256, 140), (192, 190), (162, 270), (162, 410),
    (122, 410), (117, 260), (142, 160), (232, 85)
]
d.polygon(arch_points, fill=(255, 255, 255, 230))

# Horizontal bar of letter A (Golden glow)
d.rounded_rectangle([(150, 275), (362, 295)], radius=6, fill=(245, 158, 11, 240)) # #f59e0b

# 3. Draw The Holy Kaaba inside the Arch Center
# Kaaba Base: Cube centered around x=256, y=340
# Isometric/frontal stylized Kaaba
kx, ky = 256, 345
kw, kh = 130, 125

# Kaaba Body (Deep charcoal black with subtle depth)
kaaba_left = int(kx - kw / 2)
kaaba_top = int(ky - kh / 2)
kaaba_right = int(kx + kw / 2)
kaaba_bottom = int(ky + kh / 2)

# White marble base foundation (Shadhrawan)
d.rectangle([(kaaba_left - 8, kaaba_bottom - 6), (kaaba_right + 8, kaaba_bottom + 6)], fill=(240, 243, 246, 255))
d.rectangle([(kaaba_left - 10, kaaba_bottom + 4), (kaaba_right + 10, kaaba_bottom + 8)], fill=(203, 213, 225, 255))

# Kaaba black cloth (Kiswah)
d.rounded_rectangle([(kaaba_left, kaaba_top), (kaaba_right, kaaba_bottom)], radius=4, fill=(20, 23, 28, 255))

# Golden Belt (Hizam / Kiswah Golden Band)
belt_y1 = kaaba_top + 26
belt_y2 = kaaba_top + 42
d.rectangle([(kaaba_left, belt_y1), (kaaba_right, belt_y2)], fill=(251, 191, 36, 255)) # #fbbf24 gold

# Fine embroidery detail on golden belt
d.line([(kaaba_left, belt_y1 + 4), (kaaba_right, belt_y1 + 4)], fill=(217, 119, 6, 200), width=1)
d.line([(kaaba_left, belt_y2 - 4), (kaaba_right, belt_y2 - 4)], fill=(217, 119, 6, 200), width=1)

# Kaaba Door (Bab al-Kaaba) on the right side
door_w = 26
door_h = 56
door_x1 = int(kx + 16)
door_x2 = door_x1 + door_w
door_y1 = kaaba_bottom - door_h
door_y2 = kaaba_bottom
d.rounded_rectangle([(door_x1, door_y1), (door_x2, door_y2)], radius=3, fill=(245, 158, 11, 255)) # Pure Gold
d.rectangle([(door_x1 + 3, door_y1 + 4), (door_x2 - 3, door_y2 - 2)], fill=(251, 191, 36, 255))

# Crescent Moon at the Top Apex
cx, cy = 256, 52
crescent_r = 14
d.ellipse([(cx - crescent_r, cy - crescent_r), (cx + crescent_r, cy + crescent_r)], fill=(251, 191, 36, 255))
d.ellipse([(cx - crescent_r + 5, cy - crescent_r - 2), (cx + crescent_r + 3, cy + crescent_r - 2)], fill=(16, 185, 129, 255))

# Star next to crescent
d.ellipse([(cx + 10, cy - 8), (cx + 14, cy - 4)], fill=(251, 191, 36, 255))

# 4. Save 512x512 Master Files
img.save("app/icon.png", format="PNG")
img.save("public/icon.png", format="PNG")
img.save("public/logo.png", format="PNG")
print("Saved app/icon.png, public/icon.png, public/logo.png (512x512)")

# 5. Save 180x180 Apple Touch Icon
apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save("app/apple-icon.png", format="PNG")
apple_icon.save("public/apple-icon.png", format="PNG")
print("Saved app/apple-icon.png and public/apple-icon.png (180x180)")

# 6. Save Multi-Resolution favicon.ico (32x32, 16x16, 48x48)
ico_img = img.resize((32, 32), Image.Resampling.LANCZOS)
ico_img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
ico_img.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("Saved public/favicon.ico and app/favicon.ico (32x32 multi-res ICO)")
