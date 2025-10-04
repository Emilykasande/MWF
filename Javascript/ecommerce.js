// Placeholder image in case src fails
const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#e8e9ee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#777">No Image</text></svg>'
  );

// ------------------------ Search Products ------------------------
function searchProducts() {
  const searchInput = document.getElementById("search-products");
  const productGrid = document.getElementById("productGrid");
  const cards = productGrid ? productGrid.querySelectorAll(".card") : [];

  if (!searchInput || !productGrid) return;

  const searchTerm = searchInput.value.toLowerCase().trim();

  let visibleCount = 0;

  cards.forEach((card) => {
    const productName = card.querySelector(".title")?.textContent.toLowerCase() || "";

    if (searchTerm === "" || productName.includes(searchTerm)) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Show/hide "no products" message
  const noProductsMsg = productGrid.querySelector(".no-products");
  if (noProductsMsg) {
    noProductsMsg.style.display = visibleCount === 0 && searchTerm !== "" ? "block" : "none";
  }

  // Update search results info
  updateSearchInfo(visibleCount, cards.length, searchTerm);
}

function updateSearchInfo(visibleCount, totalCount, searchTerm) {
  let infoElement = document.getElementById("search-info");
  if (!infoElement) {
    infoElement = document.createElement("div");
    infoElement.id = "search-info";
    infoElement.style.cssText =
      "margin: 10px 0; font-style: italic; color: #666; text-align: center;";
    const productGrid = document.getElementById("productGrid");
    if (productGrid) {
      productGrid.parentNode.insertBefore(infoElement, productGrid.nextSibling);
    }
  }

  if (searchTerm) {
    infoElement.textContent = `Showing ${visibleCount} of ${totalCount} products for "${searchTerm}"`;
    infoElement.style.color = visibleCount === 0 ? "#d9534f" : "#666";
  } else {
    infoElement.textContent = "";
  }
}

// Global cart array
let cart = [];

// ------------------------ Render Cart ------------------------
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

  const totalElement = document.getElementById("total");
  if (totalElement) {
    totalElement.textContent = "UGX " + total.toFixed(2);
  }

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

// ------------------------ Add to Cart ------------------------
function addToCart(id, name, price) {
  console.log('addToCart called with:', { id, name, price });

  const existing = cart.find((c) => c.id === id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    console.log('Updated existing item quantity:', existing.quantity);
  } else {
    cart.push({ id, name, price, quantity: 1 });
    console.log('Added new item to cart:', { id, name, price });
  }

  console.log('Current cart:', cart);
  renderCart();
}

// ------------------------ Checkout ------------------------
async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!customerName || !phoneNumber || !address) {
    alert("Please fill all fields before checkout.");
    return;
  }

  const items = cart.map((c) => ({
    productId: c.id,
    name: c.name,
    price: c.price,
    quantity: c.quantity || 1,
  }));

  const total = cart.reduce((sum, c) => sum + c.price * (c.quantity || 1), 0);

  try {
    console.log("Attempting checkout with data:", {
      customerName,
      phoneNumber,
      address,
      items,
      total,
    });

    const res = await fetch("/ecommerce/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phoneNumber,
        address,
        items,
        total,
      }),
    });

    console.log("Checkout response status:", res.status);
    console.log("Checkout response headers:", res.headers);

    const data = await res.json();
    console.log("Checkout response data:", data);

    if (res.ok && data.success) {
      showSuccessModal(data.message || "Order placed successfully!", data.orderId);
      cart = [];
      renderCart();
      document.getElementById("customerName").value = "";
      document.getElementById("phoneNumber").value = "";
      document.getElementById("address").value = "";
    } else {
      alert("Failed to place order: " + (data.message || res.statusText));
    }
  } catch (err) {
    console.error("Checkout error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    alert("Server error while placing order. Check console for details.");
  }
}

// ------------------------ Slideshow ------------------------
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

// ------------------------ Init ------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM Content Loaded - Setting up ecommerce functionality');

  // Function to setup add to cart buttons
  function setupAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart");
    console.log('Found add-to-cart buttons:', buttons.length);

    buttons.forEach((btn, index) => {
      console.log(`Button ${index}:`, {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: btn.dataset.price,
        className: btn.className
      });

      // Add the event listener with proper error handling
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        console.log('Add to cart button clicked');

        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = Number(this.dataset.price) || 0;

        console.log('Product data:', { id, name, price });

        if (!id || !name || price <= 0) {
          console.error('Invalid product data:', { id, name, price });
          alert('Error: Invalid product data');
          return;
        }

        addToCart(id, name, price);
      });
    });
  }

  // Products are rendered **via Pug**, not hardcoded in JS
  setupAddToCartButtons();

  // Also setup buttons after any dynamic content changes
  const observer = new MutationObserver(() => {
    console.log('DOM changed, re-setting up buttons');
    setupAddToCartButtons();
  });

  const productGrid = document.getElementById("productGrid");
  if (productGrid) {
    observer.observe(productGrid, { childList: true, subtree: true });
  }

  // Add search functionality
  const searchInput = document.getElementById("search-products");
  if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
  }

  renderCart();
  initSlideshow();
  document.getElementById("checkoutBtn")?.addEventListener("click", checkout);

  console.log('Ecommerce functionality initialized');
});
