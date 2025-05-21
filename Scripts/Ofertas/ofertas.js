document.addEventListener("DOMContentLoaded", () => {
  // Cargar todas las ofertas al iniciar la página
  loadAllOffers();

  // Escucha los cambios del filtro
  const filterSelect = document.getElementById("filter-select");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const selectedFilter = filterSelect.value;
      sortOffers(selectedFilter);
    });
  }

  // Agregar evento al botón de recargar ofertas
  document.getElementById("reload-offers-btn")?.addEventListener("click", loadAllOffers);

  // Exponer función global para abrir detalles
  window.loadRestaurantDetails = loadRestaurantDetails;
});

// Función para cargar todas las ofertas
function loadAllOffers() {
  const container = document.getElementById("all-offers-container");
  const statusContainer = document.getElementById("offers-status");

  if (!container || !statusContainer) return;

  // Mostrar spinner y mensaje de carga
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando ofertas disponibles...</p>
    </div>
  `;
  statusContainer.innerHTML = "";

  fetch("https://tfg-zbc8.onrender.com/listaofertas")
    .then(response => {
      if (!response.ok) throw new Error("No se pudieron cargar las ofertas");
      return response.json();
    })
    .then(offers => {
      const offersArray = Array.isArray(offers) ? offers : [offers];

      if (offersArray.length === 0) {
        statusContainer.innerHTML = `
          <div class="alert alert-info">No hay ofertas disponibles en este momento.</div>
        `;
        container.innerHTML = "";
        return;
      }

      // Guardar las ofertas globalmente para usar después
      window.offersData = offersArray;

      statusContainer.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle me-2"></i> Se encontraron ${offersArray.length} ofertas disponibles.
        </div>
      `;

      renderOffers(offersArray);
    })
    .catch(error => {
      console.error("Error al cargar las ofertas:", error);
      statusContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i> Error al cargar las ofertas. Por favor, inténtalo de nuevo más tarde.
        </div>
      `;
      container.innerHTML = "";
    });
}

// Función para mostrar las ofertas (puede usarse para ordenar)
function renderOffers(offersArray) {
  const container = document.getElementById("all-offers-container");
  container.innerHTML = "";

  offersArray.forEach((offer, index) => {
    const discountPercent = offer.percent ||
      Math.round(((offer.old_price - offer.new_price) / offer.old_price) * 100);

    const endDate = offer.finOferta ? new Date(offer.finOferta).toLocaleDateString() : 'No especificado';

    container.innerHTML += `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="offer-card">
          <div class="offer-discount">-${discountPercent}%</div>
          <div class="offer-img">
            <img src="${offer.image || 'img/default-offer.jpg'}"
                 alt="${offer.title}"
                 onerror="this.src='img/default-offer.jpg'">
          </div>
          <div class="offer-content">
            <h5 class="offer-title">${offer.title}</h5>
            <p class="offer-location">${offer.locationName}</p>
            <p class="offer-description">${truncateText(offer.description, 80)}</p>
            <div class="offer-price">
              <span class="old-price">${offer.old_price}€</span>
              <span class="new-price">${offer.new_price}€</span>
            </div>
            <p class="offer-valid">Válido hasta: ${endDate}</p>
            <div class="d-flex justify-content-between mt-3">
              <button class="view-details-btn" onclick="loadRestaurantDetails('${offer.locationName}', ${index})">
                <i class="fas fa-info-circle me-1"></i> Ver detalles
              </button>
              <button class="view-details-btn" onclick="handlePayment(${offer.id})">
                <i class="fas fa-credit-card me-1"></i> Gestionar pago
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// Función para ordenar las ofertas
function sortOffers(type) {
  if (!Array.isArray(window.offersData)) return;

  const sorted = [...window.offersData];

  switch (type) {
    case 'price':
      sorted.sort((a, b) => a.new_price - b.new_price);
      break;
    case 'name':
      sorted.sort((a, b) =>
        a.title.trim().localeCompare(b.title.trim(), 'es', { sensitivity: 'base' })
      );
      break;
    case 'date':
      sorted.sort((a, b) => new Date(a.finOferta) - new Date(b.finOferta));
      break;
    default:
      break;
  }

  renderOffers(sorted);
}

// Funciones auxiliares
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

const stripe = Stripe('pk_test_51RR6eVIVlXlM0oyWwyDleQAXhenoCdq4fVVgZhOmxNkb0fWby6kr061zrD2pL52wtS0MtfMw5pfnuM7FCzPCYPyp007vNmzU4m');
async function handlePayment(offerId) {
  try {
    const response = await fetch('https://tfg-zbc8.onrender.com/pago/crear-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId }),
    });

    if (!response.ok) throw new Error('Error en la creación de sesión');

    const data = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (result.error) console.error(result.error.message);
  } catch (error) {
    console.error('Error iniciando pago:', error);
  }
}

// Modal de carga (loading modal)
function hideLoadingModal() {
  const loadingModalEl = document.getElementById('loadingModal');
  const bsLoadingModalInstance = bootstrap.Modal.getInstance(loadingModalEl);

  if (bsLoadingModalInstance) {
    bsLoadingModalInstance.hide();

    setTimeout(() => {
      loadingModalEl.classList.remove('show');
      loadingModalEl.style.display = 'none';
      document.body.classList.remove('modal-open');

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }, 300);
  }
}

// Cargar detalles del restaurante y mostrar modal
function loadRestaurantDetails(encodedName, offerIndex) {
  const loadingModal = document.getElementById('loadingModal');
  let bsLoadingModal = bootstrap.Modal.getInstance(loadingModal);

  if (!bsLoadingModal) {
    bsLoadingModal = new bootstrap.Modal(loadingModal, {
      backdrop: 'static',
      keyboard: false
    });
  }

  bsLoadingModal.show();

  fetch(`https://tfg-zbc8.onrender.com/locations/search?query=${encodedName}`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudieron cargar los detalles del restaurante");
      return response.json();
    })
    .then(restaurantData => {
      hideLoadingModal();

      if (Array.isArray(restaurantData) && restaurantData.length > 0) {
        setTimeout(() => {
          openOfferModal(restaurantData[0], offerIndex);
        }, 300);
      } else {
        alert("No se encontraron detalles para este restaurante.");
      }
    })
    .catch(error => {
      console.error("Error al cargar los detalles del restaurante:", error);
      hideLoadingModal();
      alert("Error al cargar los detalles del restaurante. Por favor, inténtalo de nuevo más tarde.");
    });
}

