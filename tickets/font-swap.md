---
title: font swap
status: in-progress
priority: 3
created: 2026-07-20
locked_at: 20260724-082339
scope:
  - src/app/layout.tsx
---

## What
Replace the Inter font with Geist as the site's sans-serif body font.

## Why
Geist is the preferred sans-serif typeface going forward.

Assumptions: "across the board" refers to the sans-serif body font (currently
Inter, applied via the `--font-inter` CSS variable in `src/app/globals.css`),
not the Inria Serif logo font, which is a distinct decorative typeface and is
out of scope here. To keep the change minimal, the CSS variable name
`--font-inter` is preserved so `globals.css` doesn't need to change — only
the font loaded into that variable changes, from `Inter` to `Geist`.

## Acceptance criteria

- In `src/app/layout.tsx`, replace the `Inter` import from `next/font/google`
  with `Geist`, keeping the same `next/font/google` loading pattern already
  used for `Inria_Serif` (subsets, weight, `variable`, `display: "swap"`).
- The loaded font's `variable` remains `--font-inter` so no other files need
  to change, and the `className` applied to `<body>` continues to reference
  that same variable.
- Weights loaded should cover the weights currently used via `--font-inter`
  in `src/app/globals.css` (400, 500, 700).
- `Inria_Serif` (the `.logo` font) is untouched.
- Site builds successfully (`npm run build` or equivalent) and body text
  renders in Geist instead of Inter across all pages that inherit the
  `body` font-family from `globals.css`.
