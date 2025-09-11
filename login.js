document.addEventListener('DOMContentLoaded', () => {
    // Hardcoded Admin Credentials
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "password123";

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Add input animations
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Clear previous error
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';

        // Add loading state
        loginBtn.innerHTML = '<span class="spinner"></span>Authenticating...';
        loginBtn.disabled = true;

        // Simulate authentication delay
        setTimeout(() => {
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Login successful
                loginBtn.innerHTML = '✅ Login Successful!';
                loginBtn.className = 'success-state';
                loginBtn.style.background = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
                loginBtn.style.color = '#065f46';

                // Save login state
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                
                // Redirect after animation
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } else {
                // Login failed
                loginBtn.innerHTML = '🚀 Access Dashboard';
                loginBtn.disabled = false;
                
                errorMessage.textContent = '❌ Invalid username or password. Please try again.';
                errorMessage.classList.add('show');
                
                // Add shake animation to form
                document.querySelector('.login-container').style.animation = 'shake 0.6s ease-in-out';
                
                // Reset animation
                setTimeout(() => {
                    document.querySelector('.login-container').style.animation = '';
                }, 600);
                
                // Clear password field
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 1500); // Simulate network delay
    });

    // Add enter key support
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // Auto-focus username field
    setTimeout(() => {
        usernameInput.focus();
    }, 500);

    // Add password visibility toggle on double-click
    passwordInput.addEventListener('dblclick', function() {
        const type = this.type === 'password' ? 'text' : 'password';
        this.type = type;
        
        setTimeout(() => {
            this.type = 'password';
        }, 2000);
    });
});

// Add demo credentials hint
setTimeout(() => {
    const demoHint = document.createElement('div');
    demoHint.innerHTML = `
        <div style="
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(103, 126, 234, 0.3);
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            font-size: 0.85rem;
            color: #64748b;
            animation: slideInUp 0.6s ease-out;
            max-width: 200px;
        ">
            <div style="font-weight: 600; color: #667eea; margin-bottom: 8px;">Demo Credentials:</div>
            <div><strong>Username:</strong> admin</div>
            <div><strong>Password:</strong> password123</div>
        </div>
    `;
    document.body.appendChild(demoHint);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        demoHint.style.opacity = '0';
        demoHint.style.transform = 'translateY(20px)';
        setTimeout(() => demoHint.remove(), 300);
    }, 10000);
}, 2000);