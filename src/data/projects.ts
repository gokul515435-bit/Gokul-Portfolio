import type { Category, PortfolioMedia, Project } from './types';

/*
 * ─── YOUR WORK ────────────────────────────────────────────────────────────────
 * Generated from your Google Drive folders by scripts/import-media.mjs, then
 * edit freely: reorder lines, rename titles, add subtitles/credits.
 * Files live in /public/media/<slug>/ (full.mp4, preview.mp4, poster.jpg).
 * width/height are the real pixel size of full.mp4 — they drive the layout.
 *
 * To add credits to one project, pass a last argument, e.g.
 *   project(1, 'oreo', 'Oreo', 'Brand film', ['Brand'], 1920, 1080, true,
 *     { year: 2025, client: 'Oreo', role: 'Animation', tools: ['After Effects'] }),
 * ────────────────────────────────────────────────────────────────────────────
 */

const M = (slug: string, file: string) => `/media/${slug}/${file}`;
/** Full-length films: served from Vercel Blob in production (VITE_FILM_BASE), from /media locally. */
const FILM_BASE = (import.meta.env.VITE_FILM_BASE as string | undefined)?.replace(/\/$/, '') || '/media';
const FILM = (slug: string) => `${FILM_BASE}/${slug}/full.mp4`;

function project(
  order: number,
  slug: string,
  title: string,
  subtitle: string,
  category: Category[],
  width: number,
  height: number,
  _hasAudio: boolean,
  extra: Partial<Project> = {},
): Project {
  const cover: PortfolioMedia = {
    id: `${slug}-video`,
    type: 'video',
    src: FILM(slug),
    preview: M(slug, 'preview.mp4'),
    poster: M(slug, 'poster.jpg'),
    width,
    height,
    alt: `${title}: ${subtitle}. Motion design by Gokul Muthyala`,
  };
  return { slug, title, subtitle, category, cover, media: [cover], order, ...extra };
}

