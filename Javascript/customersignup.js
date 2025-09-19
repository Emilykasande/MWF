
// Toggle password visibility
function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Client-side validation: password match
const form = document.getElementById('customerForm');
form.addEventListener('submit', function (e) {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) {
        e.preventDefault();
        alert('Passwords do not match!');
    }
});
form.addEventListener('submit', function (e) {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) {
        e.preventDefault();
        alert('Passwords do not match!');
    } else {
        e.preventDefault(); // stop default form submission
        window.location.href = "ecommerce.html"; // redirect to link
    }
});

