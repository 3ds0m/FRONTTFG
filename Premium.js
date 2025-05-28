// premium.js - Funcionalidades de autenticación y favoritos

const API_BASE = "https://tfg-zbc8.onrender.com/api";

class PremiumManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        if (window.location.pathname.includes('Login.html')) {
            this.initLoginPage();
        } else {
            this.checkSession();
        }
    }

    initLoginPage() {
        window.onload = () => {
            const token = localStorage.getItem('sessionToken');
            if (token) {
                this.validateSession(token);
            }
        };

        this.setupLoginEventListeners();
        this.setupForgotPasswordLinks();
    }

    setupLoginEventListeners() {
        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.onclick = (e) => {
                e.preventDefault();
                this.showRegisterForm();
            };
        }

        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.onclick = (e) => {
                e.preventDefault();
                this.showLoginForm();
            };
        }

        const loginBtn = document.getElementById('btn-login');
        if (loginBtn) {
            loginBtn.onclick = () => this.login();
        }

        const registerBtn = document.getElementById('btn-register');
        if (registerBtn) {
            registerBtn.onclick = () => this.register();
        }

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const loginForm = document.getElementById('login-form');
                const registerForm = document.getElementById('register-form');

                if (loginForm && loginForm.style.display !== 'none') {
                    this.login();
                } else if (registerForm && registerForm.style.display !== 'none') {
                    this.register();
                }
            }
        });
    }

    async register() {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        if (!username || !email || !password) {
            this.showAlert('Por favor, completa todos los campos', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const message = await response.text();
            this.showAlert(message, 'success');

            // Limpiar campos y mostrar login
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            this.showLoginForm();

        } catch (error) {
            this.showAlert(`Error: ${error.message}`, 'danger');
        }
    }

    async login() {
        const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
        const password = document.getElementById('password').value;

        if (!usernameOrEmail || !password) {
            this.showAlert('Por favor, completa todos los campos', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({usernameOrEmail, password})
            });

            if (!response.ok) {
                throw new Error('Login fallido');
            }

            const data = await response.json();
            localStorage.setItem('sessionToken', data.token);
            this.validateSession(data.token);

        } catch (error) {
            this.showAlert('Usuario o contraseña incorrectos', 'danger');
        }
    }

    async sendForgotPassword() {
        const email = document.getElementById('forgot-email').value.trim();

        if (!email) {
            this.showAlert('Por favor ingresa tu correo electrónico', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const message = await response.text();
            this.showAlert(message, 'success');

            // Volver al login después de enviar correo
            this.showLoginForm();

        } catch (error) {
            this.showAlert(`Error: ${error.message}`, 'danger');
        }
    }
        setupForgotPasswordLinks() {
        const showForgotLink = document.getElementById('show-forgot-password');
        const forgotFormLink = document.getElementById('show-login-from-forgot');

        if (showForgotLink) {
            showForgotLink.onclick = (e) => {
                e.preventDefault();
                this.showForgotPasswordForm();
            };
        }

        if (forgotFormLink) {
            forgotFormLink.onclick = (e) => {
                e.preventDefault();
                this.showLoginForm();
            };
        }

        const forgotBtn = document.getElementById('btn-forgot-password');
        if (forgotBtn) {
            forgotBtn.onclick = () => this.sendForgotPassword();
        }
    }

    showRegisterForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('forgot-password-form').style.display = 'none';
    }

    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('forgot-password-form').style.display = 'none';
    }

    showForgotPasswordForm() {
        document.getElementById('forgot-password-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
    }

    async logout() {
        const token = localStorage.getItem('sessionToken');
        if (!token) return;

        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token})
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('sessionToken');
            this.currentUser = null;

            if (window.location.pathname.includes('Login.html')) {
                this.showLoginForm();
            } else {
                window.location.reload();
            }
        }
    }

    async validateSession(token) {
        try {
            const response = await fetch(`${API_BASE}/auth/validate?token=${token}`);

            if (!response.ok) {
                throw new Error('Sesión inválida');
            }

            const user = await response.json();
            this.currentUser = user;

            if (window.location.pathname.includes('Login.html')) {
                this.showSuccessMessage(user);
            }

        } catch (error) {
            localStorage.removeItem('sessionToken');
            this.currentUser = null;
            if (window.location.pathname.includes('Login.html')) {
                this.showLoginForm();
            }
        }
    }

    showSuccessMessage(user) {
        const authContainer = document.getElementById('auth-container');
        const successContainer = document.getElementById('success-container');

        if (authContainer) authContainer.style.display = 'none';
        if (successContainer) {
            successContainer.style.display = 'block';

            successContainer.classList.add('success-message'); // agrega clase para estilos

            const welcomeText = successContainer.querySelector('h2');
            if (welcomeText) {
                welcomeText.innerHTML = `<i class="fas fa-check-circle"></i> ¡Bienvenido, ${user.username}!`;
            }

            // Crear botón con la clase btn que ya tienes definida
            let button = document.createElement('button');
            button.textContent = 'Ir a ver más restaurantes';
            button.className = 'btn';  // usa la clase btn para que tome estilos

            button.onclick = () => {
                window.location.href = 'Cocinas.html';
            };

            successContainer.appendChild(button);
        }
    }



    checkSession() {
        const token = localStorage.getItem('sessionToken');
        if (token) {
            this.validateSessionQuiet(token);
        }
    }

    async validateSessionQuiet(token) {
        try {
            const response = await fetch(`${API_BASE}/auth/validate?token=${token}`);
            if (response.ok) {
                this.currentUser = await response.json();
            } else {
                localStorage.removeItem('sessionToken');
                this.currentUser = null;
            }
        } catch (error) {
            localStorage.removeItem('sessionToken');
            this.currentUser = null;
        } finally {
            document.dispatchEvent(new CustomEvent('userReady'));
        }
    }

    async addFavoriteFromPage(locationId, restaurantName) {
        if (!this.currentUser) {
            if (confirm('Debes iniciar sesión para agregar favoritos. ¿Quieres ir a la página de login?')) {
                window.location.href = 'Login.html';
            }
            return false;
        }

        try {
            const token = localStorage.getItem('sessionToken');
            const response = await fetch(`${API_BASE}/user/favorites/add/${locationId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al agregar favorito');
            }

            this.showAlert(`${restaurantName} agregado a favoritos`, 'success');
            return true;

        } catch (error) {
            this.showAlert('El Restaurante ya está en la lista de favoritos', 'danger');
            return false;
        }
    }

    async removeFavoriteFromPage(locationId, restaurantName) {
        if (!this.currentUser) return false;

        try {
            const token = localStorage.getItem('sessionToken');
            const response = await fetch(`${API_BASE}/user/favorites/remove/${locationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar favorito');
            }

            this.showAlert(`${restaurantName} eliminado de favoritos`, 'success');
            return true;

        } catch (error) {
            this.showAlert('No se pudo eliminar favorito', 'danger');
            return false;
        }
    }

    showAlert(message, type) {
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    get isLoggedIn() {
        return this.currentUser !== null;
    }

    get user() {
        return this.currentUser;
    }
}

const premiumManager = new PremiumManager();
window.premiumManager = premiumManager;
document.dispatchEvent(new CustomEvent('userReady'));
