# Gokul — Motion Design Portfolio · Version 2

Version 2 follows the layout of **omse.co/work**, with your own identity and content. None of omse's media, copy, logo or fonts are used:

- **Header:** a big black toggle switch in the left column, level with giant rounded nav pills (Work · About · Contact). The current page's pill is black. When you scroll down, the nav pills slide up out of view one after another (about 0.55s each, 65ms apart) and the switch shrinks to a small grey toggle with the tags moving up under it. Back at the top, it returns. The switch turns hover video previews on or off (play or pause icon, remembered between visits, off by default with reduced motion).
- **Work grid:** two columns with a 16px gutter and generous row gaps. Tiles are top-aligned, with bold captions: title on the left, subtitle on the right.
- **Filters:** grey category tags wrap at the top of the left column, under the switch, and stay there as you scroll. The selected tag is black. On phones they become a scrolling row.
- **Project pages:** a sticky left column (round back button, big title, subtitle, credits). The right side has a full-width player, bold “Brief” text, process media in pairs or full width, and a large “Next project” link.
- **About and Contact:** separate pages in the same bold, large type.

Version 1 (the PORTO ROCHA-style layout) is saved untouched in `../portfolio-v1`.

> The site now shows your real work: 36 projects and the 2026 showreel, imported from your Google Drive folders (BRAND, EXPLAINER, Kinetic Type, Experiments, Showreel). Subtitles are plain category labels for now. Add descriptions, clients and credits in `src/data/projects.ts`.

## Adding new videos

1. Put the source files in a folder and list them in a tab-separated manifest: `Category<TAB>file name<TAB>file id`. The source file must be `<folder>/<id>.<ext>`.
2. Run `node scripts/import-media.mjs manifest.tsv <folder>`. This writes `full.mp4`, `preview.mp4` and `poster.jpg` into `public/media/<slug>/` and records each file's real size in `scripts/media-import.json`.
3. Add a `project(...)` line for it in `src/data/projects.ts`, or regenerate the whole list with `node scripts/build-projects.mjs`. Regenerating overwrites any hand edits.

GIFs become MP4 loops. Long films get a 6-second hover preview taken 15% of the way in, to skip black opening frames. The showreel is the item with category `Showreel`.

**Hosting note:** the converted media total about 414 MB. That is fine locally and on most static hosts, but for a public site consider hosting the long films (the AI episodes, DAA, Bloom, Kissht) on Vimeo or a video CDN and pointing `src` at those URLs.

---

## Run it

