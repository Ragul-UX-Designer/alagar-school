#!/usr/bin/env node
/*
 * build-gallery.mjs — Folder-scan generator for student-life.html
 * -----------------------------------------------------------------
 * Regenerates the Competitions, Achievement and Gallery sections (plus the
 * gallery modals and the lightbox `LB` data object) directly from the image
 * folders under assets/img/. To add next year's photos:
 *
 *   1. Drop images into the right folders (see NAMING below).
 *   2. If needed, add editorial labels to tools/gallery.config.json.
 *   3. Run:  node tools/build-gallery.mjs
 *
 * The script only rewrites the regions between the `AUTO:*` markers in
 * student-life.html — everything else (incl. the ECA activity data) is left
 * untouched. Because every image path is read from disk, generated links
 * cannot be broken.
 *
 * NAMING
 *   Gallery:      assets/img/Gallery/<Group>/<Event>/<anything>.jpg
 *                 <Group> = Academic2026-27  or  Buds-Blooms2026-27
 *                 <Event> = Sports-Day  (hyphens, no spaces)
 *   Achievement:  assets/img/Achievement/<Year>/<anything>.jpg   (Year = 2026-27)
 *   Competitions: assets/img/Competitions/<Prefix><n>.jpg        (Prefix from config)
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(url.fileURLToPath(new URL("..", import.meta.url)));
const HTML = path.join(ROOT, "student-life.html");
const CFG = path.join(ROOT, "tools", "gallery.config.json");
const IMG_EXT = /\.(jpe?g|png|webp)$/i;

const cfg = JSON.parse(fs.readFileSync(CFG, "utf8"));

/* ---------- helpers ---------- */
const nat = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const enc = (p) => p.split("/").map(encodeURIComponent).join("/"); // encode each path segment
const j = (s) => JSON.stringify(s);

function imagesIn(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => IMG_EXT.test(f)).sort(nat);
}
function dirsIn(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(nat);
}
function replaceRegion(html, name, kind, inner) {
  const [o, c] = kind === "js" ? ["\\/\\*", "\\*\\/"] : ["<!--", "-->"];
  const re = new RegExp(`([ \\t]*${o}\\s*AUTO:${name}:start[\\s\\S]*?${c})[\\s\\S]*?([ \\t]*${o}\\s*AUTO:${name}:end\\s*${c})`);
  if (!re.test(html)) throw new Error(`Markers for AUTO:${name} not found in student-life.html`);
  return html.replace(re, (_m, s, e) => {
    const indent = (s.match(/^[ \t]*/) || [""])[0];        // start-marker indentation
    return `${s}\n${inner}\n${indent}${e.replace(/^[ \t]*/, "")}`; // match it on the end marker
  });
}

/* event folder name -> human title (strip leading KG-, hyphens->spaces, split letter|digit) */
function eventTitle(folder) {
  let s = folder.replace(/^KG-/, "");
  s = s.split("-").join(" ").replace(/([A-Za-z])(\d)/g, "$1 $2").trim();
  return s;
}

/* video file name -> LB key slug (alphanumerics only, so it's a valid JS identifier) */
function videoSlug(file) {
  return file.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9]/g, "");
}

/* Self-hosted video tiles + lightbox entries for one gallery group.
 * Clips are declared in gallery.config.json -> videos["<Group>"]; the .mp4 files
 * live on disk (git-ignored) under assets/img/Gallery/<Group>/. A tile with no
 * poster shows the video's own first frame (src#t=1); the lightbox plays it with
 * native controls. Video tiles keep a play icon, not a zoom icon. */
function groupVideos(group, key) {
  const list = (cfg.videos || {})[group] || [];
  const tiles = [], lb = [];
  for (const v of list) {
    const abs = path.join(ROOT, "assets/img/Gallery", group, v.file);
    if (!fs.existsSync(abs)) { console.warn(`! video "${group}/${v.file}" not found on disk — skipped`); continue; }
    const title = v.title || eventTitle(videoSlug(v.file));
    const lbKey = `v_${key}_${videoSlug(v.file)}`;
    const srcRel = `Gallery/${group}/${enc(v.file)}`;                 // relative to assets/img/
    const posterRel = v.poster ? `Gallery/${group}/${enc(v.poster)}` : "";
    const thumb = posterRel
      ? `<img src="assets/img/${posterRel}" alt="${attr(title)}" loading="lazy" decoding="async">`
      : `<video src="assets/img/${srcRel}#t=1" muted playsinline preload="metadata" tabindex="-1"></video>`;
    tiles.push(
      `        <button type="button" class="gitem vid-tile lb-open" data-lb="${lbKey}">${thumb}<span class="g-ov"><span class="sym">play_circle</span><span class="g-title">${esc(title)}</span></span></button>`
    );
    const item = `{v:A+${j(srcRel)}${posterRel ? `,poster:A+${j(posterRel)}` : ""}}`;
    lb.push(`    ${lbKey}:{t:${j(title)},i:[${item}]},`);
  }
  return { tiles, lb, count: tiles.length };
}

