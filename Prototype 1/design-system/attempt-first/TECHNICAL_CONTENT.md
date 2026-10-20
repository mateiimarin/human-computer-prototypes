# Math and code presentation

**Version:** 0.2 · **Scope:** every exercise, attempt preview, tutor turn, review snapshot, and evidence detail.

## Mathematics

Use a dedicated TeX renderer. The board now contains 11 expressions generated with **KaTeX 0.19.0**, including inline notation, a recurrence, superscripts, a summation, a fraction, and aligned derivation steps. The rendered output includes HTML for visual presentation and MathML for assistive technology. The KaTeX stylesheet and font files are bundled locally under `vendor/katex/`.

- Inline math follows the surrounding reading baseline and text size. Use it for symbols, conditions, and short expressions inside a sentence.
- Display math receives its own block. Align multiline derivations at relation signs using an `aligned` environment. Use actual fractions, superscripts, subscripts, sums, and spacing from the renderer.
- Prefer 16 px surrounding prose and roughly matching mathematical x-height. Do not use a monospace face for mathematical notation, substitute Unicode superscripts, or rasterize formulas.
- Preserve complete notation. An unusually wide expression scrolls within a clearly focusable local region; it must not stretch the page, clip silently, or break arbitrarily in the middle of a symbol. Stack logically related equations before introducing horizontal scrolling. Keep the block's focus ring inside its scroll boundary.
- Keep the original TeX source separate from rendered output. The board retains source in `data-tex` and MathML annotations. In the app, an editable source view and a rendered preview must refer to the same draft; show which mode is active. Switching modes preserves the text and does not submit or review the attempt.
- A malformed expression keeps its original source and shows an inline rendering error. Never replace it with an empty block. Avoid hover-only diagnostics.

For Nuxt, render through a shared math component with the same output on server and client. Use `output: 'htmlAndMathml'`, `trust: false`, finite expansion/size limits, and a caught parse error. Do not apply a raw-HTML directive to arbitrary student text. Keep renderer-generated markup distinct from authored prose. This handoff does not add a rich-text editor or real interpretation of student reasoning.

## Code

The board's Python example is generated with **Shiki 4.5.0**, using the GitHub Light theme. It is formatting reference material outside the answer-locked exercise flow. No code runs in the board.

- Use semantic `pre` and `code`, a visible language label, a neutral light surface, and JetBrains Mono at 14/24 px. Preserve indentation, line breaks, and exact selectable source text. Disable programming ligatures so operators retain their literal visible characters.
- Highlight according to an explicitly declared supported language. Unknown languages fall back to escaped plain code with a text label; do not guess or break the block.
- Inline identifiers use a restrained monospace treatment with a small neutral background. Do not style an entire technical paragraph as code.
- Let long code lines scroll inside the block. Prose continues to reflow normally. If line wrapping is later offered, make it an explicit control and preserve source indentation.
- Avoid decorative line numbers on short snippets. If numbers or annotations are needed for review references, keep them out of copied source and identify the relevant line with text as well as color.
- Any future Copy control must copy the exact original source and report completion through an accessible status message. Do not display a Copy or Run button without implementing its result.
- Use the same syntax theme in tutor responses, attempt previews, feedback, and evidence. Test every used token color against the actual background, including comments.

Use one shared renderer and [technical-content.css](technical-content.css). The current board contains pre-rendered output; it does not download highlighting JavaScript at runtime. The formatting libraries were used from a temporary authoring directory; no Nuxt project dependencies were installed by this design revision.

## Acceptance checks for the eventual app

Check inline baseline alignment; fractions, superscripts, and aligned equations; long-expression and long-code local scrolling; keyboard access to overflow; preserved/copyable source; a supported language and an unknown language; a malformed expression; draft/preview consistency; assistive-technology reading without duplicate visual output; and the same rendering in submitted snapshots and evidence.

Sources: [KaTeX API](https://katex.org/docs/api.html), [KaTeX options](https://katex.org/docs/options.html), [Shiki installation and usage](https://shiki.style/guide/install). These support the renderer APIs; the visual and interaction rules above are project design decisions.