You need Node.js 18 or newer ([nodejs.org](https://nodejs.org)).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # layout + data tests
npm run build      # type-check + production build → dist/
npm run preview    # serve the built site
```

## Add or replace a project

1. Put the files in `public/media/<slug>/`:
   - `poster.jpg`: the first frame of the preview (WebP/AVIF also work)
   - `preview.mp4`: a short muted loop, H.264, ideally 3–8 s and under about 2 MB
   - optional `full.mp4` for the project page, plus extra stills and clips
2. Run `npm run probe` to print the real pixel size of every file.
3. Edit **`src/data/projects.ts`**. It is the only file you need to touch. Each project has:

```ts
{
  slug: 'my-film',
  title: 'My Film',
  subtitle: 'One-line statement shown under the tile',
  category: ['Brand', 'Explainer'],          // from src/data/site.ts
  year: 2026, client: 'Client name', role: 'Direction, animation',
  tools: ['After Effects', 'Cinema 4D'], deliverables: ['Launch film'],
  description: 'Two or three sentences.',
  cover: {
    id: 'my-film-video', type: 'video',
    src: '/media/my-film/full.mp4',        // played with controls on the project page
    preview: '/media/my-film/preview.mp4', // hover loop in the gallery
    poster: '/media/my-film/poster.jpg',
    width: 1080, height: 1920,             // ← real pixel size: this drives the layout
    alt: 'Describe what is on screen',
    layoutHint: 'normal',                  // optional: hero | wide | normal | small | pairWithNext
    crop: 'contain',                       // default; 'cover' + focalPoint only if you want cropping
  },
  media: [/* cover + process images/videos for the detail page */],
  placeholder: false,
  order: 1,
}
```

The sidebar index, filters, counts, gallery and detail pages all read from this one array. You never write column spans by hand.

Site copy (bio, email, links, time zone, category list) lives in `src/data/site.ts`.

To delete the demo content, remove the `demo(...)` entries and the folders in `public/media/`. `npm run media` regenerates the demo clips (needs the `ffmpeg-static` dev dependency).

## How the layout is computed (v2)

`src/lib/work-layout.ts`:

- Every tile shows its media uncropped (`object-fit: contain`), so each video keeps its native shape.
- **Ultrawide (≥ 2.1:1)** or `hero` / `wide` items take both columns. On project pages the threshold is 1.1:1, so every landscape item is full width.
- **Half-width tiles** are framed no taller than **4:5**. A 9:16 reel sits centred on a light grey ground inside that frame, so it doesn't tower over the tile beside it. On phones (one column), tiles use their native shape down to 9:16.
- **No holes:** if a full-width item would leave the tile before it alone in its row, it drops into the empty half instead, as a short wide banner beside a taller tile. A `hero` item always stays full width.
- Source order is never changed, so tab order matches what you see. Adding a project needs no layout code.

## Video behaviour

- Posters load first. Only the first row loads eagerly; the rest lazy-load.
- On desktop, hovering for 120ms mounts a muted, inline, looping `<video>` for **that tile only**. Leaving the tile unmounts it, which also resets it.
- Only one preview plays at a time (`src/lib/preview.tsx`). Previews also stop when you scroll the tile away (IntersectionObserver), switch tabs, change the filter or change route.
- Touch devices, keyboard users, people with *reduced motion* turned on and *data saver* users get an explicit **Preview / Pause** button instead of hover autoplay. Tapping the tile itself always opens the project.
- If a video fails to load, the poster stays and the play control is removed.

## Deploy (live)

Live at **https://gokul-portfolio-orpin-beta.vercel.app**. Vercel project `gokul-portfolio`; the full films stream from the Blob store `gokul-films`.

- **Site** (code, hover clips, posters, about 16 MB) deploys from this folder. `.vercelignore` leaves out every `full.mp4` and the `.env*` secret files.
- **Films** live on Vercel Blob at `films/<slug>/full.mp4`. The site finds them through the `VITE_FILM_BASE` environment variable, which is set on Vercel. Locally it falls back to `/media`.

To publish changes (run from this folder, with the bundled Node on your PATH):

```bash
export PATH="../.tools/node-v22.23.4-darwin-arm64/bin:$PATH"
npm run upload-films   # only if you added or changed films; skips ones already uploaded
npm run deploy         # = vercel --prod
```

The free plan includes 1 GB of Blob storage and 10 GB of film streaming per month. Usage is under Vercel → Storage → gokul-films.

## Project map

```
src/
  data/projects.ts        ← your work (single source of truth)
  data/site.ts            ← bio, contact, categories
  data/types.ts
  lib/work-layout.ts      ← 2-column ratio rules (+ .test.ts)
  lib/preview.tsx         ← one-preview-at-a-time controller
  lib/hooks.ts            ← resize, media queries, local time
  components/             ← SiteHeader (logo + nav pills), CategoryFilter (fixed tags), WorkGrid, MediaTile
  pages/                  ← WorkPage (/?category=…), ProjectPage (/work/:slug), InfoPages (/about, /contact), NotFound
  styles/app.css          ← tokens measured from the reference + layout
scripts/
  generate-placeholders.mjs  probe-media.mjs
```

## Reference notes (v2)

These values were measured on omse.co/work at 375, 1024 and 1440px:

- **Page:** white background, black bold grotesk type (Inter Tight 700 stands in for omse's licensed font).
- **Spacing:** 24 / 16 / 12px page edge; a 288 / 240px left column; 16px column gutter; 64px row gap.
- **Nav pills:** 128 / 112 / 40px tall, 24px radius, 4.5rem labels.
- **Text:** 24px captions, 30px body paragraphs, 60px project titles.
- **Filter tags:** 40px tall with a 12px radius.

Not verified: animations, hover effects and how omse loads its media.
