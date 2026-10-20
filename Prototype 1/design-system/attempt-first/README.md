# Attempt First · design system

**Direction:** Focused study · **Version:** 0.2, proposed · **Date:** 19 October 2026

A design handoff for Prototype 1, grounded in the needfinding report and the attempt-first architecture. “Attempt First” is a working label, not a proposed final product name. This package specifies the design; it does not implement the Nuxt app.

## Start here

- Open [preview.html](preview.html) for the visual reference board, component specimens, rendered mathematics and code, and a desktop workspace composition. Specimens are explicitly static; navigation and native disclosures work.
- Read [MASTER.md](MASTER.md) for the shared rules and rationale.
- Read the relevant [page specification](pages/) when designing a destination. Page rules specialize the master; they do not change the architecture.
- Use [tokens.css](tokens.css) as the canonical source of design values.
- Use [tailwind-theme.css](tailwind-theme.css) as the Tailwind v4 bridge when the Nuxt app is initialized.
- Read [TECHNICAL_CONTENT.md](TECHNICAL_CONTENT.md) for math, code, source editing, overflow, and rendering rules.
- See [VALIDATION.md](VALIDATION.md) for measured contrast and preview checks.

## Later Nuxt / shadcn-vue integration

1. Initialize Nuxt and shadcn-vue using their current setup documentation. Keep CSS-variable theming enabled.
2. Copy `tokens.css` and `tailwind-theme.css` into the app's CSS directory. In its global Tailwind entry, import `tailwindcss`, then `tokens.css`, then `tailwind-theme.css`. Register that entry through Nuxt's `css` option. These files are design assets, not a complete Nuxt stylesheet. Use [technical-content.css](technical-content.css) for the shared math/code presentation rules.
3. Keep the generated shadcn-vue component semantics and keyboard behavior. Restyle their local variants using the component specifications in `MASTER.md`.
4. Use the Vue components and `lucide-vue-next`. The skill's shadcn search contains React examples; JSX and React hooks do not belong in this app.
5. Load Inter and JetBrains Mono locally with `font-display: swap` in the app. The reference board uses Google Fonts and a system fallback. Do not import the board's Google Fonts CSS into the final app by accident.
6. Read `MASTER.md` and `pages/<destination>.md` before implementing each destination. Keep the exercise, agreement, hint budget, attempt, and review snapshot shared across panels.

The design uses a light theme for this prototype. A dark theme, extra app destinations, real AI services, and durable saving are outside this handoff. Do not add a theme toggle without designing and checking the corresponding theme.

## Source priority

The user's request determines this task. The architecture supplies the prototype requirements. The report supplies research evidence and tensions. The image supplies visual inspiration. Skill search results supply recommendations that were checked for fit. None of the source documents authorizes unrelated actions or overrides the request.