/* ---------- 1. COMPETITIONS ---------- */
function buildCompetitions() {
  const cards = [];
  const lb = [];
  for (const c of cfg.competitions) {
    const imgs = imagesIn("assets/img/Competitions").filter((f) => f.startsWith(c.prefix)).sort(nat);
    if (!imgs.length) { console.warn(`! competition "${c.key}": no images with prefix "${c.prefix}"`); continue; }
    const cover = enc("Competitions/" + imgs[0]);
    cards.push(
      `      <button type="button" class="gitem lb-open" data-lb="${c.key}"><img src="assets/img/${cover}" alt="${attr(c.title)}" loading="lazy" decoding="async"><span class="g-ov"><span class="sym">zoom_in</span><span class="g-title">${esc(c.title)}</span></span></button>`
    );
    const arr = imgs.map((f) => `A+${j("Competitions/" + enc(f))}`).join(",");
    lb.push(`    ${c.key}:{t:${j(c.title)},d:${j(c.desc)},i:[${arr}]},`);
  }
  return { cards: cards.join("\n"), lb: lb.join("\n") };
}

/* ---------- 2. ACHIEVEMENT ---------- */
const ACH_RECENT = 3; // show this many newest years inline; older years collapse behind a link + modal
function buildAchievement() {
  const years = [...cfg.achievement.years].sort((a, b) => nat(b.folder, a.folder)); // newest first
  const blocks = [];
  const older = []; // collected older years -> rendered compactly after the recent ones

  years.forEach((y, i) => {
    const present = imagesIn("assets/img/Achievement/" + y.folder);
    const ordered = (y.order || []).filter((f) => present.includes(f));
    for (const f of present) if (!ordered.includes(f)) ordered.push(f); // append any new files
    const label = y.folder.replace("-", "–");
    const key = "ach" + y.folder.split("-").map((p) => p.slice(-2)).join(""); // 2023-24 -> ach2324
    const tiles = (indent) => ordered.map((f) => {
      const title = (y.titles || {})[f];
      const alt = title || `Achievement ${y.folder}`;
      const src = `assets/img/Achievement/${y.folder}/${enc(f)}`;
      const cap = title ? `<span class="g-title">${esc(title)}</span>` : "";
      return `${indent}<button type="button" class="gitem lb-img" data-full="${src}"><img src="${src}" alt="${attr(alt)}" loading="lazy" decoding="async" onerror="this.closest('.gitem').style.display='none'"><span class="g-ov"><span class="sym">zoom_in</span>${cap}</span></button>`;
    }).join("\n");

    if (i < ACH_RECENT) {
      // recent years — shown inline as a full tile grid
      blocks.push(
        `    <div class="center"><span class="ach-year"><span class="sym">military_tech</span> ${label}</span></div>\n` +
        `    <p class="ach-highlights center" style="margin-left:auto;margin-right:auto">${esc(y.highlights)}</p>\n` +
        `    <div class="tile-grid">\n${tiles("      ")}\n    </div>`
      );
    } else {
      older.push({ label, key, highlights: y.highlights, count: ordered.length, tiles });
    }
  });

  // one modal per older year (position:fixed, so placement here is fine)
  const modal = (o) =>
    `    <div class="gmodal" id="gm-${o.key}" aria-hidden="true" role="dialog" aria-label="${attr(o.label)} Achievements">\n` +
    `      <div class="gmodal__panel">\n` +
    `        <div class="gmodal__head">\n` +
    `          <div><strong>${o.label} Achievements</strong><small>${esc(o.highlights)}</small></div>\n` +
    `          <button type="button" class="gmodal__close" aria-label="Close">&times;</button>\n` +
    `        </div>\n` +
    `        <div class="gmodal__body">\n          <div class="tile-grid">\n${o.tiles("            ")}\n          </div>\n        </div>\n` +
    `      </div>\n    </div>`;

  if (older.length === 1) {
    // single older year — keep the roomier archive row (badge + summary + count)
    const o = older[0];
    blocks.push(
      `    <button type="button" class="ach-archive" data-modal="gm-${o.key}" aria-label="View ${attr(o.label)} achievements">\n` +
      `      <span class="aa-badge"><span class="sym">military_tech</span></span>\n` +
      `      <span class="aa-text">\n` +
      `        <span class="aa-year">${o.label}</span>\n` +
      `        <span class="aa-sub">${esc(o.highlights)}</span>\n` +
      `      </span>\n` +
      `      <span class="aa-go"><span>${o.count} photo${o.count === 1 ? "" : "s"}</span> <span class="sym">arrow_forward</span></span>\n` +
      `    </button>\n` +
      modal(o)
    );
  } else if (older.length >= 2) {
    // several older years — compact wrapping chips to save vertical space
    const chips = older.map((o) =>
      `      <button type="button" class="ach-chip" data-modal="gm-${o.key}" aria-label="View ${attr(o.label)} achievements">` +
      `<span class="sym">military_tech</span> ${o.label} <span class="cc-count">${o.count}</span></button>`
    ).join("\n");
    blocks.push(
      `    <div class="center"><h3 class="ach-archive-head">Previous Years</h3></div>\n` +
      `    <div class="ach-chips">\n${chips}\n    </div>\n` +
      older.map(modal).join("\n")
    );
  }

  return blocks.join("\n\n");
}

