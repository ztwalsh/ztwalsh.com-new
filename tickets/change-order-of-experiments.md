---
title: Change order of experiments
status: review
priority: 2
scope:
  - src/app/page.tsx
created: 2026-07-20
locked_at: 20260720-065558
pr: https://github.com/ztwalsh/ztwalsh.com-new/pull/3
---

## What
The `experiments` array in `src/app/page.tsx` (rendered under the "Experiments" section heading) currently lists, in order: Async design feedback, Conversational readme, AI wallpapers.

1. Add a new entry for "move/think" at the top of the array, linking to https://apps.apple.com/us/app/move-think/id6770284427 — follow the existing entry shape (`title`, `description`, `url`). Write a short description in the same voice/length as the existing entries.
2. Reorder the rest so the final array order is: move/think, Conversational readme ("readme"), AI wallpapers ("wallpaper"), Async design feedback ("design feedback") — i.e. design feedback moves from first to last.

## Why
I want to reflect the things I think are more relevant and important.

## Acceptance criteria
- `experiments` array order is: move/think, Conversational readme, AI wallpapers, Async design feedback.
- The new move/think entry links to https://apps.apple.com/us/app/move-think/id6770284427 and follows the same title/description/url shape as the existing entries.
- No other entries' title/description/url text changes.
