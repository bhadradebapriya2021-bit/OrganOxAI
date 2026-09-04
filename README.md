# OrganOxAI clinical dashboard

This project combines the supplied BioPulse React frontend with a same-origin Node/Express inference API.

## Run locally

```powershell
npm install
npm start
```

Open:

- Clinical portal: `http://localhost:3000/`
- ML model testing: `http://localhost:3000/model-testing`

`npm start` builds the Vite frontend and serves both the SPA and API from one process.

## Verification

```powershell
npm test
```

The test command performs TypeScript checking, creates a production build, and exercises valid and invalid requests against the ML API.

## API

- `GET /api/health`
- `POST /api/predict`

The model testing page is for synthetic or de-identified data only. Its dataset-label confidence scores are not diagnostic probabilities.
