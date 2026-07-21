# Copper Swan

Copper Swan is a mobile-first Phase 1 demonstration marketplace for local shopping and delivery across Alabama's Wiregrass area. The experience includes customer shopping, a one-merchant cart, simulated checkout and order tracking, plus merchant, driver, and administration dashboards.

## Demo routes

- `/` — customer homepage
- `/shop` — merchant marketplace with search, filters, and sorting
- `/merchant/hearth-pine` — sample merchant storefront
- `/cart` and `/checkout` — cart and simulated checkout
- `/orders` — locally saved orders and tracking
- `/merchant/signup` and `/merchant/dashboard` — merchant workflow
- `/driver/signup` and `/driver/dashboard` — driver workflow
- `/admin` — demo administration overview

All customer data, demo applications, cart state, operational changes, and orders are saved only to browser `localStorage`. There are no payment processors, external APIs, real GPS, email, SMS, banking integrations, or production authentication.

## Local development

```bash
npm install
npm run dev
```

The site remains a static Netlify project. `netlify.toml` publishes `public/` and includes the SPA fallback needed for internal-route refreshes.
