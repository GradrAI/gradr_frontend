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

## Landing-page messaging

English and French landing copy lives in `src/i18n/locales/en.json` and `fr.json`. Keep both languages aligned with the evidence boundaries in the founder briefing; prototype results are not production accuracy, fairness, learning-gain or time-saving guarantees.

- Primary pilot CTAs use the existing contact form (`#pilot-contact`); research CTAs focus `#research-evidence`. Sign-in and signup remain available. Study requests do not publish the manuscript or private briefing.
- Pricing amounts, credits and declared seats remain API-driven. The landing displays numeric validity and rail/product-specific billing labels instead of promotional API descriptions or academic-period expiry claims. Billing behavior is unchanged.
- Update `index.html`, the landing metadata effect and `public/og-image.png` alongside relevant copy changes. The landing resets metadata on language changes and navigation back from the blog.
- Verify with `bun run test src/__tests__/components/ContactForm.test.tsx` and `bun run build`, then exercise EN/FR, desktop/mobile, pilot/research focus, both pricing rails and contact success/failure in a browser. Intercept contact requests during smoke checks; do not send test mail.

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
