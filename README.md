# Yash Chaturvedi

Personal site for the One Who Codes 2026 contest.

**Live site:** https://yash-chaturvedi-portfolio.vercel.app/

This branch replaces the older portfolio that was in the repository. It is not deployed from here. The live URL still serves the previous production build until this branch is published.

## Setup

Node.js 20 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck, then static files in dist/
npm run preview  # serve dist/
```

The build is a static Vite site. There is no server and no environment file.

## Where the content came from

The live site was uploaded to the Vercel project `yash-chaturvedi-portfolio` as a production bundle, not as git history. This repository only had a different, older portfolio (the security-themed one). Copy, numbers, links, certifications, and the resume PDF were taken from that live build. No figure here is estimated.

SkyReply is not on the live site and not in the public GitHub profile, so it is not on this page.

## Design

The page is ink and vermilion, in dark and light. Instrument Serif carries the name and the section titles, Instrument Sans is the reading face, and DM Mono sets the numbers. All three are self-hosted Latin subsets under the SIL Open Font License. Notices are in `public/fonts/`.

The hero is real HTML. It is not faded in by JavaScript, so the name, the numbers, and the portrait paint with the document. The portrait is preloaded and marked `fetchpriority="high"`.

The wireframe beside the portrait is a small WebGL module, loaded after the window `load` event and on idle, in its own chunk. It does not load when the visitor prefers reduced motion, has data saver on, or reports 2 GB of memory or less. A drawn copy of the same object occupies that box the whole time, so the layout does not jump.

The object is the work: an outer shell for the problem graph, a core for the local agent, and three satellites for LeetCode, Codeforces, and takeUforward. Pointer movement tilts it. It pauses off screen.

Section titles are `h2` elements. Each project card is the problem, what was built, and one engineering decision already present in the work:

- FRIDAY keeps browser and OS actions behind an approval gate.
- RoleRadar scores fit on four weighted dimensions and explains the score.
- CineCircle puts reviews, follows, and recommendations behind the authenticated API.
- Gesture Control calibrates thresholds to the person in frame.

`Ctrl K` opens a command palette. Focus is trapped inside it, and it returns to the control that opened it. That control’s accessible name is “Open command palette, Ctrl K”, which includes the visible label. There is a skip link, a `robots.txt`, and canonical, Open Graph, and Twitter metadata.

## Live URL

https://yash-chaturvedi-portfolio.vercel.app/
