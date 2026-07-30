This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tests

```bash
npm run build   # required first — tests read the static export in out/
npm test
```

Two suites run against the exported HTML, i.e. exactly what a visitor or crawler receives:

- `tests/governance-content.test.mjs` guards the standards claims on `/ai-agents`. Yabloko Labs holds no ISO
  certifications, so the shipped page must never assert one. The suite fails the build if certification-implying
  wording appears, if a promised standard goes missing, if the unpublished ISO/IEC TS 25570 is mentioned without
  being qualified as emerging, or if the research DOI stops resolving.
- `tests/prerender.test.mjs` guards server rendering. Wrapping `{children}` in a component loaded with
  `dynamic(..., { ssr: false })` silently strips every page down to an empty shell with no crawlable markup and no
  JSON-LD. The suite fails if the export stops shipping rendered HTML.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