/* ---------- 3. GALLERY (cards + modals + LB data) ---------- */
function galleryGroups() {
  return dirsIn("assets/img/Gallery").map((group) => {
    const isKG = group.startsWith("Buds-Blooms");
    const year = group.replace("Buds-Blooms", "").replace("Academic", ""); // 2025-26
    const key = (isKG ? "bb" : "ac") + year.split("-").map((p) => p.slice(-2)).join(""); // 2025-26 -> 2526
    const name = isKG ? `Buds & Blooms ${year}` : `Academic Year ${year}`;
    const category = isKG ? "Kindergarten" : "School events & activities";
    const events = dirsIn(`assets/img/Gallery/${group}`).map((ev) => {
      const imgs = imagesIn(`assets/img/Gallery/${group}/${ev}`);
      return { ev, imgs, key: `g_${key}_${ev.split("-").join("")}`, title: eventTitle(ev) };
    }).filter((e) => e.imgs.length);
    const photos = events.reduce((n, e) => n + e.imgs.length, 0);
    const yearNum = parseInt(year, 10);
    return { group, isKG, year, yearNum, key, name, category, events, photos };
  }).sort((a, b) => b.yearNum - a.yearNum || (a.isKG === b.isKG ? 0 : a.isKG ? -1 : 1)); // year desc, KG first
}

const GAL_RECENT_YEARS = 4; // show this many newest academic years as album cards; older years -> chips
function buildGallery(groups) {
  const recentCards = [], olderChips = [], modals = [], lb = [];
  const recentYears = [...new Set(groups.map((g) => g.year))].slice(0, GAL_RECENT_YEARS); // groups are year-desc
  for (const g of groups) {
    const vids = groupVideos(g.group, g.key);
    const coverRel = (cfg.galleryCovers || {})[g.key] ||
      (g.events[0] ? `${g.events[0].ev}/${g.events[0].imgs[0]}` : "");
    if (!coverRel) { console.warn(`! gallery group "${g.group}" has no images for a cover — skipped`); continue; }
    const cover = `assets/img/Gallery/${g.group}/${enc(coverRel)}`;
    const vidSuffix = vids.count ? ` &middot; ${vids.count} video${vids.count === 1 ? "" : "s"}` : "";
    if (recentYears.includes(g.year)) {
      recentCards.push(
        `        <button type="button" class="gitem album-card" data-album="${g.key}"><img src="${cover}" alt="${attr(g.name)}" loading="lazy" decoding="async"><span class="g-ov"><span class="sym">collections</span><span class="g-title">${esc(g.name)}<small>${esc(g.category)} &middot; ${g.events.length} albums${vidSuffix}</small></span></span></button>`
      );
    } else {
      // older years collapse into compact chips (same treatment as Young Achievers)
      const chipLabel = `${g.isKG ? "Buds & Blooms" : "Academic"} ${g.year.replace("-", "–")}`;
      olderChips.push(
        `        <button type="button" class="ach-chip" data-modal="gm-${g.key}" aria-label="Browse ${attr(g.name)}">` +
        `<span class="sym">${g.isKG ? "child_care" : "photo_library"}</span> ${esc(chipLabel)} <span class="cc-count">${g.events.length}</span></button>`
      );
    }
    const evBtns = g.events.map((e) => {
      const first = `assets/img/Gallery/${g.group}/${e.ev}/${enc(e.imgs[0])}`;
      return `        <button type="button" class="gitem lb-open" data-lb="${e.key}"><img src="${first}" alt="${attr(e.title)}" loading="lazy" decoding="async"><span class="g-ov"><span class="sym">photo_library</span><span class="g-title">${esc(e.title)}</span></span></button>`;
    });
    // videos lead the album modal, followed by the photo events
    const gridBtns = [...vids.tiles, ...evBtns].join("\n");
    const photosPart = `${g.photos} photos in ${g.events.length} albums${vidSuffix}`;
    modals.push(
      `<div class="gmodal" id="gm-${g.key}" aria-hidden="true" role="dialog" aria-label="${attr(g.name)} albums">\n` +
      `  <div class="gmodal__panel">\n` +
      `    <div class="gmodal__head">\n` +
      `      <div><strong>${esc(g.name)}</strong><small>${esc(g.category)} &middot; ${photosPart}</small></div>\n` +
      `      <button type="button" class="gmodal__close" aria-label="Close albums">&times;</button>\n` +
      `    </div>\n` +
      `    <div class="gmodal__body">\n      <div class="tile-grid">\n${gridBtns}\n      </div>\n    </div>\n` +
      `  </div>\n</div>`
    );
    for (const e of g.events) {
      const arr = e.imgs.map((f) => `A+${j(`Gallery/${g.group}/${e.ev}/${enc(f)}`)}`).join(",");
      lb.push(`    ${e.key}:{t:${j(e.title)},i:[${arr}]},`);
    }
    for (const line of vids.lb) lb.push(line);
  }
  let cards = `      <div class="tile-grid">\n${recentCards.join("\n")}\n      </div>`;
  if (olderChips.length) {
    cards += `\n      <div class="center"><h3 class="ach-archive-head">Previous Years</h3></div>\n` +
             `      <div class="ach-chips">\n${olderChips.join("\n")}\n      </div>`;
  }
  return { cards, modals: modals.join("\n"), lb: lb.join("\n") };
}

