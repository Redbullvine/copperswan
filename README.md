# The Copper Swan 🦢

An online **General Merchandise** store for **copperswan.net** — designed around the
Copper Swan ideal in **copper, black, and white**. Buy and sell with secure
**Stripe** checkout, automatic **sales-tax** calculation, and a Git → **Netlify**
deploy workflow.

---

## What's inside

```
copperswan/
├── netlify.toml                    # Netlify build + redirects + security headers
├── package.json                    # Stripe dependency for the functions
├── .env.example                    # Copy to .env for local dev (never commit .env)
├── public/                         # The website (this is what Netlify publishes)
│   ├── index.html                  # Storefront: hero, catalog, cart drawer
│   ├── success.html / cancel.html  # Post-checkout pages
│   ├── robots.txt / sitemap.xml
│   └── assets/  (css · js · img)   # Styles, storefront logic, swan logo + art
└── netlify/functions/              # Serverless backend
    ├── _catalog.js                 # ⭐ Your products & prices live here
    ├── products.js                 # Serves the catalog to the storefront
    └── create-checkout-session.js  # Creates the Stripe Checkout session
```

**How it works:** the browser only ever sends product *IDs and quantities*. All
prices are looked up server-side from `_catalog.js`, so a shopper can never edit
a price in their browser. Checkout redirects to Stripe's hosted, PCI-compliant
payment page — your site never touches card numbers.

---

## 🚀 One-time setup

### 1. Create a Stripe account & get your keys
1. Sign up at <https://dashboard.stripe.com>.
2. Go to **Developers → API keys** and copy your **Secret key** (`sk_...`).
   - Use **test mode** keys (`sk_test_...`) while you try things out.
   - Flip to **live** keys when you're ready to take real money.

### 2. Connect the repo to Netlify
1. Sign in at <https://app.netlify.com> → **Add new site → Import an existing project**.
2. Pick GitHub and choose the **`redbullvine/copperswan`** repository.
3. Build settings are auto-read from `netlify.toml` — just click **Deploy**.
   - Publish directory: `public`  ·  Functions: `netlify/functions`

### 3. Add your environment variables in Netlify
**Site settings → Environment variables** → add:

| Key                    | Value                          |
|------------------------|--------------------------------|
| `STRIPE_SECRET_KEY`    | your `sk_live_...` (or test)   |
| `STRIPE_TAX_ENABLED`   | `true`                         |
| `SITE_URL`             | `https://copperswan.net`       |
| `CURRENCY`             | `usd`                          |
| `SHIP_TO_COUNTRIES`    | `US`                           |

Then **Deploys → Trigger deploy** so the new values take effect.

### 4. Turn on Stripe Tax (you have a sales-tax license)
1. In Stripe: **Settings → Tax** → set your **origin address** and register
   your state(s). <https://dashboard.stripe.com/settings/tax>
2. Leave `STRIPE_TAX_ENABLED=true`. Tax is then calculated automatically at
   checkout based on the shopper's address.
   - Not ready yet? Set `STRIPE_TAX_ENABLED=false` to launch without tax and
     enable it later.

### 5. Point your domain
In Netlify: **Domain management → Add a domain → `copperswan.net`** and follow
the DNS steps (either use Netlify DNS or add the records at your registrar).
Netlify provisions HTTPS automatically.

---

## 🛍️ Managing your store

**Add, edit, or remove products** in `netlify/functions/_catalog.js`. Each entry:

```js
{
  id: "cs-swan-tumbler",          // unique, never reuse
  name: "Copper Swan Tumbler",
  category: "Home & Kitchen",
  price: 28.00,                    // DOLLARS — cents are handled for you
  description: "…",
  image: "/assets/img/product-tumbler.svg",  // local path or full https URL
  taxCode: "txcd_99999999",       // Stripe tax category (general goods)
  active: true                    // set false to hide without deleting
}
```

Commit and push — Netlify redeploys automatically. To use real product photos,
drop them in `public/assets/img/` and point `image` at them (or use a hosted URL).

The sample catalog ships with 8 general-merchandise items so the store looks
complete on day one — swap them for your real Petra inventory.

---

## 💻 Run it locally (optional)

Requires **Node 18+**.

```bash
npm install
npm install -g netlify-cli   # if you don't have it
cp .env.example .env         # then paste your real Stripe test key
netlify dev                  # serves site + functions at http://localhost:8888
```

Use Stripe **test cards** (e.g. `4242 4242 4242 4242`, any future date/CVC).

---

## 🔒 Security notes
- Real keys live only in `.env` (git-ignored) and Netlify env vars — never in the repo.
- Prices are enforced server-side; the client can't discount itself.
- Card data is handled entirely by Stripe Checkout — PCI scope stays off your site.

## Next ideas
- Order/inventory tracking via a Stripe webhook function.
- Customer accounts & order history.
- Discount codes (already enabled in Checkout via `allow_promotion_codes`).
