// --- Placeholder image (in case src fails) ---
const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#e8e9ee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#777">No Image</text></svg>'
  );

// --- Products (hardcoded) ---
const products = [
  { id: "66e7c72c6e4e871c445b94c9", name: "Chair", price: 50000, img: "/Images/chair.jpeg" },
  { id: "2", name: "Office", price: 70000, img: "/Images/office.jpeg" },
  { id: "3", name: "Table", price: 150000, img: "/Images/table.jpeg" },
  { id: "4", name: "Cabinet", price: 200000, img: "/Images/kitchen.jpeg" },
  { id: "5", name: "Mirror", price: 200000, img: "/Images/mirror.jpeg" },
  { id: "6", name: "Bed", price: 500000, img: "/Images/bed.jpeg" },
];

let cart = [];

// --- Render products into the grid ---
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="img-wrap">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='${placeholder}'" />
      </div>
      <div class="meta">
        <h4 class="title">${p.name}</h4>
        <div class="price">UGX ${p.price}</div>
      </div>
      <div class="actions">
        <button class="add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // attach events for add-to-cart
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price) || 0;
      addToCart(id, name, price);
    });
  });
}

// --- Cart functions ---
function addToCart(id, name, price) {
  cart.push({ id, name, price, quantity: 1 });
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cartList");
  if (!list) return;
  list.innerHTML = "";

  let total = 0;
  cart.forEach((c, idx) => {
    total += c.price * (c.quantity || 1);
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${c.name} — UGX ${c.price}</span>
      <button type="button" data-idx="${idx}" class="remove-item" style="margin-left:8px">Remove</button>
    `;
    list.appendChild(li);
  });

  document.getElementById("total").textContent = "UGX " + total.toFixed(2);

  // attach remove handlers
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      if (!Number.isNaN(idx)) {
        cart.splice(idx, 1);
        renderCart();
      }
    });
  });
}

// --- Checkout ---
async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const customerNameEl = document.getElementById("customerName");
  const customerName = customerNameEl ? customerNameEl.value.trim() : "";

  if (!customerName) {
    alert("Please enter your name before checkout.");
    customerNameEl?.focus();
    return;
  }

  const orderData = {
    customerName,
    items: cart.map((c) => ({
      productId: c.id, // here it's just string "1", "2" etc
      quantity: c.quantity || 1,
    })),
    total: cart.reduce((sum, c) => sum + c.price * (c.quantity || 1), 0),
  };

  try {
    console.debug("Posting order:", orderData);

    const res = await fetch("/ecommerce/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert("Order placed successfully!");
      cart = [];
      renderCart();
    } else {
      alert("Failed to place order: " + (data.message || res.statusText));
      console.error("Server response:", data);
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Server error while placing order");
  }
}

// --- Slideshow ---
function initSlideshow() {
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;
  let idx = 0;
  const show = (i) =>
    slides.forEach((s, j) => s.classList.toggle("active", j === i));
  document.getElementById("prevBtn")?.addEventListener("click", () => {
    idx = (idx - 1 + slides.length) % slides.length;
    show(idx);
  });
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    idx = (idx + 1) % slides.length;
    show(idx);
  });
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    show(idx);
  }, 3500);
}

// --- Init on load ---
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  initSlideshow();
  document.getElementById("checkoutBtn")?.addEventListener("click", checkout);
});
