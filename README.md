# Bookly — Smart Book Tracker

Bookly is a responsive personal book-tracking web application built with HTML, CSS, JavaScript, Node.js and Express.

## Features

- Dashboard with reading statistics
- Add, edit and delete books
- Reading status management
- Favorites
- Ratings
- Search by title, author, genre or status
- Mood-based recommendations
- AI recommendation page
- Built-in fallback recommendations when no API key is configured
- Reading goal tracking
- LocalStorage persistence
- Responsive design
- Vitest unit tests
- Vercel-ready Express backend

## Run locally

1. Install Node.js 18 or newer.
2. Open this project folder in VS Code.
3. Run:

```bash
npm install
npm test
npm start
```

4. Open:

```text
http://localhost:3000
```

## Optional AI setup

Copy `.env.example` to `.env` and add your Anthropic API key:

```text
ANTHROPIC_API_KEY=your_key_here
```

The API key stays on the server and is not placed in frontend JavaScript.

If no API key is configured, the `/api/recommend` endpoint still works using built-in recommendations.

## Vercel deployment

Upload the project to GitHub, import the repository into Vercel, and add `ANTHROPIC_API_KEY` under the project's Environment Variables if live Anthropic recommendations are desired.

The included `vercel.json` routes the frontend and `/api/recommend` through the Express server.

## Project structure

- `index.html` — application UI
- `style.css` — responsive styling
- `script.js` — frontend application logic
- `server.js` — Express server and AI API route
- `utils.js` — reusable filtering functions
- `utils.test.js` — Vitest tests
- `vercel.json` — Vercel configuration
- `.env.example` — environment variable template
