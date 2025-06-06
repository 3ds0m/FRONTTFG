// Variables globales
let favoritesData = [];
const API_BASE2 = "https://tfg-zbc8.onrender.com/api";

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Premium.js esté listo
    document.addEventListener('userReady', function() {
        initializeFavoritesPage();
    });

    // Si Premium.js ya está listo
    if (window.premiumManager) {
        initializeFavoritesPage();
    }
});

function initializeFavoritesPage() {
    updateAuthUI();
    if (premiumManager.isLoggedIn) {
        showMainContent();
        loadFavorites();
    } else {
        showLoginPrompt();
    }
}

function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-btn');
    if (premiumManager.isLoggedIn) {
        // Show logout button, hide login link
        loginLink.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = premiumManager.user.username;
        }
    } else {
        // Show login link, hide logout button
        loginLink.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

function handleLogout() {
    premiumManager.logout();
    window.location.href = 'Login.html';
}

function showLoginPrompt() {
    document.getElementById('login-prompt').style.display = 'block';
    document.getElementById('login-prompt').style.justifyContent = 'flex-start';
    document.getElementById('login-prompt').style.textAlign = 'left';
    document.getElementById('main-content').style.display = 'none';
}

function showMainContent() {
    document.getElementById('login-prompt').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('main-content').style.justifyContent = 'flex-start';
    document.getElementById('main-content').style.textAlign = 'left';
}

async function loadFavorites() {
    if (!premiumManager.isLoggedIn) {
        showLoginPrompt();
        return;
    }
    showLoadingState();
    try {
        const token = localStorage.getItem('sessionToken');
        // Usar el endpoint correcto de tu API
        const response = await fetch(`${API_BASE2}/auth/user/favorites`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error('Error al cargar favoritos');
        }
        const favorites = await response.json();
        favoritesData = favorites;
        updateFavoritesCount(favorites.length);
        if (favorites.length === 0) {
            showEmptyState();
        } else {
            renderFavorites(favorites);
            showFavoritesContainer();
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        showErrorState();
    }
}

function showLoadingState() {
    document.getElementById('loading-state').style.display = 'flex';
    document.getElementById('loading-state').style.justifyContent = 'flex-start';
    document.getElementById('loading-state').style.textAlign = 'left';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('favorites-container').style.display = 'none';
    document.getElementById('actions-section').style.display = 'none';
}

function showErrorState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('error-state').style.justifyContent = 'flex-start';
    document.getElementById('error-state').style.textAlign = 'left';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('favorites-container').style.display = 'none';
    document.getElementById('actions-section').style.display = 'none';
}

function showEmptyState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    document.getElementById('empty-state').style.justifyContent = 'flex-start';
    document.getElementById('empty-state').style.textAlign = 'left';
    document.getElementById('favorites-container').style.display = 'none';
    document.getElementById('actions-section').style.display = 'none';
}

function showFavoritesContainer() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('favorites-container').style.display = 'flex';
    document.getElementById('favorites-container').style.justifyContent = 'flex-start';
    document.getElementById('favorites-container').style.textAlign = 'left';
    document.getElementById('actions-section').style.display = 'block';
}