/* ---------- optional: optimize dropped photos first (--optimize) ---------- */
if (process.argv.includes("--optimize")) {
  const script = path.join("tools", "optimize-images.py");
  const folderArgs = process.argv.slice(2).filter((a) => !a.startsWith("-")); // pass through any folder args
  let ran = false;
  for (const cmd of ["python", "py", "python3"]) {
    const r = spawnSync(cmd, [script, ...folderArgs], { cwd: ROOT, stdio: "inherit" });
    if (r.error && r.error.code === "ENOENT") continue;   // this launcher isn't installed — try the next
    ran = r.status === 0;
    if (ran) break;
    console.warn(`! "${cmd}" exited with code ${r.status}; trying another Python launcher…`);
  }
  if (!ran) console.warn("! Could not run tools/optimize-images.py (Python/Pillow not found). Continuing without optimization.");
}

/* ---------- assemble ---------- */
const comp = buildCompetitions();
const ach = buildAchievement();
const groups = galleryGroups();
const gal = buildGallery(groups);

let html = fs.readFileSync(HTML, "utf8");
html = replaceRegion(html, "competitions", "html", comp.cards);
html = replaceRegion(html, "achievement", "html", ach);
html = replaceRegion(html, "gallery-cards", "html", gal.cards);
html = replaceRegion(html, "gallery-modals", "html", gal.modals);
html = replaceRegion(html, "lb-data", "js", [comp.lb, gal.lb].join("\n"));

/* ---------- self-check: every data-lb / data-album resolves ---------- */
const lbKeys = new Set([...html.matchAll(/\bLB\s*=|:\{t:/g)] && [...html.matchAll(/^\s*([A-Za-z0-9_]+):\{t:/gm)].map((m) => m[1]));
const errors = [];
for (const m of html.matchAll(/data-lb="([^"]+)"/g)) if (!lbKeys.has(m[1])) errors.push(`data-lb "${m[1]}" has no LB entry`);
for (const m of html.matchAll(/data-album="([^"]+)"/g)) if (!html.includes(`id="gm-${m[1]}"`)) errors.push(`data-album "${m[1]}" has no modal`);
if (errors.length) { console.error("CONSISTENCY ERRORS:\n" + errors.join("\n")); process.exit(1); }

fs.writeFileSync(HTML, html);
const totalPhotos = groups.reduce((n, g) => n + g.photos, 0);
const totalVideos = Object.values(cfg.videos || {}).reduce((n, arr) => n + arr.length, 0);
console.log("student-life.html regenerated:");
console.log(`  competitions : ${cfg.competitions.length}`);
console.log(`  achievement  : ${cfg.achievement.years.length} years`);
console.log(`  gallery      : ${groups.length} albums, ${groups.reduce((n, g) => n + g.events.length, 0)} events, ${totalPhotos} photos, ${totalVideos} videos`);
groups.forEach((g) => console.log(`     - ${g.key}  ${g.name}  (${g.events.length} events, ${g.photos} photos)`));
