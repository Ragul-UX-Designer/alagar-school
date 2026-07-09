# Alagar Public School — Website Image & Video Requirements

Companion guide to **`Alagar-Website-Image-and-Video-Requirements.xlsx`**.

This document explains, in plain language, every photo and video the website needs, the
format they must be supplied in, and how to hand them over so they drop straight into the
site without any renaming.

- **Prepared:** July 9, 2026
- **For:** School Coordinator / Media Team
- **Submit to:** alagarschool@gmail.com (or the shared SharePoint folder)

---

## 1. How the two files work together

| File | Use it for |
|------|-----------|
| `Alagar-Website-Image-and-Video-Requirements.xlsx` | The master checklist — one row per image/video slot, with exact filename, size, format, and status. Fill / track against this. |
| This README (`.md`) | The written explanation of the rules in the spreadsheet. Read this first. |

The spreadsheet has five tabs:

1. **Overview** – purpose, how to use it, and the status legend.
2. **Image Requirements** – fixed images that appear on set pages (logo, hero, portraits, etc.).
3. **Video Requirements** – the campus video and optional event clips.
4. **Gallery Requirements** – event photo albums, grouped by academic year and event.
5. **General Specs** – format, colour, and delivery rules that apply to every asset.

---

## 2. Status legend

| Status | Meaning |
|--------|---------|
| **Present** | An acceptable file already exists on the site. Replace only if you have something better. |
| **Replace / upgrade** | A file exists but is low resolution or a placeholder — a higher-quality version is recommended. |
| **Provide new** | No suitable asset yet — the school needs to supply it. |

Two current items are flagged **Replace / upgrade**:

- **`favicon.png`** – currently `194 × 64` (not square). Provide a square `512 × 512` icon.
- **`about-campus.jpg`** (video poster) – currently `680 × 453` (low-res). Provide a `1600 × 900` HD still that matches the campus video.

---

## 3. Where files live

All images sit under `assets/img/` and videos under `assets/video/`.
**Use the exact path and filename listed in the spreadsheet** — the site references these
names directly, so a renamed file will not appear.

```
assets/
├── img/
│   ├── logo.png                      # header/footer logo
│   ├── favicon.png                   # browser-tab icon
│   ├── about-campus.jpg              # campus video poster
│   ├── promo-admissions.jpg          # admissions pop-up
│   ├── chairman.jpg / correspondent.jpg / principal.jpg   # leadership portraits
│   ├── curr-foundation/discoverers/innovators/trailblazers.jpg   # curriculum wheel (4)
│   ├── Nursery-Grade-2/Grade-3-5/Grade-6-8/Grade-9-12.jpeg       # academic stages (4)
│   ├── Math-lab.jpg / Computer-lab.jpg / Science-lab.jpg         # labs
│   ├── Hero-Banner/     home-hero1–3.jpg          # home hero carousel (3)
│   ├── ECA/             <Activity>.jpg            # activity photos (17) + lab stills
│   ├── Calendars/       <Month-Year>.jpg          # monthly calendars (11)
│   ├── Achievement/     <Year>/*.jpg              # award photos
│   └── Gallery/         <Year>/<Event>/*.jpg      # event albums
└── video/
    └── campus-tour.mp4               # campus / intro film
```

---

## 4. Quick specifications

### Images

| Slot | Size (px) | Aspect | Format |
|------|-----------|--------|--------|
| Logo | 720 × 240 | 3:1 | PNG (transparent) |
| Favicon | 512 × 512 | 1:1 | PNG + .ico |
| Hero banners (×3) | 1040 × 1140 | ≈9:10 portrait | JPG / WebP |
| Video poster | 1600 × 900 | 16:9 | JPG / WebP |
| Curriculum tiles (×4) | 800 × 534 | 3:2 | JPG / WebP |
| Academic stage cards (×4) | 1200 × 750 | 16:10 | JPG / WebP |
| Lab / facility photos | 1200 × 800 | 3:2 | JPG / WebP |
| Activity (ECA) photos | 1000 × 750 | 4:3 | JPG / WebP |
| Leadership portraits (×3) | 900 × 1200 | 3:4 portrait | JPG |
| Admissions pop-up | 1000 × 800 | 5:4 | JPG / WebP |
| Calendars (×11) | ≥ 1200 wide | as designed | JPG |
| Gallery / event photos | 1600 px long edge | landscape preferred | JPG / WebP |

Keep photos under **300 KB** each (≈80% JPG quality) and use the **sRGB** colour profile.

### Video

| Item | Spec |
|------|------|
| File | `assets/video/campus-tour.mp4` |
| Resolution | 1920 × 1080 (Full HD) |
| Length | 30–90 seconds |
| Format | MP4 (H.264 video + AAC audio) |
| Size | ≤ 15 MB (compress to ~2–4 Mbps) |
| Poster | export a still and save it as `about-campus.jpg` |

The same `campus-tour.mp4` currently powers both the homepage intro player and the
"Watch Video" buttons on the Activities cards. To give an activity its own clip, supply a
new file (e.g. `assets/video/annual-day.mp4`) and update its `data-video` path.

---

## 5. Gallery / event albums

Event photos are grouped **by academic year, then by event**:

```
assets/img/Gallery/Academic2025-26/Sports-Day/Sports-Day1.jpg
assets/img/Gallery/Academic2025-26/Sports-Day/Sports-Day2.jpg
```

Rules:

- One **folder per event**, named with hyphens and **no spaces** — e.g. `Sports-Day/`.
- Name photos `EventName1.jpg`, `EventName2.jpg`, … in the order they should appear.
- 4–12 photos per event is ideal; landscape framing looks best.
- JPG or WebP only — no HEIC or phone-original files without resizing.

Current albums: Academic 2023-24 (26), 2024-25 (22), 2025-26 (18),
Buds & Blooms 2024-25 (25) and 2025-26 (13).

---

## 6. Golden rules before you hand over

1. **Keep the filenames exactly** as shown in the spreadsheet.
2. **Real Alagar photos only** — no stock or placeholder images.
3. **Get consent** for any photo of an identifiable child or staff member.
4. **Resize and compress** for web before sending (don't send 8 MB phone photos).
5. **sRGB, JPG/WebP for photos, PNG for logos/icons, MP4 (H.264) for video.**
6. Deliver through the agreed **SharePoint folder**, keeping the folder structure intact.

---

*Questions on any asset? Reply to alagarschool@gmail.com referencing the row in the
spreadsheet.*
