# IFIG Intelligence — Production AI

This project upgrades the IFIG website from built-in canned answers to a secure
server-side AI assistant.

## Architecture

Browser (`index.html`) → `/api/chat` → OpenAI Responses API

The API key is NEVER stored in `index.html`.

## Deploy on Vercel

1. Upload this whole folder to a GitHub repository.
2. Go to Vercel and import the repository.
3. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` = your OpenAI API key
   - optional `OPENAI_MODEL` = `gpt-5.6-luna`
4. Deploy.
5. Open the deployed site and test **IFIG Intelligence**.

Vercel automatically serves `api/chat.js` as `/api/chat`.

## What the AI knows

- IFIG = International Financial Institution Group
- Founder & CEO: Husniddin Nomonov
- Concept origin: 2013
- Markets, Research, CFTC Positioning, Crypto Screener, Forex, Chart,
  Economic Calendar, Calculators, About and Support
- IFIG support contacts
- Professional factual rules that prevent invented licenses, AUM, partnerships
  or regulatory claims

## Dynamic website context

The frontend also sends:
- active IFIG workspace
- recent chat history
- available Research asset/score/bias/confidence
- available macro selector values

This means the AI can respond differently when the user is in Research, Crypto,
Calendar, Positioning, etc.

## Important

A GitHub Pages site alone cannot safely host the secret AI key or execute the
server function. Deploy this project on a serverless platform such as Vercel
(or adapt `api/chat.js` to another backend).

Do not put `OPENAI_API_KEY` directly into the HTML or public GitHub code.
