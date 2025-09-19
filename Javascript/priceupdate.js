
// Populate product dropdown and table
function renderProducts() {
    const products = getData('stock');
    const select = document.getElementById('productSelect');
    select.innerHTML = '';
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    products.forEach(p => {
        select.innerHTML += `<option value="${p.productName}">${p.productName}</option>`;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${p.productName}</td><td>${p.productType}</td><td>${p.salePrice.toFixed(2)}</td>`;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', renderProducts);

// Update price
document.getElementById('priceForm').addEventListener('submit', e => {
    e.preventDefault();
    const productName = document.getElementById('productSelect').value;
    const newPrice = parseFloat(document.getElementById('newPrice').value);

    const products = getData('stock');
    const product = products.find(p => p.productName === productName);
    if (product) {
        product.salePrice = newPrice;
        localStorage.setItem('stock', JSON.stringify(products));
        alert(`Price of ${productName} updated to ${newPrice.toFixed(2)}`);
        renderProducts();
        document.getElementById('priceForm').reset();
    }
});
