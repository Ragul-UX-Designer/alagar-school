# Circulars & Notices — how to post one

Drop the circular here, then run the build command. No PHP, no database.

## 1. Name the file

```
YYYY-MM-DD Title.pdf
YYYY-MM-DD Title ~ Subtitle.pdf
```

- **YYYY-MM-DD** — the date shown on the little chip (e.g. `2027-03-12` → **12 Mar**).
- **Title** — the bold line. Use normal spaces.
- **~ Subtitle** — *optional* grey line under the title. Put ` ~ ` (space-tilde-space) before it.
- Extension can be **.pdf** (recommended) or a scan: **.jpg / .jpeg / .png / .webp**.

**Examples**

```
2027-03-12 Annual Day 2027 Schedule ~ For parents of all classes.pdf
2027-02-28 Term-II Examination Timetable ~ Classes I – XII.pdf
2027-01-05 Winter Break & Reopening Notice.pdf
```

## 2. Rebuild the page

From the project root:

```
node tools/build-circulars.mjs
```

This regenerates the **Circulars & Notices** list in `news-events.html` (newest
date first) with each item linking straight to its file. Then commit the new
file **and** the updated `news-events.html`.

## Notes

- **To remove** a circular: delete its file here and re-run the command.
- If this folder has **no circulars**, the section shows a friendly
  "No circulars right now" placeholder instead of an empty gap — so the page
  always looks intentional.
- Files that don't match the naming pattern are skipped with a warning.
- Keep titles short — long ones still work but read best at 1–2 lines.
