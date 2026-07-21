// Returns the public product catalog to the storefront (no prices trusted
// from the client — this is the authoritative list). GET /api/products
const { activeProducts } = require("./_catalog");

exports.handler = async () => {
  const currency = (process.env.CURRENCY || "usd").toLowerCase();
  const catalog = activeProducts().map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    description: p.description,
    image: p.image,
  }));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
    body: JSON.stringify({ currency, products: catalog }),
  };
};
