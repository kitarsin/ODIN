# Design language reference: 1minus1.com

What the 1minus1 site does, measured from the live page on 2026-11-05, and how to bring that
language into ODIN without copying it. Use this as the brief for the next landing-page pass.

- **Source:** https://1minus1.com/ (a games-industry creative agency). Built with Nuxt, Tailwind v4,
  Lenis smooth scroll, 2 canvas layers and 3 background videos.
- **How it was studied:** headless Edge at 1440×900 and 390×844, scrolled screen by screen, plus the
  computed styles of headings, buttons and nav, and the site's compiled CSS (`/_nuxt/entry.*.css`).
- **Do not copy:** their fonts (licensed to them), logo, illustrations, copy or case-study imagery.
  We take the *ideas*: scale, rhythm, colour behaviour, motion, ornaments.

---

## 1. The idea in one paragraph

A dark, saturated purple world where **giant bitmap lettering** is the hero. Everything else is
calm and well-mannered: one heavy grotesk does nearly all the text work (titles, reading copy,
labels), rounded "sheets" of colour that slide over each other as you scroll, and tiny pixel glyphs used as
punctuation. It feels like a game menu designed by an editorial studio: loud display type, quiet
everything else, and a lot of motion that always has a reason.

---

## 2. Colour

Dark-first. A purple ladder plus one acid accent, and pale lilac neutrals for the light sheets.

| Token (theirs) | Hex | Role on their site |
|---|---|---|
| darkPurple | `#140128` | Page background, primary dark button fill, dark text on light sheets |
| darkestPurple | `#26024A` | Raised dark surfaces (cookie card, dark sheet panels) |
| darkerPurple | `#2A004D` | Tonal pixel-pattern layer on dark sheets |
| mutedPurple | `#31045F` | Secondary dark tone |
| purple | `#9860FF` | Tags/pills, active filter, footer sheet, minimap, submit button |
| neonGreen | `#CAFF60` | Hero display type, "CREATIVE" sheet, active nav text, label chips on cards |
| lightPurple | `#EFEDF0` | Nav pill background, testimonial board, light neutral |
| palePurple | `#F2ECFF` | Form fields, pale pixel-pattern layer on white sheets |
| white | `#FFFFFF` | Light sheets, secondary buttons, form card |
| errorRed | `#FF3C5C` | Errors only |

**How colour behaves**
- **Two loud colours, never at once in the same element.** Neon lime is for display type and one
  sheet; purple is for interactive chips and one sheet. They meet only at section boundaries.
- **Each section is a full-colour sheet:** white → lime → dark purple → purple → white → dark → purple.
  Colour changes *by section*, not by sprinkling accents.
- **Tonal pixel patterns:** every sheet carries a giant enlarged pixel shape (staircases, a big
  pixel "1") drawn in a tint of the sheet's own colour (white on `#F7F3FF`, lime on a paler lime,
  dark purple on `#2A004D`). Texture without contrast noise.
- Text on lime and white is always `#140128`; text on dark purple and purple is always white.

---

## 3. Typography

Four faces, each with one job.

| Face | Style | Job | Measured sizes |
|---|---|---|---|
| **OffBit** | Solid bitmap/pixel display | The giant words: "DISTINCT", "OUR WORK", "BEGIN" | ~21vw. 307px at 1440 wide, 90px at 390. Line height 0.9 |
| **OffBit 101** | Hairline/outline bitmap | The second word of a pair: "ALWAYS", "STORY", footer "INNOVATIVE"; mobile menu links | Same scale as OffBit. Menu links 60px |
| **Neue Power** (bold 700) | Heavy, wide grotesk | The workhorse: section titles (uppercase), lede and body copy (sentence case), card names, button and nav labels | h2 64px (22px mobile), line height 0.88. Lede 28px, line height 1.05. Body 20px, line height 1.05. Labels 12–18px |
| **Nohemi** | Rounded geometric sans | Loaded but not used in any text measured here (possibly the logo or minor UI) | n/a |

**Rules they follow**
- **Display words are split into per-letter elements** (each letter is its own `div`), so letters
  can animate in one by one and sit on a strict grid.
