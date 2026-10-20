# Design-system validation

**Version:** 0.1 · **Checked:** 19 October 2026 · **Scope:** `tokens.css` and `preview.html`.

## Contrast

Computed with the WCAG 2.x relative-luminance formula for every semantic pair the components use, in both themes. All 33 pairs pass: text pairs ≥ 4.5:1; state dots, control edges and focus ring ≥ 3:1. Decorative `--border` dividers are intentionally quieter and never the only cue for a control.

Two values were adjusted during validation: light `--evidence-partial-dot` (`#D49100` → `#B57D00`, was 2.7:1) and dark `--destructive` (`#E5483C` with white text → `#FF7B6E` with dark text, was 3.9:1).

| Foreground | Background | Min | Light | Dark |
| --- | --- | ---: | ---: | ---: |
| `foreground` | `background` | 4.5:1 | 19.44:1 | 16.34:1 |
| `foreground` | `card` | 4.5:1 | 19.44:1 | 14.58:1 |
| `foreground` | `muted` | 4.5:1 | 17.67:1 | 13.63:1 |
| `foreground` | `accent` | 4.5:1 | 16.45:1 | 11.99:1 |
| `muted-foreground` | `background` | 4.5:1 | 6.58:1 | 7.47:1 |
| `muted-foreground` | `card` | 4.5:1 | 6.58:1 | 6.67:1 |
| `muted-foreground` | `muted` | 4.5:1 | 5.99:1 | 6.23:1 |
| `muted-foreground` | `accent` | 4.5:1 | 5.57:1 | 5.48:1 |
| `primary-foreground` | `primary` | 4.5:1 | 19.44:1 | 16.34:1 |
| `primary-foreground` | `primary-hover` | 4.5:1 | 14.16:1 | 13.02:1 |
| `link` | `background` | 4.5:1 | 5.73:1 | 8.57:1 |
| `link` | `card` | 4.5:1 | 5.73:1 | 7.65:1 |
| `ring` | `background` | 3:1 | 4.65:1 | 6.97:1 |
| `ring` | `card` | 3:1 | 4.65:1 | 6.22:1 |
| `input` | `card` | 3:1 | 3.45:1 | 3.23:1 |
| `input` | `composer` | 3:1 | 3.14:1 | 3.02:1 |
| `evidence-demonstrated-foreground` | `evidence-demonstrated` | 4.5:1 | 6.21:1 | 8.63:1 |
| `evidence-partial-foreground` | `evidence-partial` | 4.5:1 | 6.06:1 | 9.28:1 |
| `evidence-gap-foreground` | `evidence-gap` | 4.5:1 | 5.75:1 | 7.84:1 |
| `evidence-unverified-foreground` | `evidence-unverified` | 4.5:1 | 5.83:1 | 6.16:1 |
| `assist-foreground` | `assist` | 4.5:1 | 6.46:1 | 7.97:1 |
| `check-foreground` | `check` | 4.5:1 | 5.89:1 | 8.06:1 |
| `evidence-demonstrated-foreground` | `card` | 4.5:1 | 6.98:1 | 9.68:1 |
| `evidence-partial-foreground` | `card` | 4.5:1 | 6.75:1 | 10.31:1 |
| `evidence-gap-foreground` | `card` | 4.5:1 | 6.62:1 | 8.14:1 |
| `assist-foreground` | `card` | 4.5:1 | 7.44:1 | 8.41:1 |
| `check-foreground` | `card` | 4.5:1 | 6.75:1 | 8.68:1 |
| `evidence-demonstrated-dot` | `card` | 3:1 | 3.45:1 | 8.59:1 |
| `evidence-partial-dot` | `card` | 3:1 | 3.56:1 | 9.12:1 |
| `evidence-gap-dot` | `card` | 3:1 | 4.37:1 | 6.13:1 |
| `evidence-unverified-dot` | `card` | 3:1 | 3.45:1 | 4.01:1 |
| `destructive-foreground` | `destructive` | 4.5:1 | 5.65:1 | 7.64:1 |
| `destructive` | `card` | 4.5:1 | 5.65:1 | 6.82:1 |

Code syntax colours in the board follow GitHub Light / Dark (as Shiki's `github-light` / `github-dark` would produce); re-check them against `--surface-raised` when the real Shiki themes are wired up.

## Browser checks (built-in browser, served over local HTTP)

- Light, dark and system themes switch correctly; the choice persists per browser and falls back to the system preference.
- Geist / Geist Mono load; all 24 KaTeX expressions render with MathML.
- 375 px: document width equals viewport; no element overflows outside intentional scroll regions (tables, code, display maths). The app frames drop the rail and the session panel and reflow to one column.
- The Verify specimen's *Show references* opens a confirmation; confirming switches the banner from check-blue to assisted-violet, reveals references, keeps the draft, and returns focus to the toggle.
- The skip confirmation opens as a native modal dialog with *Keep going* focused.

## Limits

This is a design handoff, not the Nuxt app. Screen-reader journeys, 200 % zoom, full keyboard runs of each walkthrough, and the ten architecture journeys remain acceptance checks for the build. No usability testing has been done; the "quiet workspace" direction and the check-mode signal are hypotheses to test.
