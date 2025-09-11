document.addEventListener('DOMContentLoaded', () => {
    // --- Hardcoded Admin Credentials ---
    // Anyone can see this password by looking at the code.
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "password123"; // <-- CHANGE THIS PASSWORD!

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from actually submitting

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Check if the credentials match
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Login successful!
            // We'll save a "logged in" flag in sessionStorage.
            // sessionStorage is cleared when the tab is closed.
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            
            // Redirect to the dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Login failed
            errorMessage.textContent = 'Invalid username or password.';
        }
    });
});