- **Pairs of display words mix solid + outline:** "DISTINCT" (solid lime) over "ALWAYS" (outline
  lime); "BEGIN" (outline lime) over "STORY" (solid white). The contrast between the two weights is
  the signature move.
- **Display type is allowed to bleed** off the left and right edges of the viewport. It is
  decoration-scale and doesn't have to fit.
- **Very tight leading everywhere:** titles 0.88–0.9, even body copy about 1.05. Paragraphs read as
  dense bold blocks. (For ODIN, keep body leading at about 1.6 for readability.)
- **Uppercase everywhere except reading copy.** Labels, buttons, nav, card names and tags are all caps.
- **Inline pixel "emoji":** the lede starts with a small purple pill holding four tiny pixel faces
  (`◡ ◡ ◡ ◡`) as if it were a word in the sentence.

---

## 4. Layout and shape

- **Full-bleed, edge to edge.** Gutters are about 40px desktop, 16–20px mobile. No visible max-width
  container; content spreads across 1440px.
- **Split layouts inside sheets:** title block on the left ~45%, tags + paragraph + button on the
  right ~55%.
- **Rounded corners, scaled to size:** 8px for buttons and nav items, 16–24px for cards and sheets,
  36–40px for the biggest panels. Pills (`rounded-full`) for tags. *Nothing is sharp-cornered*, which
  softens the pixel type.
- **Tilt as a layout tool:** the hero video card, the services sheets entering, testimonial cards
  and the contact form are all rotated a few degrees (about −3° to +6°), so things feel placed by
  hand rather than gridded.
- **Overlap:** media and cards overlap the giant type (the video sits on top of "DISTINCT"; the form
  sits over "BEGIN YOUR STORY").
- **Sticky chrome:** the logo pill (top left) and the nav pill (top right) float over everything
  with a light translucent background.

---

## 5. Components

**Navigation (desktop):** one light pill (`#EFEDF0`, 8px radius, ~4px inner padding) holding three
segments: WORK, SERVICES, CONTACT. The active or primary segment is a dark purple block with lime
text. It's a segmented control, not a row of links.

**Navigation (mobile):** a "MENU ⋰" pill button opens a full-screen sheet with the links set in
OffBit 101 at 60px.

**Buttons:**
- Primary: `#140128` fill, white uppercase Neue Power ~14px, 8px radius, padding 17px 24px,
  trailing pixel chevron `›` drawn as 3 pixels.
- Secondary: white fill, dark text, same shape.
- Accent: purple fill (submit, "Accept all").
- **Hover is a text roll:** every label is rendered twice (`WORK` / `WORK`) and the copy slides up
  to replace the original (driven by a `--roll-delay` per letter).

**Tags/pills:** purple fill, white uppercase 12–13px Neue Power, fully rounded, packed tightly in
rows, with an overflow counter pill ("+6") in a pale tint.

**Section label:** a pixel ornament (`⋰⋰`, three stepped pixel bars in purple) followed by an
uppercase word ("PLANNING", "MAKING"). Used above every section title.

**Case-study card:** a 16–20px-radius image card. A white "BRAND ⋰ WEB" chip sits top right and a
lime "✕ RIOT GAMES" chip bottom left. It sits in a horizontal carousel with a pill-shaped
dot pager. Includes "Viewing case study 1 of 11" and keyboard-hint text for screen readers.

**Filter bar:** "FILTER BY" label + a pale pill segmented control (ALL is purple active).

**Testimonials:** a light board you drag around ("Drag to navigate") with tilted white quote cards,
halftone/sketch sticker illustrations behind, a purple **minimap** widget bottom left and a vertical
"TESTIMONIALS" tab on the right edge.

**Contact:** the giant outline/solid display pair on dark, with a tilted white form card on top.
Fields are pale lilac blocks with uppercase placeholder labels and no visible borders.

**Footer:** full purple sheet. "⋰ RISE TO THE TOP" label, a giant outline OffBit marquee of their
values (INNOVATIVE, DISTINCT…) scrolling sideways, white social pills with ↗ arrows sitting *on*
the marquee, then a legal row separated by pixel ornaments, and a dark "PLAY OUR 404 GAME" button.

