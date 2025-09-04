# Rappello

Send a mail summary of the latest product recalls published by the French government (rappel.conso.gouv.fr) to a specified recipient. You can run it as a local Express service or as a Netlify Function, and optionally schedule it externally to send a daily digest.

## Features

- Fetches latest recalls from the official RSS feed at `https://rappel.conso.gouv.fr/rss`.
- Parses RSS to HTML (title, link, description) for email-friendly output.
- Sends email via SMTP using Nodemailer.
- Two runtimes supported:
  - Local Express endpoint: `GET /notify?email=<recipient>`
  - Netlify Function endpoint: `/.netlify/functions/notify?email=<recipient>`
  - Secured by API key via header `x-api-key` (or `?api_key=`)
  - Only sends items published today (based on RSS `pubDate`).

## Architecture

- `index.js`: Express server exposing `GET /notify`.
- `netlify/functions/notify.js`: Netlify serverless function wrapper around the same controller.
- `controller.js`: Orchestrates the workflow (fetch RSS → send email).
- `fetchRss.js`: Downloads and parses the RSS feed, returns `{ title, content }` where `content` is HTML.
- `email.js`: Sends HTML email via Nodemailer SMTP transport.
- `config.js`: Loads environment variables (via `dotenv` in non-production) and exposes config.

Flow:
1) Incoming request provides `email` query param → 2) `fetchRss` retrieves and parses feed → 3) `email.sendEmail` sends HTML summary to recipient → 4) HTTP response confirms trigger (see notes on responses below).

## Requirements

- Node.js 18+ (tested on Node 22).
- SMTP credentials for a provider (e.g., Gmail, SMTP relay, etc.).

## Installation

1) Clone and install dependencies:

   - `git clone https://github.com/ismailnguyen/Rappello.git`
   - `cd Rappello`
   - `npm install`

2) Create a `.env` file in the project root:

```
# Email account used to send mails
EXPEDITOR_EMAIL=sender@example.com
EXPEDITOR_PASSWORD=your_smtp_password_or_app_password

# SMTP server settings (defaults to Gmail + 587 if unset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Local server port for Express
PORT=3000

# API key used to authorize requests
API_KEY=your-strong-random-key
```

Notes:
- If using Gmail, consider using an App Password (for accounts with 2FA) or a proper SMTP relay. Basic passwords may be blocked by provider policies.
- In production, set these environment variables in your hosting provider rather than committing `.env`.

## Running Locally (Express)

1) Start the server:

   - `npm start`

2) Trigger an email:

   - `curl -H "x-api-key: $API_KEY" "http://localhost:3000/notify?email=recipient@example.com"`

Response behavior:
- The Express route now awaits the send and returns `{ message: "Mail sent to recipient@example.com" }` on success. If no new items for today, returns the message `No new recalls for today` without sending an email.

## Netlify Function

This repo includes a function at `netlify/functions/notify.js` that wraps the same controller.

Deploying:
- Configure your site in Netlify and set the Functions directory to `netlify/functions` (either via Netlify UI or `netlify.toml`).
- Add the required environment variables (same keys as `.env`) in your Netlify site settings, including `API_KEY`.
- After deploy, invoke:

  - With header: `curl -H "x-api-key: $API_KEY" "https://<your-site>.netlify.app/.netlify/functions/notify?email=recipient@example.com"`
  - Or query param: `https://<your-site>.netlify.app/.netlify/functions/notify?email=recipient@example.com&api_key=$API_KEY`

Response behavior:
- The Netlify function awaits the email send and returns a body like `"Mail sent to recipient@example.com"` on success.
 - If no new items for today, returns `No new recalls for today`.

## Scheduling (Optional)

Rappello sends on demand. To send a daily digest, pair it with a scheduler:
- Netlify Scheduled Functions (cron) if available on your plan.
- GitHub Actions cron invoking the endpoint. Configure three repository secrets:
  - `BASE_URL` (e.g., `https://<your-site>.netlify.app/.netlify/functions` or local tunnel)
  - `USER_EMAIL` (recipient)
  - `API_KEY` (must match your deployed `API_KEY`)
- Any external cron (e.g., cron job hitting the Express or Netlify endpoint) must include the `x-api-key` header or `?api_key=` query param.

## Error Handling

- RSS fetch: returns errors for unreachable/empty/invalid RSS data.
- Email send: surfaces SMTP transport errors.
- 401 Unauthorized when API key is missing or invalid.
- The controller rethrows errors; check your logs (local console or Netlify logs) for details.

## API

- Local (Express): `GET /notify?email=<recipient>`
  - Status: `200 OK` immediately after triggering send.
  - Auth: Provide `x-api-key: <API_KEY>` header (or `?api_key=` query string).
  - Effect: Sends HTML email digest to `recipient`.

- Netlify: `GET /.netlify/functions/notify?email=<recipient>`
  - Status: `200 OK` with string body on success.
  - Auth: Provide `x-api-key: <API_KEY>` header (or `?api_key=` query string).
  - Effect: Sends HTML email digest to `recipient`.

## Project Scripts

- `npm start`: Run the Express server on `PORT` (default 3000).

## Folder Structure

```
.
├── config.js                  # Env + default config
├── controller.js              # Orchestrates fetch + send
├── email.js                   # Nodemailer SMTP send
├── fetchRss.js                # RSS fetch + parse → HTML
├── index.js                   # Express entrypoint
├── netlify/
│   └── functions/
│       └── notify.js         # Netlify Function entrypoint
├── package.json
└── README.md
```

## License

ISC — see `package.json`.

## Contributing

Issues and PRs are welcome. Please include clear steps to reproduce and proposed changes for feature requests or bug fixes.
