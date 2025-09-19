
const API = "http://localhost:3000";

// Create Quote -> Approve -> Convert to Order
document.getElementById("quoteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const customer = {
        name: document.getElementById("customerName").value,
        email: document.getElementById("customerEmail").value
    };
    const items = [{
        sku: document.getElementById("productSku").value,
        qty: parseInt(document.getElementById("productQty").value)
    }];

    try {
        // 1) Create quote
        let res = await fetch(API + "/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer, items, taxRate: 0.18, status: "SENT" })
        });
        let quote = await res.json();
        if (quote.error) throw new Error(quote.error);

        // 2) Approve
        await fetch(API + `/quotes/${quote._id}/approve`, { method: "POST" });

        // 3) Convert -> order
        res = await fetch(API + `/quotes/${quote._id}/convert`, { method: "POST" });
        let order = await res.json();
        if (order.error) throw new Error(order.error);

        document.getElementById("quoteMsg").innerText = "✅ Order created successfully!";
        loadOrders();
    } catch (err) {
        document.getElementById("quoteMsg").innerText = "❌ " + err.message;
    }
});

// Load Orders
async function loadOrders() {
    const table = document.getElementById("ordersTable");
    table.innerHTML = "<tr><th>ID</th><th>Customer</th><th>Status</th><th>Actions</th></tr>";
    const res = await fetch(API + "/orders");
    const orders = await res.json();
    orders.forEach(o => {
        const row = table.insertRow();
        row.insertCell(0).innerText = o._id;
        row.insertCell(1).innerText = o.customer.name;
        row.insertCell(2).innerText = o.status;
        const actions = row.insertCell(3);
        if (o.status === "CREATED") {
            actions.innerHTML = `<button onclick="startProd('${o._id}')">Start Production</button>`;
        } else if (o.status === "IN_PRODUCTION") {
            actions.innerHTML = `<button onclick="completeProd('${o._id}')">Complete Production</button>`;
        } else if (o.status === "READY") {
            actions.innerHTML = `<button onclick="dispatch('${o._id}')">Dispatch</button>`;
        } else if (o.status === "OUT_FOR_DELIVERY") {
            actions.innerHTML = `<button onclick="deliver('${o._id}')">Mark Delivered</button>`;
        } else {
            actions.innerHTML = "-";
        }
    });
}

async function startProd(id) {
    await fetch(API + "/orders/" + id + "/start-production", { method: "POST" });
    loadOrders();
}
async function completeProd(id) {
    await fetch(API + "/orders/" + id + "/complete-production", { method: "POST" });
    loadOrders();
}
async function dispatch(id) {
    await fetch(API + "/orders/" + id + "/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier: "DHL", trackingNo: "TRACK123" })
    });
    loadOrders();
}
async function deliver(id) {
    await fetch(API + "/orders/" + id + "/deliver", { method: "POST" });
    loadOrders();
}

// Alerts
async function loadAlerts() {
    const res = await fetch(API + "/alerts/low-stock");
    const data = await res.json();
    const alertsDiv = document.getElementById("alerts");
    alertsDiv.innerHTML = "";
    if (data.wood.length === 0 && data.products.length === 0) {
        alertsDiv.innerText = "✅ No low stock issues.";
        return;
    }
    if (data.wood.length) {
        alertsDiv.innerHTML += "<p class='alert'>Wood Low: " + data.wood.map(w => `${w.type} (${w.qty})`).join(", ") + "</p>";
    }
    if (data.products.length) {
        alertsDiv.innerHTML += "<p class='alert'>Products Low: " + data.products.map(p => `${p.name} (${p.stockQty})`).join(", ") + "</p>";
    }
}

// Load orders on page load
loadOrders();

