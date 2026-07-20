/* =====================================================================
   The Copper Swan — storefront logic
   - fetches the catalog from /api/products
   - renders the product grid + category filters
   - manages a localStorage cart + slide-out drawer
   - starts Stripe Checkout via /api/create-checkout-session
   ===================================================================== */
(function () {
  "use strict";

  const CART_KEY = "copperswan_cart_v1";
  const state = { products: [], currency: "usd", filter: "All" };

  const $ = (sel, root = document) => root.querySelector(sel);
  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (state.currency || "usd").toUpperCase(),
    }).format(n);

  /* ---------------- Cart storage ---------------- */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }
  function cartCount(cart = loadCart()) {
    return Object.values(cart).reduce((s, q) => s + q, 0);
  }

  function addToCart(id) {
    const cart = loadCart();
    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
    const p = state.products.find((x) => x.id === id);
    toast(`Added ${p ? p.name : "item"} to cart`);
  }
  function setQty(id, qty) {
    const cart = loadCart();
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(99, qty);
    saveCart(cart);
    renderDrawer();
  }

  /* ---------------- Catalog rendering ---------------- */
  async function loadCatalog() {
    const grid = $("#product-grid");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      state.products = data.products || [];
      state.currency = data.currency || "usd";
      renderFilters();
      renderProducts();
    } catch (err) {
      grid.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">' +
        "Our shelves are being stocked — please refresh in a moment. " +
        "(If you are the site owner, deploy to Netlify so the product function is live.)</p>";
      console.error(err);
    }
  }

  function categories() {
    const set = new Set(state.products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }

  function renderFilters() {
    const el = $("#filters");
    el.innerHTML = "";
    categories().forEach((cat) => {
      const b = document.createElement("button");
      b.className = "chip" + (cat === state.filter ? " active" : "");
      b.textContent = cat;
      b.addEventListener("click", () => {
        state.filter = cat;
        renderFilters();
        renderProducts();
      });
      el.appendChild(b);
    });
  }

  function renderProducts() {
    const grid = $("#product-grid");
    const list =
      state.filter === "All"
        ? state.products
        : state.products.filter((p) => p.category === state.filter);
    grid.innerHTML = "";
    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-media"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
        <div class="card-body">
          <span class="card-cat">${escapeHtml(p.category)}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="add-btn" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-add]").forEach((btn) =>
      btn.addEventListener("click", () => addToCart(btn.getAttribute("data-add")))
    );
  }

  /* ---------------- Drawer ---------------- */
  function openDrawer() {
    $("#drawer").classList.add("open");
    $("#overlay").classList.add("open");
    renderDrawer();
  }
  function closeDrawer() {
    $("#drawer").classList.remove("open");
    $("#overlay").classList.remove("open");
  }

  function renderDrawer() {
    const body = $("#drawer-body");
    const foot = $("#drawer-foot");
    const cart = loadCart();
    const ids = Object.keys(cart);

    if (ids.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>
            <path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L22 7H6"/>
          </svg>
          <p>Your cart is empty.</p>
        </div>`;
      foot.style.display = "none";
      return;
    }
    foot.style.display = "block";

    let subtotal = 0;
    body.innerHTML = "";
    ids.forEach((id) => {
      const p = state.products.find((x) => x.id === id);
      if (!p) return;
      const qty = cart[id];
      subtotal += p.price * qty;
      const line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML = `
        <div class="thumb"><img src="${p.image}" alt="${escapeHtml(p.name)}"></div>
        <div class="info">
          <div class="nm">${escapeHtml(p.name)}</div>
          <div class="pr">${money(p.price)}</div>
          <div class="qty">
            <button data-dec="${id}" aria-label="Decrease">−</button>
            <span>${qty}</span>
            <button data-inc="${id}" aria-label="Increase">+</button>
          </div>
          <button class="remove" data-rm="${id}">Remove</button>
        </div>
        <div class="pr" style="font-weight:700">${money(p.price * qty)}</div>`;
      body.appendChild(line);
    });

    foot.querySelector("[data-subtotal]").textContent = money(subtotal);

    body.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => setQty(b.dataset.inc, cart[b.dataset.inc] + 1))
    );
    body.querySelectorAll("[data-dec]").forEach((b) =>
      b.addEventListener("click", () => setQty(b.dataset.dec, cart[b.dataset.dec] - 1))
    );
    body.querySelectorAll("[data-rm]").forEach((b) =>
      b.addEventListener("click", () => setQty(b.dataset.rm, 0))
    );
  }

  function updateCartUI() {
    const c = cartCount();
    const badge = $("#cart-count");
    badge.textContent = c;
    badge.style.display = c > 0 ? "inline-flex" : "none";
  }

  /* ---------------- Checkout ---------------- */
  async function checkout() {
    const cart = loadCart();
    const items = Object.entries(cart).map(([id, quantity]) => ({ id, quantity }));
    if (items.length === 0) return;

    const btn = $("#checkout-btn");
    const errEl = $("#checkout-error");
    errEl.style.display = "none";
    btn.disabled = true;
    btn.textContent = "Redirecting to secure checkout…";

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url; // -> Stripe Checkout
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = "block";
      btn.disabled = false;
      btn.textContent = "Proceed to Checkout";
    }
  }

  /* ---------------- Helpers ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.querySelector(".msg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    loadCatalog();
    $("#cart-open").addEventListener("click", openDrawer);
    $("#drawer-close").addEventListener("click", closeDrawer);
    $("#overlay").addEventListener("click", closeDrawer);
    $("#checkout-btn").addEventListener("click", checkout);
  });
})();
