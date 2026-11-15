# CivicConnect Agent Skills & Design Intelligence

This repository integrates agent skills for high-fidelity UI/UX, composition patterns, anti-slop visual identity, and mobile screen designs.

Skills are managed via the standard [`skills`](https://skills.sh) CLI and stored in [`.agents/skills/`](file:///d:/Project/civic%20connect/.agents/skills/) with dependencies tracked in [`skills-lock.json`](file:///d:/Project/civic%20connect/skills-lock.json).

---

## Installed Skills

| Skill | Source | Scope & Use Case |
| :--- | :--- | :--- |
| **`vercel-composition-patterns`** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | React composition patterns that scale. Eliminates boolean prop proliferation; compound components, slot patterns, context providers. |
| **`frontend-design`** | [anthropics/skills](https://github.com/anthropics/skills) | Distinctive, opinionated visual identity. Deliberate typography scales, content-grounded aesthetics, zero generic template tropes. |
| **`canvas-design`** | [anthropics/skills](https://github.com/anthropics/skills) | Visual art and static layout design in `.png` / `.pdf` canvases using artistic philosophy. |
| **`ui-ux-pro-max`** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Comprehensive UI/UX design intelligence: 44×44px touch targets, accessibility (WCAG 4.5:1), responsive layout, form UX, charts. |
| **`sleek-design-mobile-apps`** | [sleekdotdesign/agent-skills](https://github.com/sleekdotdesign/agent-skills) | Mobile screen generation, REST API screen rendering, and React Native / HTML mobile layouts via Sleek. |
| **`anti-ai-slop`** | Local Workspace (`.agents/skills/anti-ai-slop`) | Enforces refusal of generic AI slop: no purple gradient soup, no universal 2xl rounded cards, authentic data-dense layouts. |

---

## Installation & Re-sync Commands

To restore all skills in a new environment or update them:

```bash
# Restore all skills locked in skills-lock.json
npx skills experimental_install -y --copy

# Or install individually:
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns -y --copy
npx skills add https://github.com/anthropics/skills --skill frontend-design -y --copy
npx skills add https://github.com/anthropics/skills --skill canvas-design -y --copy
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -y --copy
npx skills add https://github.com/sleekdotdesign/agent-skills --skill sleek-design-mobile-apps -y --copy
```

---

## How to Apply These Skills in CivicConnect

### 1. Vercel Composition Patterns
- When creating UI components (e.g. Work Order cards, KPI strips, Filter dropdowns), prefer compound components (`<Card.Header>`, `<Card.Metric>`, `<Card.Actions>`) rather than ballooning props (`isCompact`, `showSubtitle`, `headerType`, `hasBadge`).

### 2. Frontend Design & Anti-AI Slop
- Resist generic SaaS cards and purple glow effects.
- CivicConnect uses high-contrast municipal styling: clear typography hierarchy, functional color coding (Emerald for resolved, Amber for coins/warnings, Rose for breaches), and compact data density.

### 3. UI/UX Pro Max & Mobile-First Best Practices
- **Touch Targets**: Minimum 44×44px on interactive elements or sufficient padded touch hitboxes.
- **Single-Line Strips**: On mobile screens (<640px), keep key metrics and filters to a single line or horizontal scrollable rows (`overflow-x-auto scrollbar-none flex-nowrap shrink-0`) to prevent burying primary feeds.
- **Accessibility**: 4.5:1 text-to-background contrast, visible focus outlines, and semantic ARIA labeling for icon-only action triggers.

### 4. Sleek Mobile Design
- Use when designing new standalone mobile flows, generating high-fidelity mobile mockups, or validating Capacitor Android mobile views.
