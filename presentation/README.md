# SkillPilot-AI — Cinematic Presentation

*Reasoning Agents for Enterprise Certification*

Standalone pitch presentation pages for the Microsoft Foundry hackathon. Two fullscreen animated sequences with **manual scene advance** (keyboard or click).

## Pages

| Page | URL (dev) | Scenes | Purpose |
|------|-----------|--------|---------|
| **Opening** | http://localhost:5173/opening.html | 12 | Problem setup — $2M spend, 23% completion, three failures |
| **Closing** | http://localhost:5173/closing.html | 18 | Solution & vision — SkillPilot-AI, agents, tagline, thank you |

## Quick start

```powershell
cd presentation
npm install
npm run dev
```

Then open `opening.html` or `closing.html` in the browser.

## Controls

| Input | Action |
|-------|--------|
| `→` / `Space` / `Enter` | Next scene |
| `←` | Previous scene |
| Click right 25% of screen | Next scene |
| Click left 25% of screen | Previous scene |
| `F` | Toggle fullscreen |

## Production build

```powershell
npm run build
npm run preview
```

Outputs `dist/opening.html` and `dist/closing.html` for offline presentation.

## Tech stack

- Vite + React 19 + TypeScript
- Framer Motion 12
- Tailwind CSS (Azure / Microsoft Build dark theme)

## Tips for presenting

1. Press `F` for fullscreen before starting.
2. Pause on scene 4 (Opening) at **23%** for dramatic effect.
3. Advance through the three failure scenes slowly.
4. Use Closing scene 6 (shatter) as the transition into hope.
5. End on "Thank You" — it fades to black automatically.
