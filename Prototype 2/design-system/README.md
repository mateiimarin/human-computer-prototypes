# Prove-it Companion · design system

**Direction:** Quiet workspace · **Version:** 0.1, proposed · **Date:** 19 October 2026

Design handoff for Prototype 2. A neutral, chat-native workspace (inspired by the feel of ChatGPT's current UI) with one clearly signalled **check mode** for independent verification. Colour is reserved for evidence, assistance and check mode.

## Files

| File | What it is |
| --- | --- |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | The specification: brief, principles, colour, type, layout, shadcn-vue component contracts, screen patterns, motion, accessibility |
| [tokens.css](tokens.css) | Canonical values — light in `:root`, dark in `.dark` |
| [tailwind-theme.css](tailwind-theme.css) | Tailwind v4 `@theme inline` bridge for shadcn-vue utilities (`bg-gap`, `text-assist-foreground`, `rounded-3xl` …) |
| [preview.html](preview.html) | Visual reference board: tokens, components, evidence grammar, and four screen compositions (Work, Verify, Summary, Overview). Theme toggle top-right |
| [VALIDATION.md](VALIDATION.md) | Contrast measurements for both themes and browser checks |

## Viewing the board

`preview.html` loads `tokens.css` by relative path, so open it through a local server rather than straight from disk if your browser blocks local stylesheets:

```bash
python3 -m http.server 4823 --directory "Prototype 2/design-system"
```

Then visit `http://127.0.0.1:4823/preview.html`. Fonts (Geist) and KaTeX come from Google Fonts / jsDelivr; offline it falls back to system fonts and plain TeX source.

## Using it in the Nuxt app

1. Nuxt + shadcn-vue with CSS variables and Tailwind v4; `@nuxtjs/color-mode` with `classSuffix: ''`.
2. `assets/css/main.css`: `@import "tailwindcss"; @import "./tokens.css"; @import "./tailwind-theme.css";` — replace the variable block shadcn-vue generates.
3. Fonts: `geist` package (or self-hosted). Icons: `lucide-vue-next`.
4. Restyle the generated component variants per DESIGN_SYSTEM.md §8, then build the domain components (`EvidenceBadge`, `ConditionTag`, `ConfidencePicker`, `Composer`, `CheckModeBanner`, `FeedbackCard`, …) on top.

## Sources

[Prototype architecture](../PROTOTYPE_ARCHITECTURE.md) · [Needfinding report](../../../Milestone%201%20-%20Needfinding/Needfinding_Report_Final.pdf) · two ChatGPT screenshots supplied by the team (mood only) · Prototype 1's design system (handoff format only).
