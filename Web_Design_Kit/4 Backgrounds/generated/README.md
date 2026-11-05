# Generated backgrounds

Pixel-art scenes made with Codex image generation (2026-11-05, two batches), using the AVP's campus
garden (`Thesis4/AVP/BG.png`, also `4 Backgrounds/campus_pixel_art.png`) as the style reference.
The exact prompts are in `codex-prompt.md` and `codex-prompt-2.md`.

Codex's 1536x1024 output was snapped to a true pixel grid: shrunk to 384x256 (`@1x`), reduced to
48 flat colours with no dithering, and enlarged 4x with no smoothing (`@4x`).

| File | Used on the website |
|---|---|
| `lab-night` | 02 / Built with intention (dark sheet), with a navy fade on the left |
| `library-day` | 03 / The research and 04 / Player guide (one shared light sheet), under a pale wash; tinted navy in dark mode |
| `campus-dusk` | 05 / Meet the team |
| `cta-hedges` | (first batch; replaced by `cta-day` on the site) |
| `hero-simulation` | The hero: a dark server hall, the inside of "the simulation", behind the big headline |
| `footage-diner` | The framed in-game footage box in 01 (the clips come from the fast-food level) |
| `cta-day` | The call to action in light mode: the sky with sun and clouds is the backdrop, and the hedge band is cut out and mirror-tiled as the strip the players walk past |
| `cta-night` | The same in dark mode: starry sky with a crescent moon, and the night hedge strip (also under the sign-in form in dark mode) |

To make more in the same style: run the prompt in Codex with BG.png attached, then repeat the
grid snap (any image editor: resize to 25% with box/average sampling, reduce to ~48 colours
without dithering, then enlarge 400% with nearest-neighbour).

## team-classroom (round 3, prompt in `codex-prompt-3.md`)
The Meet the Team scene: a classroom seen like a side-scrolling beat-'em-up stage, split into a faculty
platform (left of the pillar) and the students' floor lane. Generated as `room-b` (late-afternoon light),
cropped to its middle band and snapped to a 256 x 128 pixel grid (BOX resize, 128 colours, no dither),
so the team sprites (21 x 34 art px) stand in it at the same pixel scale. Also used behind the tests.
