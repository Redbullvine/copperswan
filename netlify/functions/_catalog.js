// =====================================================================
// The Copper Swan — product catalog (SERVER-SIDE SOURCE OF TRUTH)
// ---------------------------------------------------------------------
// This is the ONLY place prices live. The storefront fetches this list
// to render the shop, and the checkout function re-reads it to build the
// Stripe line items, so a shopper can never edit a price in their browser
// and pay less.
//
// HOW TO EDIT YOUR STORE:
//   • Add / remove objects in the `products` array below.
//   • `price` is in DOLLARS (e.g. 24.99). It is converted to cents for you.
//   • `id` must be unique and stable (used by carts & receipts).
//   • `image` can be any public image URL, or a local path in /assets/img.
//   • `taxCode` is an optional Stripe Tax product tax code. The default
//     "txcd_99999999" = "General - Tangible Goods". Full list:
//     https://stripe.com/docs/tax/tax-categories
// =====================================================================

const products = [
  {
    id: "cs-swan-tumbler",
    name: "Copper Swan Insulated Tumbler",
    category: "Home & Kitchen",
    price: 28.0,
    description:
      "20 oz double-wall vacuum-insulated stainless tumbler with a hand-brushed copper finish. Keeps drinks cold 24 hrs, hot 12.",
    image: "/assets/img/product-tumbler.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-wireless-earbuds",
    name: "Signature Wireless Earbuds",
    category: "Electronics",
    price: 49.99,
    description:
      "True-wireless Bluetooth 5.3 earbuds with active noise cancellation, 32-hr charging case, and IPX5 sweat resistance.",
    image: "/assets/img/product-earbuds.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-power-bank",
    name: "10,000 mAh Copper-Line Power Bank",
    category: "Electronics",
    price: 32.5,
    description:
      "Slim USB-C PD 20W portable charger. Fast-charges phones twice over. LED capacity meter and pass-through charging.",
    image: "/assets/img/product-powerbank.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-canvas-tote",
    name: "Heavyweight Canvas Market Tote",
    category: "Bags & Apparel",
    price: 22.0,
    description:
      "16 oz natural cotton canvas tote with reinforced copper-rivet handles and an interior zip pocket. Holds 40 lbs.",
    image: "/assets/img/product-tote.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-led-desk-lamp",
    name: "Aurora LED Desk Lamp",
    category: "Home & Kitchen",
    price: 44.0,
    description:
      "Dimmable 3-tone LED lamp with a matte-black arm, copper accent ring, USB charging port, and touch controls.",
    image: "/assets/img/product-lamp.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-multitool",
    name: "15-in-1 Pocket Multi-Tool",
    category: "Outdoor & Tools",
    price: 26.99,
    description:
      "Full-tang stainless multi-tool: pliers, blades, drivers, and bottle opener. Nylon sheath and copper-tone handle inlay.",
    image: "/assets/img/product-multitool.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-scented-candle",
    name: "Copper Swan Soy Candle — Amber & Oud",
    category: "Home & Kitchen",
    price: 18.5,
    description:
      "12 oz hand-poured soy candle in a reusable copper-glazed vessel. 60-hr burn. Notes of amber, oud, and warm cedar.",
    image: "/assets/img/product-candle.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
  {
    id: "cs-phone-stand",
    name: "Adjustable Aluminum Phone & Tablet Stand",
    category: "Electronics",
    price: 19.99,
    description:
      "Foldable desktop stand milled from aluminum with a copper anodized finish. Fits every phone and tablet up to 12.9\".",
    image: "/assets/img/product-stand.svg",
    taxCode: "txcd_99999999",
    active: true,
  },
];

// Convenience helpers used by the functions.
function activeProducts() {
  return products.filter((p) => p.active !== false);
}

function findById(id) {
  return products.find((p) => p.id === id && p.active !== false);
}

module.exports = { products, activeProducts, findById };
