#!/usr/bin/env node
/*
 * build-circulars.mjs — Folder-scan generator for the Circulars & Notices
 * list in news-events.html.
 * -----------------------------------------------------------------------
 * Regenerates the region between the `AUTO:circulars` markers directly from
 * the files in assets/docs/circulars/. To post a new circular:
 *
 *   1. Drop the file (PDF, or a scanned JPG/PNG) into assets/docs/circulars/
 *      named:   YYYY-MM-DD Title.pdf
 *          or:  YYYY-MM-DD Title ~ Subtitle.pdf
 *      e.g.     2027-03-12 Annual Day 2027 Schedule ~ For parents of all classes.pdf
 *   2. Run:  node tools/build-circulars.mjs
 *   3. Commit the new file + the updated news-events.html.
 *
 * Newest date first. The date drives the little day/month chip, the Title is
 * bolded, the optional "~ Subtitle" becomes the grey line under it, and the
 * link points straight at the file (so links can never be broken — the path
 * is read from disk). To remove a circular, delete its file and re-run.
 *
 * EMPTY STATE: if the folder has no valid circulars, the list is replaced
 * with a friendly "No circulars right now" placeholder card, so the section
 * still looks intentional. (Paths are resolved relative to this script, so
 * running it from any directory is safe.) Only the region between the AUTO
 * markers is rewritten; the rest of the page is untouched.
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(url.fileURLToPath(new URL("..", import.meta.url)));
const HTML = path.join(ROOT, "news-events.html");
const DIR_REL = "assets/docs/circulars";
const DIR = path.join(ROOT, DIR_REL);
const FILE_EXT = /\.(pdf|jpe?g|png|webp)$/i;
// YYYY-MM-DD  <Title>  [ ~ <Subtitle> ] .ext
const NAME_RE = /^(\d{4})-(\d{2})-(\d{2})[ _]+(.+?)(?:\s*~\s*(.+?))?\.(pdf|jpe?g|png|webp)$/i;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------- helpers (same conventions as build-gallery.mjs) ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const enc = (p) => p.split("/").map(encodeURIComponent).join("/"); // encode each path segment

function replaceRegion(html, name, inner) {
  const re = new RegExp(`([ \\t]*<!--\\s*AUTO:${name}:start[\\s\\S]*?-->)[\\s\\S]*?([ \\t]*<!--\\s*AUTO:${name}:end\\s*-->)`);
  if (!re.test(html)) throw new Error(`Markers for AUTO:${name} not found in news-events.html`);
  return html.replace(re, (_m, s, e) => {
    const indent = (s.match(/^[ \t]*/) || [""])[0];        // start-marker indentation
    return `${s}\n${inner}\n${indent}${e.replace(/^[ \t]*/, "")}`; // match it on the end marker
  });
}

/* ---------- scan the folder ---------- */
function collect() {
  if (!fs.existsSync(DIR)) return [];
  const items = [];
  for (const f of fs.readdirSync(DIR)) {
    if (!FILE_EXT.test(f)) continue;
    if (f.toLowerCase() === "readme.md") continue;
    const m = NAME_RE.exec(f);
    if (!m) { console.warn(`! skipped (name must be "YYYY-MM-DD Title[ ~ Subtitle].pdf"): ${f}`); continue; }
    const [, y, mo, d, title, sub] = m;
    const mi = parseInt(mo, 10) - 1;
    if (mi < 0 || mi > 11) { console.warn(`! skipped (bad month ${mo}): ${f}`); continue; }
    items.push({
      sort: `${y}${mo}${d}`,
      day: d,                       // keep two-digit day, e.g. "05"
      mon: MONTHS[mi],
      title: title.trim(),
      sub: (sub || "").trim(),
      href: `${DIR_REL}/${enc(f)}`,
    });
  }
  items.sort((a, b) => b.sort.localeCompare(a.sort)); // newest date first
  return items;
}

/* ---------- build the HTML ---------- */
const EMPTY_STATE =
  `      <div class="circ-empty">\n` +
  `        <span class="sym">event_note</span>\n` +
  `        <strong>No circulars right now</strong>\n` +
  `        <p>New notices &amp; circulars will be posted here through the year — please check back soon.</p>\n` +
  `      </div>`;

function render(items) {
  return items.map((it) => {
    const subHtml = it.sub ? `<small>${esc(it.sub)}</small>` : "";
    return `      <a class="circ" href="${attr(it.href)}" target="_blank" rel="noopener">` +
      `<span class="circ-date"><b>${esc(it.day)}</b><small>${esc(it.mon)}</small></span>` +
      `<span class="circ-body"><strong>${esc(it.title)}</strong>${subHtml}</span>` +
      `<span class="sym circ-go">arrow_outward</span></a>`;
  }).join("\n");
}

/* ---------- run ---------- */
const items = collect();
const inner = items.length ? render(items) : EMPTY_STATE;

let html = fs.readFileSync(HTML, "utf8");
html = replaceRegion(html, "circulars", inner);
fs.writeFileSync(HTML, html);

if (!items.length) {
  console.log(`news-events.html regenerated: no circulars — showing the empty-state placeholder.`);
  console.log(`  Drop files named "YYYY-MM-DD Title[ ~ Subtitle].pdf" in ${DIR_REL}/ and re-run to list them.`);
} else {
  console.log(`news-events.html regenerated: ${items.length} circular(s)`);
  items.forEach((it) => console.log(`  - ${it.sort}  ${it.title}${it.sub ? "  (" + it.sub + ")" : ""}`));
}
