# Gallery / Achievement / Competitions — how to add photos

The **Gallery**, **Young Achievers (Achievement)** and **Competitions** sections of
`student-life.html` are **generated from the image folders** by
`tools/build-gallery.mjs`. You don't hand-edit the HTML for these sections — you drop
images into the right folders and run one command.

```bash
node tools/build-gallery.mjs
```

The script only rewrites the five regions marked with `<!-- AUTO:* -->` / `/* AUTO:* */`
in `student-life.html`. Everything else (including the ECA activity data) is left alone.
Because every path is read from disk, **generated image links can never be broken**.

---

## Add a new academic year to the Gallery

1. Create the folders and drop the photos (hyphens in names, **no spaces**):

   ```
   assets/img/Gallery/Academic2026-27/Sports-Day/Sports-Day1.jpg
   assets/img/Gallery/Academic2026-27/Sports-Day/Sports-Day2.jpg
   assets/img/Gallery/Academic2026-27/Annual-Day/AnnualDay1.jpg
   ...
   # Kindergarten album group:
   assets/img/Gallery/Buds-Blooms2026-27/Blue-Day/BlueDay1.jpg
   ```

   * `<Group>` = `Academic<YYYY-YY>` or `Buds-Blooms<YYYY-YY>`
   * `<Event>` = one folder per event (hyphens, no spaces)
   * Photo file names can be anything ending in `.jpg/.jpeg/.png/.webp`; they are
     shown in natural order (`...2` before `...10`).

2. *(optional)* Pick a cover for the album card in `tools/gallery.config.json` →
   `galleryCovers` (defaults to the first event's first photo):

   ```json
   "galleryCovers": { "ac2627": "Annual-Day/AnnualDay1.jpg" }
   ```
   Album key = `ac`/`bb` + last two digits of each year part → `Academic2026-27` = `ac2627`.

3. Run `node tools/build-gallery.mjs`.

The album card, its pop-up modal, per-event titles, photo counts, the lightbox data and
the newest-first ordering are all produced automatically. Event titles come from the
folder name (`Fancy-Dress-Culture` → "Fancy Dress Culture"; a leading `KG-` is dropped
for Buds & Blooms).

## Add a video to an album

Videos are **self-hosted** (served from the site, played inline in the lightbox) but are
**too large for git** — they are `.gitignore`d (`assets/img/Gallery/**/*.mp4`) and must be
**uploaded to the server by hand / FTP** alongside the code, or they'll 404 in production.

1. Drop the `.mp4` directly in the album's group folder (hyphens, no spaces):

   ```
   assets/img/Gallery/Buds-Blooms2026-27/Vegetable-Day.mp4
   ```

2. Declare it in `tools/gallery.config.json` → `videos`, keyed by the **group folder**:

   ```json
   "videos": {
     "Buds-Blooms2026-27": [
       { "file": "Vegetable-Day.mp4", "title": "Vegetable Day", "poster": "" }
     ]
   }
   ```
   * `file` — the clip, relative to `assets/img/Gallery/<Group>/`.
   * `title` — caption shown on the tile and in the lightbox.
   * `poster` *(optional)* — a still image (same folder) used as the tile thumbnail and
     video poster. **Leave blank** and the tile shows the video's own first frame
     (`src#t=1`) — no poster file needed.

3. Run `node tools/build-gallery.mjs`.

Video tiles appear **first** inside the album's modal (before the photo events), carry a
**play** icon (never a zoom cue), and open the clip with native `<video>` controls in the
lightbox. The build **skips (with a warning) any clip whose file is missing on disk**, so
generated links stay unbreakable. The album card / modal counts read e.g.
"17 photos in 5 albums · 3 videos".

## Add a new Achievement year

1. Drop images into `assets/img/Achievement/2026-27/`.
2. Add the year to `tools/gallery.config.json` → `achievement.years` with its
   `highlights` line, an optional `order`, and optional per-file `titles`.
   (Files not listed in `order` are appended automatically; files with no title show
   without a caption.)
3. Run the script.

## Add / change a Competition

Edit `tools/gallery.config.json` → `competitions`. Each entry groups the files in
`assets/img/Competitions/` whose name starts with `prefix`:

```json
{ "key": "sciencefair", "prefix": "Science-Fair", "title": "Science Fair", "desc": "…" }
```

---

## Optimise photos for the web (optional)

Big camera/phone photos should be shrunk before they go on the site. An optional
step does this automatically — resizing to a max **1600px** long edge and
compressing to **under ~300 KB** (sRGB), and auto-straightening rotated phone
photos via their EXIF data.

```bash
# preview what would change (writes nothing):
python tools/optimize-images.py --dry-run

# optimise the gallery / achievement / competition folders in place:
python tools/optimize-images.py

# just one folder:
python tools/optimize-images.py assets/img/Gallery/Academic2026-27
```

Or do it as part of generating, in a single command:

```bash
node tools/build-gallery.mjs --optimize
```

Notes:
- Photos already within the limits are **skipped**, so re-running is safe and does
  not re-compress good images (no quality loss on repeat runs).
- It **overwrites files in place** — keep your full-resolution originals elsewhere
  (the shared drive) as the golden copy.
- Only the Gallery/Achievement/Competitions folders are touched; the logo, hero
  banners, portraits and og-image are left alone.
- Needs Python + Pillow (already installed on the build machine). If Python isn't
  found, `--optimize` prints a warning and generation continues normally.

---

## Safety

The script self-checks that every `data-lb` has a lightbox entry and every `data-album`
has a modal, and **aborts without writing** if anything is inconsistent. After running,
you can double-check with the repo's link audit that all references resolve.
