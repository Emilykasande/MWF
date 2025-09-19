
const supplierForm = document.getElementById('supplierForm');
const suppliersTable = document.getElementById('suppliersTable').querySelector('tbody');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let supplierCount = 0;
let editRow = null;

supplierForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('supplierName').value;
    const email = document.getElementById('supplierEmail').value;
    const phone = document.getElementById('supplierPhone').value;

    if (editRow) {
        // Update existing row
        editRow.cells[1].innerText = name;
        editRow.cells[2].innerText = email;
        editRow.cells[3].innerText = phone;
        editRow = null;
        formTitle.innerText = 'Add New Supplier';
        submitBtn.innerText = 'Add Supplier';
        cancelEditBtn.style.display = 'none';
    } else {
        // Add new supplier
        supplierCount++;
        const row = suppliersTable.insertRow();
        row.insertCell(0).innerText = supplierCount;
        row.insertCell(1).innerText = name;
        row.insertCell(2).innerText = email;
        row.insertCell(3).innerText = phone;

        const actionsCell = row.insertCell(4);
        const editBtn = document.createElement('button');
        editBtn.innerText = 'Edit';
        editBtn.className = 'action-btn edit-btn';
        editBtn.addEventListener('click', () => editSupplier(row));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.addEventListener('click', () => deleteSupplier(row));

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    }

    supplierForm.reset();
});

function editSupplier(row) {
    document.getElementById('supplierName').value = row.cells[1].innerText;
    document.getElementById('supplierEmail').value = row.cells[2].innerText;
    document.getElementById('supplierPhone').value = row.cells[3].innerText;
    formTitle.innerText = 'Edit Supplier';
    submitBtn.innerText = 'Update Supplier';
    cancelEditBtn.style.display = 'inline';
    editRow = row;
}

function deleteSupplier(row) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        suppliersTable.deleteRow(row.rowIndex - 1);
        supplierCount--;
        // Re-number the rows
        Array.from(suppliersTable.rows).forEach((r, i) => {
            r.cells[0].innerText = i + 1;
        });
    }
}

cancelEditBtn.addEventListener('click', () => {
    supplierForm.reset();
    formTitle.innerText = 'Add New Supplier';
    submitBtn.innerText = 'Add Supplier';
    cancelEditBtn.style.display = 'none';
    editRow = null;
});

