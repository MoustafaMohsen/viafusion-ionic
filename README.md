# ViaFusion

A wallet app for managing payments, transfers and virtual cards in one place, built with Ionic and Angular for the 2021 Rapyd Fintech Hackathon (Formula 0001: Rapyd Fintech Grand Prix), where it was a Circuit Winner. [Project page on Devpost](https://devpost.com/software/viafusion).

This branch turns the original app into a self-contained portfolio demo.

**Live demo: https://viafusion-demo.vercel.app**

Portfolio demo with simulated data. No real payments.

## What the demo covers

The original screens run against a simulated backend inside the browser. Nothing is sent to the original API or to Rapyd.

- Login with a phone number, a one-time code and a PIN
- Dashboard with balance and recent transactions
- Wallet top-up from fictional payment sources
- Transfers from several sources to several destinations, with simulated exchange rates
- Transfers from the wallet, and Insta-send to fictional recipients
- Virtual cards: create, view, freeze and unfreeze, and simulate a purchase
- Transaction history and wallet history
- Settings, with Log Out and Reset Demo

Features that are not simulated are marked "Not available in this demo": the marketplace, QR and checkout links, scheduled payments, IBAN transactions, physical cards and account deletion.

## Sample login

| Step | Value |
|---|---|
| Phone number | `+1 202 555 0143` (any valid number opens the same fictional account) |
| One-time code | `123456` |
| PIN | `654321` |

For Insta-send, search `555` to find the fictional recipients.

## Run locally

Angular 12 needs Node 14. The lockfile is for npm 6, which ships with it.

```
npm ci
npx ng serve
```

Open http://localhost:4200.

## Build

With Node 14:

```
npx ng build --configuration production
```

The output is written to `www/`. Demo mode is controlled by `demo` in `src/environments/`.

## Deploy

The site is deployed to Vercel as prebuilt static files, so nothing is built on Vercel. The first command packages `www/` into `.vercel/output` with the routing rules: real files are served as they are, and any other app route gets `index.html`.

With Node 14:

```
node scripts/prepare-vercel.js
```

With a current Node (the Vercel CLI does not run on Node 14) and after `vercel login`:

```
vercel link
vercel deploy --prebuilt
vercel deploy --prebuilt --prod
```

`vercel link` is needed once per checkout. The second command creates a preview; the third publishes to the live URL. Vercel treats the very first deployment of a new project as production, even without `--prod`.

The repository is not connected to Vercel's Git integration, because Vercel cannot build this project with a supported Node version.

## Limitations of the simulated data

- Everything is stored in the browser's local storage. It is not shared between devices and disappears when site data is cleared. Reset Demo in Settings restores the starting balance, cards and transactions.
- There is one fictional user. The phone number entered at login is not checked or stored, and neither are the code and the PIN.
- Payment sources, destinations, recipients, card numbers and exchange rates are invented. The rates are fixed and are not market rates.
- No money moves and no message is sent. Amounts are kept in US dollars to the cent.
- Screens that the demo does not simulate cannot be opened.
- The dependencies are those of the 2021 project and have not been updated.

## Credits

- Frontend: [Roqaya Mourad](https://github.com/roqayamourad)
- Backend: [Moustafa Mohsen](https://github.com/MoustafaMohsen)
