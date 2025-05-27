import { generateRatingStars, displayPriceLevel, shuffleArray } from "./utils.js"
let userFavorites = []
export function initRestaurants(allRestaurantsData, lowCostRestaurantsData) {

  // Si no hay datos de lowcost, filtrar de todos los restaurantes
  const lowCostData =
    lowCostRestaurantsData && lowCostRestaurantsData.length > 0
      ? lowCostRestaurantsData
      : allRestaurantsData.filter((r) => r.priceLevel === "$" || r.priceLevel === "$$" || r.priceLevel === "$ - $$")

  createRestaurantCards(lowCostData) // Crea las tarjetas iniciales
  getRandomRestaurant(allRestaurantsData) // Muestra el restaurante aleatorio por defecto

  // Agregar eventos al botón de restaurante aleatorio
  document.getElementById("select-random-btn")?.addEventListener("click", () => getRandomRestaurant(allRestaurantsData))

  // Configurar funciones globales
  window.openRestaurantModal = openRestaurantModal
  window.navigateToCuisine = navigateToCuisine
}

function createRestaurantCards(data) {
  const container = document.getElementById("restaurant-cards")
  if (!container) return

  container.innerHTML = ""

  // Mostrar mensaje si no hay restaurantes de bajo costo
  if (data.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-info">No encontramos restaurantes económicos en este momento.</div></div>`
    return
  }

  // Barajar y tomar los primeros 4 restaurantes
  const shuffled = shuffleArray([...data]).slice(0, 4)
  window.currentLowCostRestaurants = shuffled

  // Crear las tarjetas de restaurante
  shuffled.forEach((restaurant, index) => {
    const isFavorite = userFavorites.includes(restaurant.locationId);
    const favoriteClass = isFavorite ? 'active' : '';
    const favoriteIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    const favoriteTitle = isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos';
    container.innerHTML += `
      <div class="col-6 mb-3">
        <div class="restaurant-card-wrapper">
          <div class="restaurant-card">
            <button class="favorite-btn ${favoriteClass}"
                    data-location-id="${restaurant.locationId}"
                    onclick="handleFavoriteClick(event, '${restaurant.locationId}', '${restaurant.name}')"
                    title="${favoriteTitle}">
              <i class="${favoriteIcon}"></i>
            </button>
            <div class="restaurant-card-img">
              <img src="${restaurant.image || "default-restaurant.png"}" 
                   alt="${restaurant.name}" 
                   onerror="this.src='default-restaurant.png'">
            </div>
            <div class="restaurant-card-content">
              <div>
                <h5 class="restaurant-card-title">${restaurant.name}</h5>
                <div class="rating-stars mb-2">
                  ${generateRatingStars(restaurant.rating)}
                  <span class="ms-1">${restaurant.rating}</span>
                </div>
                <p class="mb-2">${displayPriceLevel(restaurant.priceLevel)}</p>
              </div>
              <button class="view-details-btn" onclick="openRestaurantModal(${index}, 'lowcost')">
                <i class="fas fa-info-circle"></i> Ver detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  createRestaurantModals(shuffled, "lowcost")
}

function createRestaurantModals(restaurants, type) {
  const container = document.querySelector(".modal-container") || document.body

  // Eliminar modales anteriores
  document.querySelectorAll(`.modal-${type}`).forEach((el) => el.remove())

  // Crear modales para cada restaurante
  restaurants.forEach((restaurant, index) => {
    // Adaptar a la nueva estructura de datos
    const cuisineTypes = restaurant.cuisine_type || ""
    const cuisineTags = cuisineTypes
      .split(", ")
      .map((c) => `<span class="cuisine-tag" onclick="navigateToCuisine('${c}')">${c}</span>`)
      .join("")

    const address =
      restaurant.addressString ||
      (restaurant.street1
        ? `${restaurant.street1}, ${restaurant.city} ${restaurant.postalcode}`
        : "Dirección no disponible")
    
    const isFavorite = userFavorites.includes(restaurant.locationId);
    const favoriteClass = isFavorite ? 'active' : '';
    const favoriteIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    const favoriteTitle = isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos';
    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="modal fade modal-${type}" id="restaurantModal-${type}-${index}" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${restaurant.name}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
                <button class="favorite-btn ${favoriteClass}"
                        data-location-id="${restaurant.locationId}"
                        onclick="handleFavoriteClick(event, '${restaurant.locationId}', '${restaurant.name}')"
                        title="${favoriteTitle}">
                  <i class="${favoriteIcon}"></i>
                </button>
              <div class="modal-restaurant-details">
                <div class="modal-restaurant-img-container">
                  <div class="modal-restaurant-img">
                    <img src="${restaurant.image || "default-restaurant.png"}" alt="${restaurant.name}" onerror="this.src='default-restaurant.png'">
                  </div>
                </div>
                <div class="modal-restaurant-content">
                  <div class="rating-stars mb-3">${generateRatingStars(restaurant.rating)}<span class="ms-2">${restaurant.rating}</span></div>
                  <p class="mb-2">${displayPriceLevel(restaurant.priceLevel)}</p>
                  <p><strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong></p>
                  <p>${address}</p>
                  ${cuisineTags ? `<p><strong><i class="fas fa-utensils"></i> Cocina:</strong></p><div class="cuisine-tags mb-3">${cuisineTags}</div>` : ""}
                  <a href="https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}+${encodeURIComponent(address)}" target="_blank" class="btn btn-outline-primary">
                    <i class="fas fa-map-marker-alt"></i> Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    )
  })
}

function openRestaurantModal(index, type) {
  const modal = new bootstrap.Modal(document.getElementById(`restaurantModal-${type}-${index}`))
  modal.show()
}

function getRandomRestaurant(data) {
  const r = data[Math.floor(Math.random() * data.length)]; // Restaurante aleatorio
  const box = document.getElementById("random-restaurant-box");
  if (!box) return;

  const isFavorite = userFavorites.includes(r.locationId);
  const favoriteClass = isFavorite ? 'active' : '';
  const favoriteIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';
  const favoriteTitle = isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos';

  const cuisineTypes = r.cuisine_type || "";
  const cuisineTags = cuisineTypes
    .split(", ")
    .map((c) => `<span class="cuisine-tag" onclick="navigateToCuisine('${c}')">${c}</span>`)
    .join("");

  const address = r.street1 || "Dirección no disponible";

  box.innerHTML = `
    <div class="random-restaurant-img">
      <img src="${r.image || "default-restaurant.png"}" alt="${r.name}" onerror="this.src='default-restaurant.png'">
      <button class="favorite-btn ${favoriteClass}"
              data-location-id="${r.locationId}"
              onclick="handleFavoriteClick(event, '${r.locationId}', '${r.name}')"
              title="${favoriteTitle}">
        <i class="${favoriteIcon}"></i>
      </button>
    </div>
    <div class="random-restaurant-content">
      <h5>${r.name}</h5>
      <div class="rating-stars mb-2">${generateRatingStars(r.rating)}<span class="ms-1">${r.rating}</span></div>
      <p class="text-muted small mb-2">${address}</p>
      <p class="mb-2">${displayPriceLevel(r.priceLevel)}</p>
      ${cuisineTags ? `<div class="cuisine-tags mb-3">${cuisineTags}</div>` : ""}
      <a href="https://www.google.com/maps/search/${encodeURIComponent(r.name)}+${encodeURIComponent(address)}" target="_blank" class="btn btn-sm btn-outline-primary">
        <i class="fas fa-map-marker-alt"></i> Ver en mapa
      </a>
    </div>
  `;
}


// Modificar la función navigateToCuisine para que redirija con el parámetro de cocina
function navigateToCuisine(cuisine) {
  window.location.href = `Cocinas.html?cuisine=${encodeURIComponent(cuisine)}`
}
async function handleFavoriteClick(event, locationId, restaurantName) {
  event.stopPropagation();
  event.preventDefault();
  if (!premiumManager.isLoggedIn) {
    // SOLUCION PROBLEMA 1: Asegurar que el modal de login tenga mayor z-index
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
      backdrop: 'static',
      keyboard: false
    });
    
    // Aumentar z-index del modal de login
    const loginModalElement = document.getElementById('loginModal');
    loginModalElement.style.zIndex = '1060';
    
    loginModal.show();

    const confirmLoginBtn = document.getElementById('confirmLoginBtn');
    confirmLoginBtn.onclick = () => {
      window.location.href = 'Login.html';
    };
    return;
  }
  const btn = event.currentTarget;
  const icon = btn.querySelector('i');
  const isActive = btn.classList.contains('active');

  // Opcional: puedes mostrar un spinner si quieres feedback visual
  btn.disabled = true;
  icon.className = 'fas fa-spinner fa-spin';

  let success = false;
  try {
    if (isActive) {
      // Quitar favorito usando premiumManager
      success = await window.premiumManager.removeFavoriteFromPage(locationId, restaurantName);
      if (success) {
        btn.classList.remove('active');
        btn.title = 'Agregar a favoritos';
        icon.className = 'far fa-heart';
      }
    } else {
      // Agregar favorito usando premiumManager
      success = await window.premiumManager.addFavoriteFromPage(locationId, restaurantName);
      if (success) {
        btn.classList.add('active');
        btn.title = 'Eliminar de favoritos';
        icon.className = 'fas fa-heart';
      }
    }
  } catch (error) {
    icon.className = isActive ? 'fas fa-heart' : 'far fa-heart';
    console.error('Error handling favorite:', error);
  } finally {
    btn.disabled = false;
  }
}
window.handleFavoriteClick = handleFavoriteClick;