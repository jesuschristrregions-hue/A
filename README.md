# Omar Thing Local Data Builder

A lightweight, local-first web app for fetching the Omar Thing API once, storing the JSON locally, and reusing it via import/export.

## Quick start

Open `app/index.html` in your browser. The app:

- Fetches the API once per dataset and stores it in `localStorage`.
- Lets you export the JSON to a file.
- Lets you import a saved JSON file to avoid another API call.

## Notes

- The API call is locked after a successful fetch or import. Use **Clear Local Data** to reset.
- All processing happens locally, aside from the single API request.
- iPhone use: host `app/` over HTTPS (e.g., any static host), open it in Safari, then use **Share → Add to Home Screen** to run it like an app. This does not require tinkering beyond hosting the static files once.
