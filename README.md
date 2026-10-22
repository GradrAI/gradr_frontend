# Gradr
## Overview
Gradr is an AI tool for grading paper-based tests built using Google Gemini models.

## Aim
The aim of the Gradr AI tool is to:
- support rubric-based teacher review without claiming bias-free grading,
- improve transparency of assessment,
- provide feedback for students,
- improve record keeping,
- "have everyone in the loop",
- provide analytics.

## Runtime and toolchain

Use Node.js 24.x and Bun 1.2.21. `.nvmrc` selects Node 24 locally, and `package.json` declares the same major for Vercel. The linked Vercel project's Node.js setting must also stay on 24.x.

```sh
nvm use
bun install --frozen-lockfile
bun run dev
bun run test
bun run build
```

The build logs the Node version before type-checking and bundling. Vite 8 and its React plugin 6 share the build pipeline with Vitest 4; TypeScript uses bundler module resolution. React 18, Tailwind 3 and the application-library major versions remain unchanged. `vite.config.ts` explicitly preserves the previous JavaScript/CSS compilation targets; it does not add browser API polyfills.

Commit `bun.lock` with dependency changes. Production deploys from GitHub `main`; do not deploy a local smoke-test build containing overridden API URLs.

## Landing-page messaging

English and French landing copy lives in `src/i18n/locales/en.json` and `fr.json`. The primary acquisition audience is paid-cohort tutors and tutorial centres, followed by independent training providers; schools and student workflows remain supported.

- Hero and closing primary CTAs open `/auth/account-type`; cohort-demo CTAs use the existing contact form (`#demo-contact`), and the hero workflow action focuses `#how-it-works`. Mobile signup is visible without opening the menu. Account labels prioritize tutors/trainers while preserving the existing `individual`, `institution`, `joining` and `student` role values.
- Pricing amounts, credits, validity and seats remain API-driven. `src/lib/paymentPlanPresentation.ts` shares safe billing/detail classifications between landing and checkout, with custom Enterprise preceding free-trial handling. NGN offers are prepaid; additional capacity is under a disclosure on the landing. Keep the account-wide expiry warning, numeric validity and top-up comparison; do not change billing behavior through copy.
- Update `index.html`, the landing metadata effect and `public/og-image.png` alongside relevant copy changes. The landing resets metadata on language changes and navigation back from the blog.
- Verify with `bun run test src/__tests__/components/ContactForm.test.tsx src/__tests__/components/Pricing.test.tsx` and `bun run build`, then exercise EN/FR, desktop/mobile, signup roles, demo/workflow focus, both payment rails, Enterprise/unknown-plan disclosures, empty/failed offers and contact success/failure in a browser. Intercept contact requests during smoke checks; do not send test mail or payments.

## Useful links
- [Backend repo](https://github.com/Fiewor/gradr_backend)
- Sample [question](https://docs.google.com/document/d/1DGKDA-I6rrNVxaKSbOc36FLm1sNKRg9G/edit?usp=sharing&ouid=116909890296741214749&rtpof=true&sd=true) and [marking guide](https://docs.google.com/document/d/1VJ8cXl0_Czs30I4IWmOxf-Xw-1dhW0PC/edit?usp=sharing&ouid=116909890296741214749&rtpof=true&sd=true) (for use in the upload form).
- [Live URL](https://grdr.vercel.app/)
- [Project description](https://devpost.com/software/gradr)
- [API Documentation](https://cloudy-capsule-44664.postman.co/workspace/New-Team-Workspace~174ee81f-2f9e-4354-8d9b-f0c9790c9ba7/collection/32419010-47f26ab5-7497-4db8-8998-b4e58346ada4?action=share&creator=32419010)

## Technologies:
- React
- React Query
- Tailwind CSS
- Semantic UI React

## Team
- [John Fiewor](https://github.com/Fiewor)
- [Jeremiah Aboyeji](https://www.linkedin.com/in/iamaboyeji/?lipi=urn%3Ali%3Apage%3Ad_flagship3_detail_base%3Bs1ZPSxRITFyraY9Lx3p60g%3D%3D)
- [Abdulsalam Adams](https://github.com/0xaplus)
- [AbdulSamad Abduljaleel](https://www.linkedin.com/in/abdul-samad-abdul-jaleel/?lipi=urn%3Ali%3Apage%3Ad_flagship3_detail_base%3Bs1ZPSxRITFyraY9Lx3p60g%3D%3D)
