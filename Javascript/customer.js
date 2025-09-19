
//    data
const customers = [
    { id: 1, name: "John Doe", phone: "123456789", email: "john@example.com", purchases: [], comms: [] },
    { id: 2, name: "Jane Smith", phone: "987654321", email: "jane@example.com", purchases: [], comms: [] }
];

const customerList = document.getElementById("customerList");
const profileDetails = document.getElementById("profileDetails");
const searchBox = document.getElementById("searchBox");

function renderCustomers(filter = "") {
    customerList.innerHTML = "";
    customers
        .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(c => {
            const li = document.createElement("li");
            li.textContent = c.name + " (" + c.phone + ")";
            li.onclick = () => showProfile(c.id);
            customerList.appendChild(li);
        });
}

function showProfile(id) {
    const c = customers.find(c => c.id === id);
    profileDetails.innerHTML = `
            <h3>${c.name}</h3>
            <p>📞 ${c.phone}<br>📧 ${c.email}</p>
    
            <div class="section">
              <h4>Purchases</h4>
              ${c.purchases.length ? c.purchases.map(p => `<div class="card">${p.product} - $${p.price}</div>`).join("") : "<p>No purchases yet</p>"}
              <button onclick="addPurchase(${c.id})">+ Add Purchase</button>
            </div>
    
            <div class="section">
              <h4>Communication Logs</h4>
              ${c.comms.length ? c.comms.map(m => `<div class="card">${m.type}: ${m.note}</div>`).join("") : "<p>No communications yet</p>"}
              <button onclick="addComm(${c.id})">+ Add Communication</button>
            </div>
          `;
}

function addPurchase(id) {
    const product = prompt("Enter product name:");
    const price = prompt("Enter price:");
    if (product && price) {
        const c = customers.find(c => c.id === id);
        c.purchases.push({ product, price });
        showProfile(id);
    }
}

function addComm(id) {
    const type = prompt("Enter communication type (Call, Email, SMS):");
    const note = prompt("Enter communication note:");
    if (type && note) {
        const c = customers.find(c => c.id === id);
        c.comms.push({ type, note });
        showProfile(id);
    }
}

// Event: search
searchBox.addEventListener("input", e => renderCustomers(e.target.value));

// Initial render
renderCustomers();
