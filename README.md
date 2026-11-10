# BrandForge AI

**Open-source business naming studio by Veluxe Digital.**

Generate 12 AI-assisted business name candidates with taglines, rationales and subjective creative scores. Research `.com`, `.ai`, `.io`, and `.net` domain registrations via RDAP and launch the official USPTO trademark search. Save favorites locally and export a JSON shortlist.

## Features
- Responsive dark-mode React interface
- Server-side OpenAI naming generation
- Independent domain research endpoint using RDAP (registered / possibly available / unknown)
- Official USPTO trademark search link (manual research, **not automated clearance**)
- Local browser shortlist and JSON export
- Netlify Functions backend; no API key in the browser

## Quick start
1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env` and supply `OPENAI_API_KEY`.
3. Run `npx netlify dev` (install Netlify CLI if needed). This runs both the UI and functions.
4. Visit `http://localhost:8888`.

`npm run dev` alone starts the frontend but does not serve the `/api/*` Netlify functions.

## Deploy to Netlify
1. Create a new GitHub repository and upload these files to its root.
2. In Netlify, choose **Add new project > Import an existing project**, select GitHub and this repository.
3. Build command: `npm run build`; publish directory: `dist`. Netlify reads `netlify.toml` automatically.
4. In Netlify environment variables, set `OPENAI_API_KEY` as a secret; optionally set `OPENAI_MODEL`.
5. Deploy and test the generation and research buttons.

## Domain & trademark limitations
RDAP is a registration lookup, not a guaranteed registrar availability check. A 404 is shown as **possibly available**, never guaranteed. Some registries do not reliably expose RDAP; those results show **unverified**. Trademark research opens the official USPTO search page for manual queries. A missing exact match is **not** legal clearance; investigate similar marks, classes, common-law rights and jurisdictions before using a name. Creative scores are heuristic, not verified metrics.

## Security & production considerations
The demo has no authentication or usage limits. Before exposing it to substantial public traffic, add server-side rate limiting, bot protection and/or account quotas to protect API spend. Do not commit `.env` or API keys. Browser shortlist data remains on the current device and is not synchronized. OpenAI model availability and cost depend on your API account.

## License
MIT © 2026 Veluxe Digital.
