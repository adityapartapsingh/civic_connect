# Anti-AI-Slop Frontend & UI Rule

Detect and eliminate "AI slop" aesthetics in websites, web apps, landing pages, dashboards, components, and any frontend UI generated or reviewed.

## Core Mandate

Resist the statistical average (purple gradients, rounded-2xl cards everywhere, Inter font, three-feature grids, glassmorphism, vague buzzwords). Every default the model wants to reach for is suspect.

### Output Protocol Before Generating Any Frontend Code
Before writing any HTML, CSS, React, Tailwind, or frontend component:
1. **State the aesthetic direction in one line** (e.g., "Going Swiss / functional: strict grid, hairline borders, zero rounded corners, single amber accent, high contrast").
2. **State 2-3 deliberate violations being made** (e.g., "No gradients. Sharp 0px corners. Monospace metadata. Tabular data-dense view instead of generic 3-card grid").
3. **Then write the code.**

### Refusal Checklist
- **Visuals**: Refuse purple/blue gradients, glassmorphism blur, universal `rounded-2xl`, untouched default Tailwind palettes (`indigo-500`, `slate-900`), centered dual-button heroes, generic 3D blobs/isometric art.
- **Copy**: Never use words like "Seamlessly", "Unlock", "Revolutionize", "Empower", "Elevate", "Effortlessly", "Delve", "Unleash", or parallel feature triplets ("Build faster. Ship smarter."). Use specific metrics, real dates, and direct verbs.
- **States**: Mandatory coverage for empty state (useful, no generic sparkles), loading state (structural skeleton screens, not spinners), and descriptive error states.
- **Icons & Motion**: Use custom SVGs or text badges with intent. Avoid generic `transition-all duration-300` and scroll fade-up spam.