**Preloader:** a thin-bordered square with pixel ✕ markers on its four corners, centred, holding
"HOLD TIGHT" (lime, OffBit) and a 3-digit counter (outline) counting to 100, then "ALMOST READY".
A tiny purple coordinate readout sits outside the square.

**Cookie banner:** a dark purple card rotated about −3°, with a pixel ornament title and two buttons.

---

## 6. Pixel ornaments (their micro-vocabulary)

Small glyphs built from 2–4 px squares, always in purple or lime, used like punctuation:

- `⋰` three stepped bars: before every section label and in the "MENU" button
- `✕` a pixel cross/checker: preloader corners, bullet before card names, "Accept all" icon, star
  ratings (five ✕ in a row)
- `›` a 3-pixel chevron: trailing icon on every button
- `( ⌄ )` a pixel chevron in brackets: the "scroll on" cue under section intros
- A pixel "V/scroll" glyph pinned to the bottom-left and bottom-right of the hero
- Vertical stacks of ✕ in lime pinned to the left and right edges of the showreel

They make a plain UI feel "in-world" for very little cost. **This is the most transferable idea for ODIN.**

---

## 7. Motion

- **Preloader count-up** (000 → 100) before the hero reveals.
- **Smooth scroll** (Lenis) across the whole page.
- **Hero:** display letters animate per letter; the video card floats tilted over the type.
- **Showreel:** a full-width 16:9 video (1440×810) inside a dark frame, with lime ✕ pixel stacks on
  both edges and a centred white "PLAY SHOWREEL ›" button.
