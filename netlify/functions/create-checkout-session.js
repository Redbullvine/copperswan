// =====================================================================
// Creates a Stripe Checkout Session from the shopper's cart.
// POST /api/create-checkout-session
// Body: { "items": [ { "id": "cs-swan-tumbler", "quantity": 2 }, ... ] }
//
// Security: the browser only ever sends product IDs + quantities. All
// prices, names, and tax codes are looked up from the server-side
// catalog (_catalog.js) so the amount charged cannot be tampered with.
// =====================================================================
const { findById } = require("./_catalog");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.startsWith("sk_test_replace")) {
    return json(500, {
      error:
        "Stripe is not configured yet. Set STRIPE_SECRET_KEY in your Netlify environment variables.",
    });
  }

  const stripe = require("stripe")(secretKey);

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    return json(400, { error: "Your cart is empty." });
  }

  const currency = (process.env.CURRENCY || "usd").toLowerCase();
  const taxEnabled = String(process.env.STRIPE_TAX_ENABLED || "true") === "true";
  const shipTo = (process.env.SHIP_TO_COUNTRIES || "US")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  // Build line items from the trusted catalog.
  const line_items = [];
  for (const entry of items) {
    const product = findById(entry.id);
    const quantity = Math.max(1, Math.min(99, parseInt(entry.quantity, 10) || 1));
    if (!product) {
      return json(400, { error: `Unknown or unavailable item: ${entry.id}` });
    }
    line_items.push({
      quantity,
      price_data: {
        currency,
        unit_amount: Math.round(product.price * 100), // dollars -> cents
        product_data: {
          name: product.name,
          description: product.description,
          metadata: { catalog_id: product.id },
          ...(product.image && product.image.startsWith("http")
            ? { images: [product.image] }
            : {}),
          ...(taxEnabled && product.taxCode
            ? { tax_code: product.taxCode }
            : {}),
        },
        ...(taxEnabled ? { tax_behavior: "exclusive" } : {}),
      },
    });
  }

  const origin = getOrigin(event);

  const sessionParams = {
    mode: "payment",
    line_items,
    success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel.html`,
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: shipTo },
    phone_number_collection: { enabled: true },
    allow_promotion_codes: true,
    // Let shoppers know who they're buying from on the receipt.
    metadata: { store: "The Copper Swan" },
  };

  if (taxEnabled) {
    sessionParams.automatic_tax = { enabled: true };
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return json(200, { id: session.id, url: session.url });
  } catch (err) {
    // Common cause: automatic_tax on but Stripe Tax not activated yet.
    const message = err && err.message ? err.message : "Checkout failed.";
    return json(400, { error: message });
  }
};

function getOrigin(event) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const proto = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host;
  return `${proto}://${host}`;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
