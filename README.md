# SS WIN — Black Bag Landing Page

Cinematic, scroll-driven brand showcase for **MUTHU WIN · SS · KANGAYAM** premium Sortex Ponni Rice. As you scroll, the product commercial video scrubs forward/back (Apple / Hungry Tiger style), with sections animating in.

## Stack

- Vite + React 19
- GSAP + ScrollTrigger (scroll pinning & scrub)
- Lenis (smooth scroll)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

## Assets

Place these in `public/`:

- `public/ss-win-commercial.mp4` — the product commercial (drives the scroll scrub). Included.
- `public/ss-win-bag.png` — the 26kg black bag product render. **Add this file** — until then a styled placeholder is shown in the Highlights section.

## Structure

```
src/
  App.jsx                 # composes sections + mounts Lenis
  hooks/useLenis.js       # smooth scroll synced with ScrollTrigger
  components/
    ScrubVideo.jsx        # pinned <video>, maps scroll progress -> currentTime
    Caption.jsx           # progress-driven caption overlay
    ScrollCue.jsx
  sections/
    Hero.jsx ScrubStory.jsx Highlights.jsx Story.jsx Footer.jsx
  styles/tokens.css base.css
```
