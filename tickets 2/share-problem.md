# Ticket 14 — Share-this-problem link

## Goal

After every result (right or wrong), surface a small "share this problem" button on the result panel. Clicking copies a per-problem URL to the clipboard. Visiting that URL opens the same problem in a "challenge mode" — clean view, framed as "your friend sent you this problem," with attempts not saved to history and the solved-counter not incrementing.

## URL shape

Hash-based to avoid a router dependency:

```
https://complexity-practice.example/#/p/<problem-id>
```

Hash routing keeps deployment simple (any static host serves the SPA without rewrite rules) and keeps `index.html` the only HTML file shipped.

## Challenge mode behavior

When the URL hash matches `#/p/<id>` and the id maps to a real problem:

- That problem is shown immediately, regardless of session state.
- A small one-line banner above the prompt panel reads something like *"a friend sent you this problem"* (or "challenge mode — your friend sent you this problem").
- The solved counter does **not** increment on correct submission.
- Attempts are **not** saved to localStorage.
- Easy-ramp logic is bypassed.
- Clicking "Next problem" exits challenge mode (clears the hash) and returns to the normal random rotation.

## Share button

In `ResultPanel`, add a small text-button (not a primary CTA) next to the "Next problem" button:

- Label: *"Copy share link"*
- On click: `navigator.clipboard.writeText(...)` of the share URL for the current problem; flash a brief *"Copied!"* indicator.

## Acceptance criteria

- Hash route `#/p/<id>` opens the matching problem
- Invalid id falls back to normal random session (no error)
- Challenge mode banner visible
- Solved counter doesn't increment in challenge mode
- Attempts not persisted in challenge mode
- Share button on result panel copies URL with brief feedback
- Clicking next exits challenge mode and clears the hash
- Tests still pass
