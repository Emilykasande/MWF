
// Update dashboard data dynamically
document.addEventListener("DOMContentLoaded", () => {
    const sales = 12540000;
    const expenses = 4200000;
    const profit = sales - expenses;

    document.getElementById("sales").textContent =
        "UGX " + sales.toLocaleString();
    document.getElementById("expenses").textContent =
        "UGX " + expenses.toLocaleString();
    document.getElementById("profit").textContent =
        "UGX " + profit.toLocaleString();
});

// Logout function
function logout() {
    alert("You have been logged out.");
    window.location.href = "login.html"; // change to your login page
}
