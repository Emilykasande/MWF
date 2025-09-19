
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Populate product dropdown from stock
const productSelect = document.getElementById("product");
const stock = getData("stock");
stock.forEach((p) => {
    productSelect.innerHTML += `<option value="${p.productName}" data-price="${p.salePrice}" data-stock="${p.quantity}">
      ${p.productName} (${p.quantity} available)
    </option>`;
});

// Update receipt live
const customerInput = document.getElementById("customer");
const productInput = document.getElementById("product");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const transportSelect = document.getElementById("transport");
const agentInput = document.getElementById("agent");
const paymentSelect = document.getElementById("payment");

const receiptBox = document.getElementById("receiptDetails");

function updateReceipt() {
  const customer = customerInput.value;
  const product = productInput.value;
  const quantity = Number(quantityInput.value) || 0;
  const price = Number(priceInput.value) || 0;
  const transport = transportSelect.value;
  const agent = agentInput.value;
  const payment = paymentSelect.value;

  let total = quantity * price;
  let transportFee = 0;
  if (transport === "yes") {
    transportFee = total * 0.05;
    total += transportFee;
  }

  receiptBox.innerHTML = `
    <p>Customer: ${customer}</p>
    <p>Product: ${product}</p>
    <p>Quantity: ${quantity}</p>
    <p>Unit Price: $${price.toFixed(2)}</p>
    <p>Transport Fee: $${transportFee.toFixed(2)}</p>
    <p>Total Price: $${total.toFixed(2)}</p>
    <p>Sales Agent: ${agent}</p>
    <p>Payment Method: ${payment}</p>
  `;
}

// Update receipt on input change
[
  customerInput,
  productInput,
  quantityInput,
  priceInput,
  transportSelect,
  agentInput,
  paymentSelect,
].forEach((el) => {
  el.addEventListener("input", updateReceipt);
  el.addEventListener("change", updateReceipt);
});

// Initialize receipt
updateReceipt();


// Submit sale
document.getElementById("salesForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const customer = document.getElementById("customer").value;
    const productName = productSelect.value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const transport = document.getElementById("transport").value === "yes";
    const agent = document.getElementById("agent").value;
    const payment = document.getElementById("payment").value;

    const stockData = getData("stock");
    const item = stockData.find((s) => s.productName === productName);
    if (!item || item.quantity < quantity) {
        alert("Not enough stock!");
        return;
    }

    item.quantity -= quantity;
    localStorage.setItem("stock", JSON.stringify(stockData));

    let total = item.salePrice * quantity;
    if (transport) total *= 1.05;

    const sales = getData("sales");
    const sale = {
      customer,
      productName,
      quantity,
      total,
      transport,
      agent,
      payment,
      date: new Date().toISOString(),
    };
    sales.push(sale);
    localStorage.setItem("sales", JSON.stringify(sales));

    renderSalesTable();
    alert("Sale recorded successfully!");
    document.getElementById("salesForm").reset();
    updateLiveReceipt(); // reset receipt preview
});

function renderSalesTable() {
    const sales = getData("sales");
    const tbody = document.querySelector("#salesTable tbody");
    tbody.innerHTML = "";
    sales.forEach((s) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${s.customer}</td>
        <td>${s.productName}</td>
        <td>${s.quantity}</td>
        <td>${s.total.toFixed(2)}</td>
        <td>${s.transport ? "Yes" : "No"}</td>
        <td>${s.agent}</td>
        <td>${s.payment}</td>
        <td>${new Date(s.date).toLocaleString()}</td>
      `;
        tbody.appendChild(row);
    });
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
    renderSalesTable();
    updateLiveReceipt();
});