// The first argument of project(...) sets the order on the Work page (1 = first). Lines below are grouped by category, not by order.
export const projects: Project[] = [
  // ── Brand ──
  project(12, '2020-tax', '2020 Tax', 'AI tax refunds, made simple', ['Brand'], 1080, 1920, true, {
    description: 'A vertical launch film for an AI-powered tax refund app built for PAYE workers in Ireland. Bright gradient UI scenes walk through scanning documents, analysing data and claiming a refund, paced for social feeds.',
    deliverables: ['Vertical social film (9:16)', '1:15'],
  }),
  project(4, 'kissht-todo', 'Kissht ToDo', 'Money rules, in collage', ['Brand'], 1920, 1080, true, {
    description: 'A brand film for Kissht that turns personal-finance rules — emergency funds, credit scores, getting out of debt — into a playful paper-collage world of cut-outs, gauges and notebook textures.',
    deliverables: ['Brand film (16:9)', '2:47'],
  }),
  project(2, 'lost-poem', 'Lost Poem', 'An illustrated poem among the stars', ['Brand'], 1280, 720, true, {
    description: 'A Hindi poem brought to life through hand-drawn illustration: a moon, planets and flowing cosmic hair drift across a deep-blue night as the lyrics unfold on screen.',
    deliverables: ['Illustrated film (16:9)', '2:01'],
  }),
  project(1, 'oreo', 'Oreo', 'A cricket legacy, in a limited-edition pack', ['Brand'], 1270, 720, true, {
    description: 'A campaign film for a cricket-themed limited-edition Oreo pack — bold LEGACIES typography, stadium energy and a punchy product reveal that ends on the collect-now call to action.',
    deliverables: ['Campaign film (16:9)', '1:04'],
  }),
  // ── Explainer ──
  project(15, 'ai-episode-1', 'Air India — Episode 1', 'Why happy customers come back', ['Explainer'], 1920, 1080, true, {
    description: 'The first film in an animated explainer series on customer experience at Air India. A friendly host introduces Net Promoter Score and why every touchpoint, from booking to baggage, shapes loyalty.',
    deliverables: ['Explainer series, episode 1 (16:9)', '3:38'],
  }),
  project(9, 'ai-episode-2', 'Air India — Episode 2', 'Promoters, passives and the cabin', ['Explainer'], 1920, 1080, true, {
    description: 'Episode two follows the cabin crew to show how promoters, passives and detractors are measured — balancing scales, seat maps and character animation keep the numbers human.',
    deliverables: ['Explainer series, episode 2 (16:9)', '4:10'],
  }),
  project(24, 'ai-episode-3', 'Air India — Episode 3', 'Listening at every step of the journey', ['Explainer'], 1920, 1080, true, {
    description: 'From the cockpit radar to post-flight surveys, episode three animates how passenger feedback is captured across the journey and turned into on-time, better-rated flights.',
    deliverables: ['Explainer series, episode 3 (16:9)', '4:38'],
  }),
  project(30, 'ai-episode-4', 'Air India — Episode 4', 'Measure, act, measure again', ['Explainer'], 1920, 1080, true, {
    description: 'The series closes on teamwork: isometric airport operations, turning gears and a framework that links every department to one goal — measure, act and measure again.',
    deliverables: ['Explainer series, episode 4 (16:9)', '4:21'],
  }),
  project(7, 'bloom-icas', 'Bloom iCAS', 'Catching incorrect healthcare claims', ['Explainer'], 1920, 1080, true, {
    description: 'An isometric explainer for iCAS, an AI system that audits healthcare claims. Leaking money, data stacks and a friendly robot build up to the results: higher detection of incorrect claims and faster decisions.',
    deliverables: ['Product explainer (16:9)', '2:14'],
  }),
  project(21, 'daa', 'DAA', 'Turning claim denials around', ['Explainer'], 1920, 1080, true, {
    description: 'A companion explainer on handling denied healthcare claims — documents are scanned, flagged and routed between hospitals and payers in a clean isometric system of paths and characters.',
    deliverables: ['Product explainer (16:9)', '2:48'],
  }),
  // ── Kinetic type & logo motion ──
  project(36, 'adidas', 'Adidas', 'Logo motion study', ['Kinetic Type'], 1080, 1080, false, {
    description: 'The three-stripe mark extrudes into 3D and spins through flat colour before settling back into the logo — a short loop about weight and rhythm.',
    deliverables: ['Square loop (1:1)', '0:03'],
  }),
  project(32, 'before-after', 'Before After', 'Sticker type that flips', ['Kinetic Type'], 1080, 1080, false, {
    description: 'Chunky green sticker lettering snaps between BEFORE and AFTER — a tight two-second loop built for transitions and reveals.',
    deliverables: ['Square loop (1:1)', '0:02'],
  }),
  project(35, 'behance', 'Behance', 'Logo motion study', ['Kinetic Type'], 1080, 1080, false, {
    description: 'The Be wordmark grows out of a plus-shaped wipe and bounces its accent into place — a quick, elastic logo sting.',
    deliverables: ['Square loop (1:1)', '0:03'],
  }),
  project(6, 'check', 'Check', 'Layered type, one click', ['Kinetic Type'], 1080, 1080, false, {
    description: 'A cursor clicks CHECK and the word multiplies into stacked, colour-shifted echoes before collapsing back into one bold sticker.',
    deliverables: ['Square loop (1:1)', '0:07'],
  }),
  project(14, 'connect-shapes', 'Connect Shapes', 'Numbers pulled on strings', ['Kinetic Type', 'Experiments'], 1920, 1080, false, {
    description: 'A countdown of 3D numerals — 8, 6, 4, 2 — each tethered by dozens of curved threads to a single point, revealing the vector handles behind the motion.',
    deliverables: ['Loop (16:9)', '0:10'],
  }),
  project(34, 'cred', 'CRED', 'Logo line reveal', ['Kinetic Type'], 1920, 1920, false, {
    description: 'A single line traces the CRED shield on violet, drawing the mark stroke by stroke until it locks into place.',
    deliverables: ['Square loop (1:1)', '0:05'],
  }),
  project(8, 'desire', 'Desire', 'Spoken word, in motion', ['Kinetic Type'], 1920, 1080, false, {
    description: 'Word-by-word captions with little ink flourishes animate the line "desire is the root cause of sorrow" — kinetic subtitles with personality.',
    deliverables: ['Kinetic captions (16:9)', '0:06'],
  }),
  project(31, 'google-maps', 'Google Maps', 'Logo motion study', ['Kinetic Type'], 1920, 1920, false, {
    description: 'The colourful map pin unfolds from a swirling ribbon of the brand colours and lands on the Google Maps lock-up.',
    deliverables: ['Square loop (1:1)', '0:04'],
  }),
  project(20, 'jetlee', 'Jetlee', 'A wall of type', ['Kinetic Type'], 1920, 1080, false, {
    description: 'Rows of JETLEEEEE in shifting colours scroll and stretch against each other, turning one word into a moving pattern.',
    deliverables: ['Loop (16:9)', '0:10'],
  }),
  project(22, 'netflix', 'Netflix', 'Letters at full scale', ['Kinetic Type'], 1080, 1080, false, {
    description: 'Giant, line-textured letters sweep past the frame one at a time — N, E, T, F, L, I, X — with red shadows snapping behind them.',
    deliverables: ['Square loop (1:1)', '0:03'],
  }),
  project(10, 'nothing-impossible', 'Nothing Impossible', 'Sticker type with a burst', ['Kinetic Type'], 1080, 1080, false, {
    description: 'NOTHING IMPOSSIBLE assembles letter by letter into a pink-and-yellow sticker, framed by a radiating burst on electric blue.',
    deliverables: ['Square loop (1:1)', '0:10'],
  }),
  project(11, 'numbers', 'Numbers', 'Digits drawn in loops', ['Kinetic Type', 'Experiments'], 1080, 1080, false, {
    description: 'Each numeral is drawn with a continuous looping stroke, like thread or icing, cycling through 7, 2, 1 and 3 on bright red.',
    deliverables: ['Square loop (1:1)', '0:06'],
  }),
  project(16, 'pepsi', 'Pepsi', 'Stacked wordmark motion', ['Kinetic Type'], 1080, 1080, false, {
    description: 'Five stacked PEPSI wordmarks wobble, stretch and drip into place on brand blue — a playful study in repetition.',
    deliverables: ['Square loop (1:1)', '0:04'],
  }),
  project(33, 'studio-02', 'Studio 02', 'Modular numerals', ['Kinetic Type'], 1920, 1920, false, {
    description: 'Digits built from a kit of circles, half-moons and rounded bars rearrange themselves from one number into the next.',
    deliverables: ['Square loop (1:1)', '0:05'],
  }),
  project(28, 'summer', 'Summer', 'Type that stretches', ['Kinetic Type'], 1080, 1080, false, {
    description: 'SUMMER duplicates into pastel layers that bend, stack and tumble around the frame before snapping back into one word.',
    deliverables: ['Square loop (1:1)', '0:03'],
  }),
  project(25, 'take-tin', 'Take Tin', '3D sticker type', ['Kinetic Type'], 1080, 1080, false, {
    description: 'Extruded TAKE TIN lettering pops up inside an orange sticker outline with a sunburst flash — chunky, tactile and loud.',
    deliverables: ['Square loop (1:1)', '0:03'],
  }),
  project(13, 'tudum', 'Tudum', 'Type with a rainbow drop', ['Kinetic Type'], 1080, 1080, false, {
    description: 'TUDUM lands with a rainbow fan of rays beneath it, timed like the sound it is named after.',
    deliverables: ['Square loop (1:1)', '0:07'],
  }),
  project(19, 'type-2', 'More Love', 'Bubbly sticker type', ['Kinetic Type'], 1080, 1080, false, {
    description: 'MORE LOVE wobbles inside a layered pink-and-blue bubble, letters swapping and bouncing in a soft, squishy loop.',
    deliverables: ['Square loop (1:1)', '0:04'],
  }),
  project(26, 'zero', 'Zero', 'From square to circle', ['Kinetic Type', 'Experiments'], 1920, 1080, false, {
    description: 'A chain of green tiles counts its way along a curved path, morphing from squares into circles in a smooth trailing echo.',
    deliverables: ['Loop (16:9)', '0:10'],
  }),
  // ── Experiments ──
  project(23, 'study-01', 'Study #01', 'Letters with physics', ['Experiments'], 1536, 1920, false, {
    description: 'Pill-shaped letter tokens in black, white and red tumble and jostle on yellow — a portrait study in simulated weight and collision.',
    deliverables: ['Portrait loop (4:5)', '0:08'],
  }),
  project(27, '2020-tax-independence', '2020 Tax — Independence', '110 years on, we rise for fairness', ['Experiments'], 1080, 1920, true, {
    description: 'A vertical piece that pairs archival photographs with bold type on electric blue, connecting a moment from Irish history to a 2026 message about tax fairness.',
    deliverables: ['Vertical social film (9:16)', '0:27'],
  }),
  project(17, 'lovesick', 'LoveSick', 'A neon title reveal', ['Experiments'], 1920, 1080, true, {
    description: 'Red spotlights sweep through the dark until LOVESICK flickers on like a neon sign — a short, moody title sequence.',
    deliverables: ['Title sequence (16:9)', '0:07'],
  }),
  project(29, 'numbers-2', 'Numbers II', 'Rings of letters', ['Experiments'], 1920, 1080, true, {
    description: 'Concentric rings of letters and numbers rotate at different speeds, spelling EVERYTHING as they align and drift apart.',
    deliverables: ['Loop (16:9)', '0:06'],
  }),
  project(5, 'rock', 'Rock', 'Bounce', ['Experiments'], 1080, 1080, true, {
    description: 'A glowing ball bounces across a range of glassy 3D crystal rocks under the word BOUNCE — a study in light, material and timing.',
    deliverables: ['Square loop (1:1)', '0:08'],
  }),
  project(3, 'shapes-play', 'Shapes Play', 'Geometry in transition', ['Experiments'], 1920, 1080, true, {
    description: 'A four-point star opens into a checkerboard tunnel, then concentric rings, then a single dot — a chain of seamless shape transitions.',
    deliverables: ['Loop (16:9)', '0:10'],
  }),
  project(18, 'terry-cube-01', 'Terry Cube 01', 'A 3D model of manual therapy', ['Experiments'], 1920, 1080, true, {
    description: 'An isometric data cube that slides apart layer by layer to explain a manual-therapy framework — force parameters, structure and function levels, and contextual factors.',
    deliverables: ['3D infographic (16:9)', '0:37'],
  }),
].sort((a, b) => a.order - b.order);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const toCategorySlug = (c: string) => c.toLowerCase().replace(/\s+/g, '-');

/** Full-screen showreel shown at the top of the Work page (undefined = no reel section). */
export type Showreel = { src: string; poster?: string; width: number; height: number; title: string; alt: string };
export const showreel: Showreel | undefined = {
  src: FILM('showreel'),
  poster: M('showreel', 'poster.jpg'),
  width: 1920,
  height: 1080,
  title: 'Showreel 2026',
  alt: 'Gokul — motion design showreel 2026',
};
