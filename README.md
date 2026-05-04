# Big O Gym

[bigogym.io](https://bigogym.io) — a web tool for practicing time/space complexity analysis on code snippets. Built for engineers prepping technical interviews.

See `SPEC.md` for the product spec and `TICKETS.md` for the implementation plan.

## Setup

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run test     # run unit tests
npm run build    # produce static build in dist/
npm run preview  # preview the production build locally
```

## Conventions

See `CLAUDE.md` for project conventions and `DECISIONS.md` for non-obvious choices.

## Deployment

Static output in `dist/` — deploy to Cloudflare Pages, Vercel, Netlify, or any static host. The build command is `npm run build`; the output directory is `dist`.
