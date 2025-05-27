// premium.js - Funcionalidades de autenticación y favoritos

const API_BASE = "https://tfg-zbc8.onrender.com/api";

// Clase para manejar la autenticación y favoritos
class PremiumManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar si estamos en la página de login
        if (window.location.pathname.includes('Login.html')) {
            this.initLoginPage();
        } else {
            // Verificar sesión en otras páginas
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

        // Event listeners para login
        this.setupLoginEventListeners();
    }

    setupLoginEventListeners() {
        // Mostrar formulario de registro
        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.onclick = (e) => {
                e.preventDefault();
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('register-form').style.display = 'block';
            };
        }

        // Mostrar formulario de login
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.onclick = (e) => {
                e.preventDefault();
                document.getElementById('register-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
            };
        }

        // Registro
        const registerBtn = document.getElementById('btn-register');
        if (registerBtn) {
            registerBtn.onclick = () => this.register();
        }

        // Login
        const loginBtn = document.getElementById('btn-login');
        if (loginBtn) {
            loginBtn.onclick = () => this.login();
        }

        // Enter key support
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
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            
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
            
            // Si estamos en login.html, mostrar formularios
            if (window.location.pathname.includes('Login.html')) {
                this.showLogin();
            } else {
                // Si estamos en otra página, recargar para actualizar el menú
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
            
            // Si estamos en login.html, mostrar mensaje de éxito
            if (window.location.pathname.includes('Login.html')) {
                this.showSuccessMessage(user);
            }
            
        } catch (error) {
            localStorage.removeItem('sessionToken');
            this.currentUser = null;
            if (window.location.pathname.includes('Login.html')) {
                this.showLogin();
            }
        }
    }

    showLogin() {
        const authContainer = document.getElementById('auth-container');
        const successContainer = document.getElementById('success-container');
        
        if (authContainer) authContainer.style.display = 'block';
        if (successContainer) successContainer.style.display = 'none';
    }

    showSuccessMessage(user) {
        const authContainer = document.getElementById('auth-container');
        const successContainer = document.getElementById('success-container');
        
        if (authContainer) authContainer.style.display = 'none';
        if (successContainer) {
            successContainer.style.display = 'block';
            const welcomeText = successContainer.querySelector('h2');
            if (welcomeText) {
                welcomeText.innerHTML = `<i class="fas fa-check-circle"></i> ¡Bienvenido, ${user.username}!`;
            }
        }
    }

    // Método para verificar si el usuario está logueado (para usar en otras páginas)
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
            // Emitir evento para indicar que ya está listo
            document.dispatchEvent(new CustomEvent('userReady'));
        }
    }

    // Método para agregar favorito desde otras páginas
    async addFavoriteFromPage(locationId, restaurantName) {
        if (!this.currentUser) {
            // Redirigir a login si no está logueado
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
            this.showAlert('El Restaurante ya esta en la lista de favoritos', 'danger');
            return false;
        }
    }

    // Método para eliminar favorito
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
        // Remover alertas existentes
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

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Getter para verificar si el usuario está logueado
    get isLoggedIn() {
        return this.currentUser !== null;
    }

    // Getter para obtener el usuario actual
    get user() {
        return this.currentUser;
    }
}

// Crear instancia global
const premiumManager = new PremiumManager();

// Hacer disponible globalmente para uso en HTML
window.premiumManager = premiumManager;

document.dispatchEvent(new CustomEvent('userReady'));
