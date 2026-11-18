# Broke But Brilliant

A playful student expense tracker with a budget-visualizing money jar and spending-personalized money tips. Built with React (JSX), Vite, and a small Express API.

## Run locally

1. Install Node.js 18 or newer.
2. From this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

Expenses, the monthly budget, a UPI ID, and pocket-money request notes are saved in `server/data.json`.

## Payment and request notes

UPI connect is a prototype state: it saves the entered ID and marks it connected in the local tracker. It does not connect to a bank, import transactions, or initiate payments. Never enter a UPI PIN or bank password. Pocket-money requests are stored in the local tracker; use the Share action to send a request through your device's share sheet (or copy the text).

## GitHub Pages preview

The `main` branch deploys to GitHub Pages using `.github/workflows/deploy.yml`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

GitHub Pages serves only the frontend, so this deployment uses sample data. Changes are not saved there; the expense API, UPI demo state, and pocket-money requests require the Node.js server. The full app can still be run locally with the instructions above.