// Abrir modal con detalles
function openOfferModal(restaurantData, offerIndex) {
  const offer = window.offersData[offerIndex];
  if (!offer) {
    alert("No se encontró la oferta seleccionada.");
    return;
  }

  const modalBody = document.getElementById('offerRestaurantModalBody');

  const discountPercent = offer.percent ||
    Math.round(((offer.old_price - offer.new_price) / offer.old_price) * 100);

  const startDate = offer.inicioOferta ? new Date(offer.inicioOferta).toLocaleDateString() : 'No especificado';
  const endDate = offer.finOferta ? new Date(offer.finOferta).toLocaleDateString() : 'No especificado';

  const address = restaurantData.addressString ||
    (restaurantData.street1 ? `${restaurantData.street1}, ${restaurantData.city} ${restaurantData.postalcode}` : "Dirección no disponible");

  const cuisineTypes = restaurantData.cuisine_type || "";
  const cuisineTags = cuisineTypes.split(", ")
    .map(c => `<span class="cuisine-tag">${c}</span>`)
    .join("");

  modalBody.innerHTML = `
    <div class="modal-restaurant-details">
      <div class="modal-restaurant-img-container">
        <div class="modal-restaurant-img">
          <img src="${restaurantData.image || 'img/default-restaurant.jpg'}" alt="${restaurantData.name}" onerror="this.src='img/default-restaurant.jpg'">
        </div>
      </div>
      <div class="modal-restaurant-content">
        <h4 class="modal-restaurant-title">${restaurantData.name}</h4>
        <div class="rating-stars mb-3">
          ${generateRatingStars(restaurantData.rating)}<span class="ms-2">${restaurantData.rating || 'N/A'}</span>
        </div>
        <p class="mb-2">${displayPriceLevel(restaurantData.priceLevel)}</p>

        <div class="offer-highlight mb-4 p-3" style="background-color: #fff4f4; border-radius: 8px; border-left: 4px solid var(--primary);">
          <h5 class="mb-2"><i class="fas fa-tag me-2"></i>${offer.title}</h5>
          <p class="mb-2">${offer.description}</p>
          <div class="d-flex align-items-center mb-2">
            <span class="old-price me-2">${offer.old_price}€</span>
            <span class="new-price">${offer.new_price}€</span>
            <span class="ms-2 badge bg-danger">-${discountPercent}%</span>
          </div>
          <p class="small mb-0"><strong>Válido:</strong> ${startDate} - ${endDate}</p>
        </div>

        <p><strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong></p>
        <p>${address}</p>
        ${cuisineTags ? `<p><strong><i class="fas fa-utensils"></i> Cocina:</strong></p><div class="cuisine-tags mb-3">${cuisineTags}</div>` : ""}

        <div class="d-flex flex-column flex-sm-row gap-2 mt-3">
          <a href="https://www.google.com/maps/search/${encodeURIComponent(restaurantData.name)}+${encodeURIComponent(address)}"
            target="_blank" class="google-maps-btn flex-fill text-center">
            <i class="fas fa-map-marker-alt"></i> Ver en Google Maps
          </a>
          <button class="view-details-btn flex-fill" onclick="handlePayment(${offer.id})">
            <i class="fas fa-credit-card me-1"></i> Gestionar pago
          </button>
        </div>
      </div>
    </div>
  `;

  const offerModal = document.getElementById('offerRestaurantModal');
  const bsOfferModal = new bootstrap.Modal(offerModal);
  bsOfferModal.show();
}

// Generar estrellas de rating
function generateRatingStars(rating) {
  const num = Number.parseFloat(rating) || 0;
  const full = Math.floor(num);
  const half = num % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    '<i class="fas fa-star"></i>'.repeat(full) +
    (half ? '<i class="fas fa-star-half-alt"></i>' : "") +
    '<i class="far fa-star"></i>'.repeat(empty)
  );
}

// Mostrar nivel de precios
function displayPriceLevel(level) {
  if (level === "N/A") {
    return `<span class="price-level" style="background: var(--primary);">S/N</span>`;
  }

  const count = parseInt(level) || 0;
  return "$".repeat(count);
}
