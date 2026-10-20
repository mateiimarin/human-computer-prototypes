# Design-system validation

**Version:** 0.2 · **Checked:** 19 October 2026 · **Scope:** design assets and reference board.

## Revision and visual review

The v0.2 refinement replaces rounded Nunito Sans with Inter, uses medium-weight controls and headings, reduces control/card radii to 6/10 px, removes the mascot, flattens component sections, and gives the workspace one shared frame with column dividers. It also introduces actual typeset math and highlighted code. The learning flows are preserved.

Final rendered references: [cover](preview-cover.png), [workspace](preview-workspace.png), and [math/code](preview-technical.png). Desktop and 375 px technical-content views were visually inspected.

## Math and code verification

- All 11 TeX expressions render successfully and include 11 MathML representations. No KaTeX error nodes were found.
- KaTeX fonts load from bundled assets. The final vendored stylesheet matches the original package distribution; all referenced font files exist.
- Shiki generates 30 styled syntax tokens. The Python source, operators, line breaks, and indentation match the original string exactly.
- Code uses JetBrains Mono with programming ligatures disabled. Inter loads for the interface.
- Wide mathematical expressions and code have local scroll boundaries and keyboard focus; they do not create page overflow.

## Browser checks

Isolated headless Chrome / Playwright, local HTML file:

- 320, 375, 768, 1024, 1280, and 1440 CSS px: viewport and document widths match; no offscreen main content outside intentional math/code scroll regions.
- Landscape 844 × 390 CSS px: no horizontal document overflow.
- Preference selection, disclosure open/close, and editable text specimens work.
- Keyboard focus is visible with a 3 px outline, including on a technical-content scroll region.
- Reduced-motion tokens resolve to 0 ms. No uncaught page errors.
- Semantic Tailwind utilities compile after the token revision.
- Local links, fragment targets, stylesheet/font references, token references, and placeholder markers were checked.

## Contrast

Measured with the WCAG relative-luminance formula. All 20 checked UI text pairs meet 4.5:1; all five control-edge/focus pairs meet 3:1. Decorative dividers remain intentionally quieter and are not the sole indicator of a form control.

| Foreground token | Background token | Ratio |
| --- | --- | ---: |
| `foreground` | `background` | 12.52:1 |
| `foreground` | `card` | 13.29:1 |
| `muted-foreground` | `background` | 5.54:1 |
| `muted-foreground` | `card` | 5.88:1 |
| `muted-foreground` | `muted` | 5.03:1 |
| `muted-foreground` | `accent` | 4.60:1 |
| `primary-foreground` | `primary` | 8.46:1 |
| `primary-foreground` | `primary-hover` | 7.25:1 |
| `primary-foreground` | `primary-active` | 6.21:1 |
| `guidance-foreground` | `guidance` | 5.79:1 |
| `student-foreground` | `student` | 6.43:1 |
| `mixed-foreground` | `mixed` | 6.01:1 |
| `unclear-foreground` | `unclear` | 5.71:1 |
| `warning-foreground` | `warning` | 6.52:1 |
| `destructive-foreground` | `destructive` | 6.30:1 |
| `destructive` | `danger-surface` | 5.47:1 |
| `destructive` | `card` | 6.30:1 |
| `disabled-foreground` | `disabled` | 4.68:1 |
| `foreground` | `selection` | 11.88:1 |
| `foreground` | `apricot` | 6.69:1 |

### Actual code syntax colors

| Token color | White code surface |
| --- | ---: |
| `rgb(215, 58, 73)` | 4.57:1 |
| `rgb(111, 66, 193)` | 6.51:1 |
| `rgb(36, 41, 46)` | 14.67:1 |
| `rgb(0, 92, 197)` | 6.29:1 |
| `rgb(106, 115, 125)` | 4.82:1 |

## Limits

This is a design handoff, not a built Nuxt app or a WCAG conformance audit. Static product specimens do not implement tutoring, hint accounting, review, or session storage. The future app's modal focus behavior, full screen-reader journeys, true browser 200% zoom, editable-source/preview switching, malformed input handling, and all eight architecture walkthroughs remain build acceptance checks. No learning-outcome or usability study has been performed.
