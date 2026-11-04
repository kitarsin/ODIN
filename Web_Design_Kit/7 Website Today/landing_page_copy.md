# Landing page content (keep as is)

This is every piece of text on the current landing page, copied word for word from
`src/app/pages/LandingPage.tsx` (2026-11-04). The redesign changes the **look**, not the
**content**: keep these words, numbers, links and section order unless the team agrees to
change them. The study numbers and the caveat under them must stay together.

---

## Header
- Brand: **ODIN** · INSOMNICODE (links to `/`)
- Nav: How it works (`#how-it-works`) · The experience (`#scope`) · The research (`#research`)
- Button: **Enter the portal →** (`/login`)
- Mobile nav: How it works · The experience · Research

## Mobile notice (pop-up shown once on phones and tablets)
- Kicker: ODIN // DEVICE NOTICE
- Title: Your quest is best on a bigger screen.
- Text: ODIN is optimized for a desktop or laptop with a physical keyboard. Feel free to explore this page on your phone, then switch to a computer to enter the portal.
- Button: Explore the website →

## Hero
- Eyebrow: ● A coding adventure by InsomniCode
- Headline: **Learn to code.** / **Keep going.** (second line highlighted)
- Lede: A little guidance can change the game. Explore C# arrays in an 8-bit RPG where thoughtful hints help you find your own way forward.
- Primary button: **Enter the ODIN portal →** (`/login`)
- Secondary link: Explore the system ↓ (`#how-it-works`)
- Meta: ⌨ Desktop + physical keyboard · 🛡 Hints, never answers
- Mobile callout: **Best on desktop** — open ODIN on a laptop or desktop with a physical keyboard.
- Hero art (an illustrative mock-up, not a real screenshot):
  - Signal: SYSTEM READY 01
  - ODIN mascot
  - Window title: ARRAY QUEST // 01 · LIVE
  - Scene caption: A new challenge appears
  - Editor: CODE EDITOR · C#
    ```
    01 int[] scores = { 8, 5, 9 };
    02 for (int i = 0; i < scores.Length; i++)
    03 { total += scores[i]; }
    04 // check the array bounds
    ```
  - Hint: ✦ Try tracing the last valid index.
  - Footer: ODIN GUIDANCE ACTIVE · ILLUSTRATIVE PREVIEW
  - Field note: FIELD NOTE — Support the process. Let the student solve.
- Scroll cue: SCROLL TO EXPLORE

## 01 / THE ODIN LOOP (`#how-it-works`)
- Title: More than an error message.
- Text: When code gets stuck, ODIN brings together code structure and observable work patterns to offer a useful next step.
- Cards:
  1. **01 · Read the code** (cyan) — Roslyn-based analysis looks at the structure of a C# solution, including common array logic errors.
  2. **02 · Notice the pattern** (amber) — A transparent set of rules reads observable work patterns alongside each attempt.
  3. **03 · Offer a next step** (mint) — ODIN selects a prewritten hint through the game world, so the student can keep solving.
- Note: ↳ **The student stays in control.** ODIN provides scaffolding, not a generated solution.

## 02 / BUILT WITH INTENTION (`#scope`)
- Title: A game world with a learning purpose.
- Text: ODIN combines an 8-bit role-playing game with a code editor and a rule-based tutoring system. The game supports the work; it does not replace it.
- Tags: C# arrays · Rule-based support · Desktop browser
- Principles:
  - 01 **Observable signals** guide timely support; they are not a clinical diagnosis.
  - 02 **Prewritten hints** point to a next step without giving away answers.
  - 03 **Readable code** stays clear while pixel art belongs to the game world.

## 03 / THE RESEARCH (`#research`)
- Title: Built to make the next attempt feel possible.
- Text: ODIN was developed at FEU Institute of Technology to explore how timely, interpretable support can help students learning to program.
- Label: ● CS EXPO 2026 · INSOMNICODE
- Result 1: 01 / LEARNING — **+1.14** mean score change — On a 0–5 C# array assessment across 21 students in the pretest–posttest study.
- Result 2: 02 / ACCEPTANCE — **4.25/5** perceived usefulness — Student technology acceptance rating, based on responses from 20 students.
- Caveat (must stay next to the numbers): These are early prototype findings. The study used one group without a control, so the results do not establish cause and effect.

## 04 / PLAYER GUIDE
- Title: A few things to know.
- Text: Everything you need before starting your first quest.
- FAQ:
  - **Who is ODIN for?** ODIN is designed as supplementary support for college students learning C# array concepts.
  - **Will ODIN give me the answer?** No. ODIN offers prewritten hints to help you think through a problem while you remain in control of the solution.
  - **What do I need to play?** Use a laptop or desktop browser with a physical keyboard. The coding game uses keyboard timing as one of its learning-support signals.

## Call to action
- Pixel text: ODIN://READY
- Kicker: YOUR NEXT QUEST STARTS HERE
- Title: Ready to enter the system?
- Button: **Open the portal →** (`/login`)

## Footer
- Brand: ODIN INSOMNICODE
- Disclaimer (keep): Behavioral indicators guide learning support. ODIN does not diagnose a student’s mental or clinical state.
- FEU INSTITUTE OF TECHNOLOGY • CS EXPO 2026

## Also on every page
- Theme toggle, bottom right: **Light mode** / dark mode (`src/app/components/ThemeToggle.tsx`).

---

## Login page (`/login`)
- Title: ODIN Portal Access
- Subtitle: Initialize your session
- Fields: Email Address · Password (with "Forgot password?" link)
- Button: Initialize Session
- Footer: Need access? Register New Account
