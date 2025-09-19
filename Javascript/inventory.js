
const LOW_STOCK_LIMIT = 5;

function addWood() {
    const name = document.getElementById('woodName').value;
    const qty = parseInt(document.getElementById('woodQty').value);

    if (name && qty >= 0) {
        let table = document.getElementById('woodTable');
        let row = table.insertRow();
        row.insertCell(0).innerHTML = name;
        row.insertCell(1).innerHTML = qty;
        let statusCell = row.insertCell(2);

        if (qty <= LOW_STOCK_LIMIT) {
            statusCell.innerHTML = "⚠️ Low Stock";
            statusCell.classList.add("low-stock");
            alert(`${name} is running low! Only ${qty} left.`);
        } else {
            statusCell.innerHTML = "✅ OK";
        }
    }
}

function addFurniture() {
    const name = document.getElementById('furnitureName').value;
    const qty = parseInt(document.getElementById('furnitureQty').value);

    if (name && qty >= 0) {
        let table = document.getElementById('furnitureTable');
        let row = table.insertRow();
        row.insertCell(0).innerHTML = name;
        row.insertCell(1).innerHTML = qty;
        let statusCell = row.insertCell(2);

        if (qty <= LOW_STOCK_LIMIT) {
            statusCell.innerHTML = "⚠️ Low Stock";
            statusCell.classList.add("low-stock");
            alert(`${name} is running low! Only ${qty} left.`);
        } else {
            statusCell.innerHTML = "✅ OK";
        }
    }
}

