# ClauseGuard

A small web app that reads a contract, lease or terms of service and points out the clauses that could hurt you, with a plain-English explanation of each one.

Live demo: https://YOUR-PROJECT.vercel.app

## What it does

You upload a PDF, TXT or Markdown file (or paste the text) and click Analyze. You get an overall risk score out of 100, a short summary of the document, and a list of flagged clauses sorted into high, medium and low risk. Each clause shows the original wording, what it means in simple terms, and why it matters if you sign it.

There's a sample rental agreement built in if you just want to see how it looks.

## How it works

The page pulls text out of PDFs in the browser using PDF.js, trims it to the first 6,000 words, and sends it to `/api/analyze`. That serverless function calls the Gemini API with a prompt that asks for a fixed JSON structure: document type, risk score, summary, and a list of risky clauses. The page then renders whatever comes back. The API key only exists on the server, never in the browser.

Built with plain HTML, CSS and JavaScript, PDF.js, a Vercel serverless function and the Google Gemini API. There's no build step and no dependencies to install.

## Run it locally

You need Node.js and the Vercel CLI (`npm i -g vercel`).

```bash
git clone https://github.com/Highorder-Thinking/ClauseGuard.git
cd ClauseGuard
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and put it in a `.env` file in the project root:

```
GEMINI_API_KEY=your_api_key_here
```

Then start the dev server and open the address it prints (usually http://localhost:3000):

```bash
vercel dev
```

## Deploy

```bash
vercel --prod
```

Add `GEMINI_API_KEY` in your Vercel project under Settings → Environment Variables, otherwise the deployed API will return an error. The `.env` file is in `.gitignore` and should never be committed.

## Project layout

```
api/analyze.js    serverless endpoint that calls Gemini
index.html        the interface, styles and client-side logic
package.json
```

## Limitations

- Only the first 6,000 words of a document are analyzed.
- Scanned PDFs that are just images won't work, since there's no text to extract.
- The analysis comes from an AI model, so it can miss clauses or misjudge how risky one is. It is not legal advice, and for anything with real financial or legal consequences you should have a qualified person read it.
- The document text is sent to the Gemini API to be analyzed, so don't submit anything you wouldn't want shared with a third-party service.
