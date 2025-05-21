document.addEventListener("DOMContentLoaded", () => {
  // Cargar todas las ofertas al iniciar la página
  loadAllOffers();
  
  // Agregar evento al botón de recargar ofertas
  document.getElementById("reload-offers-btn")?.addEventListener("click", loadAllOffers);
  
  // Configurar funciones globales
  window.loadRestaurantDetails = loadRestaurantDetails;
});


// Función para cargar todas las ofertas
function loadAllOffers() {
  const container = document.getElementById("all-offers-container");
  const statusContainer = document.getElementById("offers-status");
  
  if (!container || !statusContainer) return;
  
  // Mostrar mensaje de carga
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando ofertas disponibles...</p>
    </div>
  `;
  statusContainer.innerHTML = "";
  console.log("listaofertas")
  // Obtener las ofertas del endpoint
  fetch("http://localhost:8080/listaofertas")
  
    .then(response => {
      if (!response.ok) throw new Error("No se pudieron cargar las ofertas");
      return response.json();
    })
    .then(offers => {
      // Asegurarse de que offers sea un array
      const offersArray = Array.isArray(offers) ? offers : [offers];
      
      if (offersArray.length === 0) {
        statusContainer.innerHTML = `
          <div class="alert alert-info">
            No hay ofertas disponibles en este momento.
          </div>
        `;
        container.innerHTML = "";
        return;
      }
      
      // Guardar las ofertas en una variable global para acceder después
      window.offersData = offersArray;
      
      // Mostrar el número de ofertas encontradas
      statusContainer.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle me-2"></i> Se encontraron ${offersArray.length} ofertas disponibles.
        </div>
      `;
      
      // Limpiar el contenedor
      container.innerHTML = "";
      
      // Mostrar todas las ofertas
      offersArray.forEach((offer, index) => {
        // Calcular el porcentaje de descuento
        const discountPercent = offer.percent || 
                               Math.round(((offer.old_price - offer.new_price) / offer.old_price) * 100);
        
        // Formatear la fecha de fin
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
const stripe = Stripe('pk_test_51RR6eVIVlXlM0oyWwyDleQAXhenoCdq4fVVgZhOmxNkb0fWby6kr061zrD2pL52wtS0MtfMw5pfnuM7FCzPCYPyp007vNmzU4m');
async function handlePayment(offerId) {
  try {
    const response = await fetch('http://localhost:8080/pago/crear-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId }),  // envías solo el id
    });

    if (!response.ok) {
      throw new Error('Error en la creación de sesión');
    }

    const data = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (result.error) {
      console.error(result.error.message);
    }

  } catch (error) {
    console.error('Error iniciando pago:', error);
  }
}
const loadingModalEl = document.getElementById('loadingModal');
const bsLoadingModal = bootstrap.Modal.getInstance(loadingModalEl) || new bootstrap.Modal(loadingModalEl, {
  backdrop: 'static',
  keyboard: false
});

function hideLoadingModal() {
  const loadingModalEl = document.getElementById('loadingModal');
  const bsLoadingModalInstance = bootstrap.Modal.getInstance(loadingModalEl);

  if (bsLoadingModalInstance) {
    bsLoadingModalInstance.hide();

    // Después de un pequeño delay para que termine la animación...
    setTimeout(() => {
      loadingModalEl.classList.remove('show');
      loadingModalEl.style.display = 'none';

      // Quitar clase que bloquea scroll y fondo
      document.body.classList.remove('modal-open');

      // Quitar backdrop si existe
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }, 300); // 300ms, tiempo típico de la animación de Bootstrap
  }
}



function loadRestaurantDetails(encodedName, offerIndex) {
  console.log("Cargando detalles del restaurante:", encodedName);
  
  const loadingModal = document.getElementById('loadingModal');
  let bsLoadingModal = bootstrap.Modal.getInstance(loadingModal);

  if (!bsLoadingModal) {
    bsLoadingModal = new bootstrap.Modal(loadingModal, {
      backdrop: 'static',
      keyboard: false
    });
  }

  bsLoadingModal.show();

  fetch(`http://localhost:8080/locations/search?query=${encodedName}`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudieron cargar los detalles del restaurante");
      return response.json();
    })
    .then(restaurantData => {
      console.log("Datos recibidos, ocultando modal de carga");
      hideLoadingModal();

      if (Array.isArray(restaurantData) && restaurantData.length > 0) {
        setTimeout(() => {
          openOfferModal(restaurantData[0], offerIndex);
        }, 300); // Esperar que cierre el modal de carga antes de abrir el siguiente
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


// Función para abrir el modal con los detalles de la oferta y el restaurante
function openOfferModal(restaurantData, offerIndex) {
  // Obtener la oferta correspondiente
  const offer = window.offersData[offerIndex];
  
  if (!offer) {
    alert("No se encontró la oferta seleccionada.");
    return;
  }
  
  // Obtener el elemento del modal
  const modalBody = document.getElementById('offerRestaurantModalBody');
  
  // Calcular el porcentaje de descuento
  const discountPercent = offer.percent || 
                         Math.round(((offer.old_price - offer.new_price) / offer.old_price) * 100);
  
  // Formatear las fechas
  const startDate = offer.inicioOferta ? new Date(offer.inicioOferta).toLocaleDateString() : 'No especificado';
  const endDate = offer.finOferta ? new Date(offer.finOferta).toLocaleDateString() : 'No especificado';
  
  // Preparar la información del restaurante
  const address = restaurantData.addressString || 
                 (restaurantData.street1 ? `${restaurantData.street1}, ${restaurantData.city} ${restaurantData.postalcode}` : "Dirección no disponible");
  
  const cuisineTypes = restaurantData.cuisine_type || "";
  const cuisineTags = cuisineTypes.split(", ")
    .map((c) => `<span class="cuisine-tag">${c}</span>`)
    .join("");
  
  // Llenar el modal con la información
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
        <div class="d-flex justify-content-between mt-3">
          <a href="https://www.google.com/maps/search/${encodeURIComponent(restaurantData.name)}+${encodeURIComponent(address)}" target="_blank" class="google-maps-btn">
            <i class="fas fa-map-marker-alt"></i> Ver en Google Maps
          </a>
          <button class="view-details-btn" onclick="handlePayment(${offer.id})">
            <i class="fas fa-credit-card me-1"></i> Gestionar pago
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Mostrar el modal
  const offerModal = document.getElementById('offerRestaurantModal');
  const bsOfferModal = new bootstrap.Modal(offerModal);
  bsOfferModal.show();
}

// Funciones auxiliares
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

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

function displayPriceLevel(level) {
  if (level === "N/A") {
    return `<span class="price-level" style="background: var(--primary);">Sorpresa</span>`;
  }

  const ranges = {
    $: "5-15€",
    $$: "15-30€",
    $$$: "30-50€",
    $$$$: "50€+",
    "$ - $$": "15-30€",
    "$$ - $$$": "30-50€",
  };
  return level
    ? `<span class="price-level">${level}</span> <small>(${ranges[level] || ""})</small>`
    : '<span class="text-muted">Precio no disponible</span>';
}