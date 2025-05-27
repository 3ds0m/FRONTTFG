export function generateRatingStars(rating) {
  const num = Number.parseFloat(rating) || 0
  const full = Math.floor(num)
  const half = num % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    '<i class="fas fa-star"></i>'.repeat(full) +
    (half ? '<i class="fas fa-star-half-alt"></i>' : "") +
    '<i class="far fa-star"></i>'.repeat(empty)
  )
}

export function displayPriceLevel(level) {
  // Si el nivel de precio es N/A, mostrar "Sorpresa"
  if (level === "N/A") {
    return `<span class="price-level" style="background: var(--primary);">Precio no disponible</span>`
  }

  const ranges = {
    $: "5-15€",
    $$: "15-30€",
    $$$: "30-50€",
    $$$$: "50€+",
    "$ - $$": "15-30€",
    "$$ - $$$": "30-50€",
  }
  return level
    ? `<span class="price-level">${level}</span> <small>(${ranges[level] || ""})</small>`
    : '<span class="text-muted">Precio no disponible</span>'
}

export function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function showError(message) {
  const alert = document.createElement("div")
  alert.className = "alert alert-danger alert-dismissible fade show m-3"
  alert.role = "alert"
  alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
  document.body.prepend(alert)
}

export function getCoordinatesFromAddress(addressObj) {
  const center = [40.4168, -3.7038]
  if (!addressObj) return { lat: center[0], lng: center[1] }

  const addressStr = (addressObj.street1 || "") + (addressObj.postalcode || "")
  let hash = 0
  for (let i = 0; i < addressStr.length; i++) {
    hash = (hash << 5) - hash + addressStr.charCodeAt(i)
    hash |= 0
  }

  const latOffset = (hash % 1000) / 10000 - 0.05
  const lngOffset = ((hash >> 8) % 1000) / 10000 - 0.05

  return {
    lat: center[0] + latOffset,
    lng: center[1] + lngOffset,
  }
}
export async function initUserMenu() {
  const userMenuContainer = document.getElementById('user-menu-container');
  if (!userMenuContainer) return;
  
  if (premiumManager.isLoggedIn) {
    // Usuario logueado - mostrar menú de usuario
    userMenuContainer.innerHTML = `
      <div class="user-menu">
        <button class="user-btn" onclick="toggleUserDropdown()">
          <i class="fas fa-user"></i> ${premiumManager.user.username}
        </button>
        <div id="user-dropdown" class="user-dropdown">
          <a href="#" onclick="showFavorites()"><i class="fas fa-heart"></i> Ver Favoritos</a>
          <a href="#" onclick="premiumManager.logout()"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
        </div>
      </div>
    `;
    // Cargar favoritos del usuario
    await loadUserFavorites();
  } else {
    // Usuario no logueado - mostrar botón de login
    userMenuContainer.innerHTML = `
      <a href="Login.html" class="login-btn">
        <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
      </a>
    `;
  }
}

// Función para mostrar favoritos (placeholder para futura implementación)
function showFavorites() {
  alert('Funcionalidad de ver favoritos será implementada en una ventana separada próximamente.');
  // Cerrar dropdown
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
  }
}

// Hacer la función showFavorites disponible globalmente
window.showFavorites = showFavorites;
export async function loadUserFavorites() {
  if (!premiumManager.isLoggedIn) {
    return;
  }

  try {
    const token = localStorage.getItem('sessionToken');
    const response = await fetch(`https://tfg-zbc8.onrender.com/api/user/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      userFavorites = await response.json();
      updateFavoriteButtons();
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
}
export async function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}