- **Stacked sheets:** each services sheet slides up over the previous one. Mid-scroll they are
  caught rotated a few degrees, like cards being dealt, and they settle flat. (The motion is
  inferred from screenshots taken mid-scroll; the timing wasn't measured.)
- **Text roll on hover** for every button and nav label.
- **Marquee:** the footer values scroll sideways (`translateX(-100%)` linear, 10s loop).
- **"Lit" pixel effect:** some pixel groups switch on with staggered delays (`--lit-delay`).
- Easing is Tailwind's standard set (`cubic-bezier(.4,0,.2,1)`, ease-out `(0,0,.2,1)`); short UI
  transitions are 150ms.

---

## 8. Voice

Short, confident, all-caps labels ("HOLD TIGHT", "BEGIN YOUR STORY", "RISE TO THE TOP", "DRAG TO
NAVIGATE"). Two-word display statements. Game vocabulary in UI copy (minimap, 404 game).
*For ODIN this informs labels and decoration only. The landing page's existing content stays as it is.*

---

## 9. Translating it to ODIN

ODIN already has the right raw material: a pixel font, a title font, a palette and real game art.
The job is to borrow 1minus1's **scale, rhythm and ornaments**, not their colours.

| 1minus1 | ODIN equivalent | Notes |
|---|---|---|
| OffBit (solid) giant display | **ODIN Pixel** at display size: 160 / 200 / 240px (multiples of 10 stay crisp) | Use for one or two-word statements, e.g. "ODIN", "READY", "LEVEL 0" |
| OffBit 101 (outline) | ODIN Pixel with `-webkit-text-stroke` and transparent fill, or a pixel-step outline built with layered `text-shadow` | Pair one solid word with one outline word |
| Neue Power uppercase titles | **Dedicool** (keeps the game's voice) for section titles; Inter 800 uppercase for small labels if needed | Keep title leading tight (≈0.95) |
| Neue Power bold body | **Inter** (already loaded), 600 for ledes, 400 for body | Don't copy their 1.05 body leading; keep about 1.6 |
| darkPurple `#140128` | ODIN deep `#070E26` / navy `#0B1C45` | |
| purple `#9860FF` (interactive) | ODIN border blue `#1593FF` / cyan `#5FCDE4` | |
| neonGreen `#CAFF60` (display) | ODIN gold `#FBF236` or cyan `#5FCDE4` | Gold is "key numbers" in the kit; cyan is "ODIN". Pick one for display type |
| lightPurple / palePurple sheets | ODIN light surfaces `#EEF3FA` / `#F5F8FD` / white | Light mode is ODIN's default |
| Tonal pixel staircases | Enlarged ODIN sprite silhouettes or kit pixel shapes in a 4–6% tint of the sheet | e.g. a giant ODIN head silhouette behind a section |
| Pixel ornaments `⋰ ✕ ›` | Build our own from ODIN palette squares (CSS `box-shadow` pixels or tiny SVGs) | ODIN's kit already has the speaker tab, hint pips and ▼ "more" arrow from the dialogue box. Use those |
| Rounded 8–40px corners | **Keep ODIN square** (0 radius, hard 4–6px shadows) | ODIN's game panels are square; this is our point of difference |
| Tilted cards | Small tilts (±2–3°) on the footage windows, field note and team cards | Never on text people must read at length |
| Preloader "HOLD TIGHT 039" | Optional: "LOADING ODIN… 000→100" in ODIN Pixel inside a dialogue-box frame | Must not delay content more than about 1s; skip on repeat visits and under reduced motion |
| Full-width showreel in a dark frame with ✕ edge markers | The in-game footage as a full-bleed dark band with pixel edge markers. It could also grow from card to full width as it enters (our own idea, not theirs) | CSS scroll-driven animation, falling back to static |
| Stacked dealt sheets | The four landing sections as full-colour sheets that slide over each other | Light sheet → deep navy sheet → cyan sheet → light… |
| Text-roll hover | Pixel-step roll (`steps(4)`) on buttons and nav | Gate behind `(hover: hover)` |
| Footer value marquee | The enemy parade, or an ODIN Pixel marquee of level names (LEVEL 0 · 1D ARRAYS · LOOPS · 2D ARRAYS) | Level names are content. Confirm first |
| Segmented pill nav | A segmented **square** nav block with the portal CTA as the active dark segment | |
| Minimap widget | A tiny pixel minimap of the page's sections that highlights where you are | Nice-to-have |

### Constraints that still apply (from the Web Design Kit and the previous pass)
- **Content is locked:** every heading, paragraph, number, label and link on the landing page stays.
  The study numbers stay next to their caveat, and the footer disclaimer stays.
- **Light mode is the default** and dark mode must also work. 1minus1 is dark-first, so in light
  mode use dark sheets as accents between light sheets rather than inverting everything.
- **Pixel art and pixel fonts at whole-number sizes**, `image-rendering: pixelated`, no blur.
- **Accessibility:** text contrast 4.5:1 (lime-style display colours fail on white, so use them on
  dark sheets only), visible focus, keyboard reachable, `prefers-reduced-motion` turns off smooth
  scroll, tilts-in-motion, marquees and the preloader.
- **No smooth-scroll hijacking for keyboard users:** if Lenis-style scrolling is added, native
  scrolling must keep working for keyboard, find-in-page and anchor links.
- **Performance:** no new heavy libraries unless needed. CSS scroll-driven animations and
  IntersectionObserver first. Their 3 background videos would be too heavy for us; we use GIF and
  still footage.

### What NOT to borrow
- Their rounded-corner, glossy agency polish everywhere (ODIN is square and game-native).
- Neon lime as text on light backgrounds (fails contrast).
- Draggable testimonial board (no testimonials on ODIN; heavy for little value).
- Long preloaders.

---

## 10. Proposed application to the ODIN landing page (draft)

1. **Hero:** a giant two-word display pair in ODIN Pixel, solid over outline, bleeding off the
   edges. The existing h1 "Learn to code. Keep going." stays as the real heading. The display words
   are decorative (`aria-hidden`) and drawn from existing content, e.g. "LEARN" / "KEEP GOING". The
   gameplay window sits tilted over the type, as their video card does.
2. **Footage reveal:** the battle GIF window scales from card to full-bleed as it scrolls in, inside
   a dark frame. Its label reuses "IN-GAME PREVIEW".
3. **01 The ODIN loop:** three dealt sheets (cyan, gold, teal tints) instead of three cards, each
   with a giant tonal pixel numeral (01/02/03) behind.
4. **02 Built with intention:** a deep navy sheet with a giant tonal ODIN-head silhouette, square
   pill tags in the kit style, and pixel ornament section labels.
5. **03 Research:** the two numbers set in display ODIN Pixel, solid and outline, with the caveat
   directly beneath.
6. **04 Player guide:** the FAQ as square segmented rows with pixel chevrons.
7. **05 Meet the team:** keep the character select, add a slight per-card tilt that straightens on
   hover, and ✕-style pixel markers on the card corners.
8. **Call to action:** a giant "ODIN://READY" in solid + outline over the walking players.
9. **Footer:** a light or blue sheet with the enemy parade as the marquee and the legal row
   separated by pixel ornaments.

Decisions (2026-11-05):
- Display colour on dark sheets: **cyan**.
- Preloader: **yes**, short. A "LOADING ODIN 000→100" count-up, once per browser session, skipped
  under reduced motion (`src/app/components/LandingPreloader.tsx`).
- Scrolling: **native** (no smooth-scroll library). CSS scroll-driven effects where supported, with a
  static fallback.

Built in the 2026-11-05 pass: `src/app/pages/LandingPage.tsx` + `LandingPage.css`, pixel
ornaments in `src/app/components/PixelGlyph.tsx`, shared tokens in `src/styles/odin-public.css`.
Gotcha: Tailwind v4 generates an `.outline` utility (a CSS outline), so the outline display class
is named `.px-outline`.

Feedback round (2026-11-05, from the user):
- Removed the moving filler bands: the enemy parade, the footer marquee and the walking players.
  The enemies now stand as tonal silhouettes along the bottom of the hero.
- The footage clips rest on their first frame and play only on hover or focus (tap on touch).
  See `src/app/components/HoverClip.tsx`.
- Team cards are not tilted. Students play their idle animation; faculty stay static until they're animated.
- The preloader became a greeting splash (`LandingSplash.tsx`): "HELLO, ODIN!" letter by letter, then ODIN's
  level-0 line typed in a dialogue box. Once per session, skippable, off under reduced motion.
- Less negative space: tighter section padding, two-column section headings, field note moved under the hero copy.
- Avoid: auto-scrolling marquees, tilted cards, decorative bands that only add height.

Feedback round 2 (2026-11-05, from the user):
- Footage: no "hover to play" label; a darker resting shade is enough.
- Hero: fill the empty space with the enemies. They now stand at two depths (far and near) that drift
  at different speeds while scrolling.
- Team: students show a still frame and play the idle animation on hover; no shade. Faculty stay static.
- CTA: the walking players are back (they're wanted; the scrolling marquees are not).
- Splash: plays on every full page load, including a refresh; not again on in-app navigation back to "/".
- Readability: the intro paragraph beside split headings is larger, darker and marked with an accent bar.
- More scroll animation: header XP-style progress meter, section labels type out, headings wipe in,
  cards pop in on stepped curves, footage slides in from both sides, research numbers count up,
  ODIN://READY lights up letter by letter. All of it is off under reduced motion.

Feedback round 3 (2026-11-05, from the user):
- Backgrounds were too repetitive. Added four pixel-art scenes generated with Codex from the AVP's campus
  garden (see `Web_Design_Kit/4 Backgrounds/generated/`): a night computer lab behind 02, a pale library
  behind 03, the campus at dusk behind 05, and a mirrored hedge strip in the CTA that the players walk past.
  They drift slightly while scrolling. Sections without a scene keep the dot grid.
- One-line statements must read as statements, not captions: "The student stays in control." is now a
  gold banner with the line in large Dedicool, and the research caveat is a notice with a "!" badge.

Feedback round 4 (2026-11-05, from the user):
- Every section alternates light and dark: hero (dark, server hall) → 01 (light) → 02 (dark, lab) →
  03+04 (one light sheet, library) → 05 (dark, campus at dusk) → CTA (day sky in light mode, night sky
  with stars in dark mode).
- Section 01 is one continuous sheet: the enemies stand along its bottom as pale silhouettes, and the
  footage sits in a framed box (diner scene) instead of a full-width band that split the section.
- Scene backgrounds stay still while scrolling (the drift made them jump). Only the enemy rows drift.
- Sign-in pages: the left panel is the InsomniCode poster; the form is a game window (title bar with
  the three lights, pixel labels, square inputs) over the hedge strip.

Feedback round 5 (2026-11-05, from the user):
- Elements now move with the scroll, not just on first reveal. LandingPage.tsx sets --hero and, per
  [data-scroll] element, --p (0 entering, 0.5 centred, 1 leaving); the CSS uses the separate
  translate/rotate/scale properties. Hero headline splits apart; cards float at different speeds; footage
  windows converge; banner grows in; 02 portrait tilts and tags slide in; FAQ rows slide in; team cards
  cascade; ODIN://READY letters rise in turn. Halved on phones, off under reduced motion.
- Sign-in panel: the poster (cut off on wide screens) is replaced by a "VS" fight screen: the player
  characters face each of the 20 enemies in turn (name + level, floor lit in the level colour), with
  ODIN's full name above and the thesis title panel from the poster below (AuthLayout.tsx).

Feedback round 6 (2026-11-05, from the user):
- Too much sideways motion, and some elements were caught half way (FAQ rows staggered off the panel).
  Scroll motion is now "enter, then rest": each [data-scroll] block also gets --e (0 with its top at the
  bottom of the screen, 1 once the top is halfway up, or as far as the page can scroll), and every moving
  piece turns that into --k, which falls to 0 and stays there. Nothing moves while it is being read.
  Motion types are mixed and mostly vertical: rise (cards, results, principles), drop from above (tags,
  banner arrow, ODIN:// letters), zoom (footage windows, statement banner, faculty), spin (footage arrow).
  Headings print top-down in steps; only the section labels still type left to right.
- Sign-in panel rebuilt from `Thesis4/Poster/website_login.png` using the `Poster/Sprite` exports: both
  players (green outline) behind the tilted ODIN banner from `Poster_4K.png`, two enemies (red outline)
  rising from the bottom edge. The enemies cycle: the back row (planter, vanguard, alchemist, severer)
  and the front row (beast, gatekeeper, allocator) swap on alternating beats, sinking out and rising in.
  The art is measured in banner pixels ("units"); a unit is a whole number of screen pixels, and the
  panel is exactly as wide as the 198-unit stage, so the pixel art stays crisp.

Feedback round 7 (2026-11-05, from the user):
- Team: the party now stands in one pixel classroom (`Poster/Sprite/classroom.png`, 247 x 135) drawn at the
  same pixel scale as the sprites: faculty by the whiteboard, students on the floor. Names sit in a party
  bar below; hovering a name or a sprite plays that member's idle and shows a cursor over them.
- FAQ: six more questions, all answered from facts already in the site and app (desktop browser, sign-up
  fields, pretest/post test, the four levels, how hints are chosen, no clinical diagnosis).
- Sign-in pages: one scene for the whole page (the CTA's day/night sky with the hedge strip as ground
  under both columns). The left side is an attract-mode reel: a player walks in, then an enemy builds up
  from its feet, each with a typed title card, alternating through all 20 enemies.
- Signed-in pages are now restyled too (appearance only; content and behaviour unchanged):
  `src/styles/odin-app.css`, applied by the `onApp(tab, page)` wrapper in routes.tsx. Each tab has its own
  washed-back scene (dashboard: lab, game: server hall, wiki: library, tests: classroom, profile: campus
  dusk, settings: sky, admin: diner). The ribbon matches the landing header and wraps to two rows below
  1400px. Panels are square with hard shadows, panel titles are pixel labels, buttons are pixel buttons,
  progress bars are segmented meters; body text stays Inter at 12px or larger.

Feedback round 8 (2026-11-05, from the user):
- Team: students on the left, faculty on the right (the classroom image is mirrored so the platform is on
  the right), and the faculty sprites are flipped so the two groups face each other. Faculty idle
  animations will come later; give them an `idle` in `partyInRoom` (LandingPage.tsx) when they exist.
- The FAQ became "04 / WHY ODIN: Why use ODIN?" with five reasons, all from facts already on the site;
  the obvious questions were dropped as bloat.
- Footer: dark blue (#0A2462) with light text instead of the bright blue sheet.
- Sign-in: no more character reel. Only the text at the top remains, typing out one line at a time
  ("Bring the world back to normal.", ...), labelled ODIN // TRANSMISSION.
- Panels on every signed-in page (and the sign-in card) are framed like the game's battle screen and
  dialogue box: 4px #1593FF border, 8px corners, panel titles in Dedicool like the dialogue speaker's
  name. Fill is white in light mode and the game's #1F2228 in dark mode.