function updateFavoritesCount(count) {
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function renderFavorites(favorites) {
    const container = document.getElementById('favorites-container');
    container.innerHTML = '';
    container.style.justifyContent = 'flex-start';
    container.style.textAlign = 'left';
    favorites.forEach(location => {
        const favoriteCard = createFavoriteCard(location);
        container.appendChild(favoriteCard);
    });
}

function createFavoriteCard(location) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    col.style.display = 'block';
    col.style.textAlign = 'left';
    // Generar rating aleatorio si no existe
    const rating = location.rating || (Math.random() * 2 + 3).toFixed(1);
    col.innerHTML = `
        <div class="card restaurant-card h-100">
            <img src="${location.image || '/placeholder.svg?height=200&width=300'}" 
                 class="card-img-top restaurant-image" 
                 alt="${location.name}"
                 onerror="this.src='/placeholder.svg?height=200&width=300'">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">${location.name}</h5>
                    <span class="cuisine-badge">${location.cuisine || 'Restaurante'}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="rating">
                        ${generateStars(parseFloat(rating))}
                        <span class="ms-1">${rating}</span>
                    </div>
                    <small class="text-muted">
                        <i class="fas fa-map-marker-alt"></i> 
                        ${location.neighborhood || 'Madrid'}
                    </small>
                </div>
                ${location.address ? `
                <div class="location-info">
                    <small class="text-muted">
                        <i class="fas fa-location-dot"></i> ${location.address}
                    </small>
                </div>
                ` : ''}
                <div class="d-flex gap-2 mt-auto">
                    <button class="btn btn-outline-primary btn-sm flex-grow-1" 
                            onclick="showRestaurantDetails('${location.locationId}')">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                    <button class="btn btn-remove-favorite btn-sm" 
                            onclick="removeFavorite('${location.locationId}', '${location.name}')">
                        <i class="fas fa-heart-broken"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    return col;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

async function removeFavorite(locationId, restaurantName) {
    const success = await premiumManager.removeFavoriteFromPage(locationId, restaurantName);
    if (success) {
        // Recargar la lista de favoritos
        loadFavorites();
    }
}

async function removeAllFavorites() {
    if (favoritesData.length === 0) {
        premiumManager.showAlert('No tienes favoritos para eliminar', 'info');
        return;
    }
    try {
        const token = localStorage.getItem('sessionToken');
        let removedCount = 0;
        let errors = 0;
        // Eliminar cada favorito individualmente ya que no hay endpoint para limpiar todos
        for (const location of favoritesData) {
            try {
                const response = await fetch(`${API_BASE2}/user/favorites/remove/${location.locationId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    removedCount++;
                } else {
                    errors++;
                }
            } catch (error) {
                errors++;
                console.error('Error removing favorite:', error);
            }
        }
        if (removedCount > 0) {
            premiumManager.showAlert(`${removedCount} favoritos eliminados correctamente`, 'success');
        }
        if (errors > 0) {
            premiumManager.showAlert(`${errors} favoritos no pudieron ser eliminados`, 'warning');
        }
        // Recargar la lista
        loadFavorites();
    } catch (error) {
        premiumManager.showAlert('Error al eliminar favoritos', 'danger');
        console.error('Error removing all favorites:', error);
    }
}

function showRestaurantDetails(locationId) {
    const location = favoritesData.find(l => l.locationId === locationId);
    if (location) {
        const rating = location.rating || (Math.random() * 2 + 3).toFixed(1);
        const detailsHTML = `
            <p><strong>📍 Ubicación:</strong> ${location.addressString || location.neighborhood || 'Madrid, España'}</p>
            <p><strong>🍽️ Tipo:</strong> ${location.cuisine || 'Restaurante'}</p>
            <p><strong>⭐ Rating:</strong> ${rating}/5 (${location.reviewCount} Reseñas)</p>
            <p><strong>🏙️ Ciudad:</strong> ${location.city}</p>
            <p><strong>📞 Teléfono:</strong> 
                ${location.phoneNumber 
                ? `<a href="tel:${location.phoneNumber}">${location.phoneNumber}</a>` 
                : 'No disponible'}
            </p>
            <a href="https://www.google.com/maps/search/${encodeURIComponent(location.name)}+${encodeURIComponent(location.addressString)}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="modal-title"></i> Ver en mapa
            </a>
        `;
        document.getElementById('restaurantModalBody').innerHTML = detailsHTML;
        document.getElementById('restaurantModalLabel').textContent = location.name;
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('restaurantModal'));
        modal.show();
    }
}

// Función para refrescar favoritos (puede ser llamada desde otras páginas)
window.refreshFavorites = function() {
    if (premiumManager.isLoggedIn) {
        loadFavorites();
    }
};
window.showRestaurantDetails = showRestaurantDetails;
window.removeFavorite = removeFavorite;
window.removeAllFavorites = removeAllFavorites;
window.handleLogout = handleLogout;
window.initializeFavoritesPage = initializeFavoritesPage;
window.updateAuthUI = updateAuthUI;
window.showLoginPrompt = showLoginPrompt;
window.showMainContent = showMainContent;
window.generateStars = generateStars;
window.createFavoriteCard = createFavoriteCard;
window.renderFavorites = renderFavorites;
window.loadFavorites = loadFavorites;
window.showLoadingState = showLoadingState;
window.showErrorState = showErrorState;
window.showEmptyState = showEmptyState;
window.updateFavoritesCount = updateFavoritesCount;
window.showFavoritesContainer = showFavoritesContainer;
window.removeAllFavorites = removeAllFavorites;