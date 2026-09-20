# ClauseGuard — Know what you're signing

Built for **HackDevengers 2.0** (24-hour Open Innovation Hackathon, sponsored by Lovable, powered by Unstop).

## The problem

People sign contracts, leases, and terms of service every day without reading them — not because they don't care, but because legal language is dense, long, and designed to be skimmed past. Unfair clauses (hidden fees, one-sided termination terms, liability waivers) get buried in paragraphs no one has time to parse. By the time it matters, it's too late to negotiate.

## What ClauseGuard does

ClauseGuard is an AI-powered document risk scanner. Paste or upload any contract, lease, or terms-of-service document, and it:

- **Flags risky clauses** — financial traps, one-sided liability terms, unusual termination conditions, privacy overreach, and more
- **Explains each one in plain language** — no legal jargon, just what it actually means for you
- **Tells you why it matters** — the concrete real-world consequence if the clause is enforced
- **Scores the document 0–100** for overall risk, so you get an instant read before diving into details

It works on rental agreements, freelance/employment contracts, app terms of service, loan agreements, or any binding document — no legal background needed to understand the output.

## How it works

1. Upload a PDF/text file, or paste text directly
2. The document text is sent to Google Gemini with a structured prompt that forces reliable, schema-based JSON output
3. The app parses the response and renders risk-scored clause cards, grouped by severity, with a summary and overall risk gauge

## Tech stack

- **Frontend:** Vanilla HTML/CSS/JavaScript — single-page app, no build step
- **PDF parsing:** [PDF.js](https://mozilla.github.io/pdf.js/) (client-side, in-browser)
- **Backend:** A single Vercel serverless function (`/api/analyze.js`) that holds the Gemini API key privately and proxies requests — the key never reaches the browser or any user
- **AI:** Google Gemini API, called server-side with structured prompting and JSON schema enforcement
- **Hosting:** Vercel (static frontend + serverless function, deploys together with zero extra config)

## Running it locally

You'll need the [Vercel CLI](https://vercel.com/docs/cli) to run the serverless function locally (a plain static server won't execute `/api/analyze.js`):

```bash
npm install -g vercel
vercel dev
```

Then visit the local URL it prints (usually `http://localhost:3000`). Set your Gemini key first — see below.

## Deploying (one-time setup)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import the repo — Vercel auto-detects the static frontend and the `/api` function
3. Before (or right after) deploying, add an environment variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free to create)
4. Deploy. You'll get a live URL — visitors can use the app immediately with no key of their own and no setup screen.

This is a one-time setup for whoever deploys the project. End users just open the link, upload or paste a document, and get results — nothing to configure on their end.

## Try it fast

Click **"Try a sample rental agreement"** in the app to see ClauseGuard analyze a pre-loaded lease with several intentionally risky clauses — no file needed.

## Future scope

- Support for more document types: insurance policies, loan agreements, employment offer letters
- Multi-language support for non-English contracts
- A follow-up Q&A mode where users can ask about a specific flagged clause in more depth
- Clause-level negotiation suggestions ("here's language you could propose instead")
- Browser extension that scans terms-of-service pages automatically before you click "I agree"
- Team/plan support for lawyers or small businesses reviewing contracts in bulk

## Disclaimer

ClauseGuard is an informational tool, not legal advice. It's designed to help people understand what they're reading — always consult a qualified professional for decisions that carry real legal or financial weight.

---

Built with Google Gemini for HackDevengers 2.0.
