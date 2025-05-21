// Función principal para inicializar la sección de ofertas
export function initOffers() {
  // Cargar una oferta destacada al azar
  loadFeaturedOffer();
}

// Función para cargar una oferta destacada
function loadFeaturedOffer() {
  const featuredBox = document.getElementById("featured-offer-box");
  if (!featuredBox) return;
  
  // Mostrar mensaje de carga
  featuredBox.innerHTML = `
    <div class="text-center p-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando oferta destacada...</p>
    </div>
  `;
  
  // Obtener las ofertas del endpoint
  fetch("https://tfg-zbc8.onrender.com/listaofertas")
    .then(response => {
      if (!response.ok) throw new Error("No se pudieron cargar las ofertas");
      return response.json();
    })
    .then(offers => {
      // Asegurarse de que offers sea un array
      const offersArray = Array.isArray(offers) ? offers : [offers];
      
      if (offersArray.length === 0) {
        featuredBox.innerHTML = `
          <div class="alert alert-info m-3">
            No hay ofertas disponibles en este momento.
          </div>
        `;
        return;
      }
      
      // Seleccionar una oferta aleatoria
      const randomOffer = offersArray[Math.floor(Math.random() * offersArray.length)];
      
      // Calcular el porcentaje de descuento
      const discountPercent = randomOffer.percent || 
                             Math.round(((randomOffer.old_price - randomOffer.new_price) / randomOffer.old_price) * 100);
      
      // Formatear la fecha de fin
      const endDate = randomOffer.finOferta ? new Date(randomOffer.finOferta).toLocaleDateString() : 'No especificado';
      
      // Mostrar la oferta destacada
      featuredBox.innerHTML = `
        <div class="featured-offer">
          <div class="featured-offer-img">
            <img src="${randomOffer.image || 'img/default-offer.jpg'}" 
                 alt="${randomOffer.title}" 
                 onerror="this.src='img/default-offer.jpg'">
            <div class="featured-discount">-${discountPercent}%</div>
          </div>
          <div class="featured-offer-content">
            <h4>${randomOffer.title}</h4>
            <p class="featured-location">${randomOffer.locationName}</p>
            <p class="featured-description">${randomOffer.description}</p>
            <div class="featured-price mb-3">
              <span class="old-price">${randomOffer.old_price}€</span>
              <span class="new-price">${randomOffer.new_price}€</span>
            </div>
            <p class="offer-valid">Válido hasta: ${endDate}</p>
            <a href="ofertas.html" class="btn btn-primary w-100">
              <i class="fas fa-tag me-2"></i> Ver todas las ofertas
            </a>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error("Error al cargar las ofertas:", error);
      featuredBox.innerHTML = `
        <div class="alert alert-danger m-3">
          Error al cargar las ofertas. Por favor, inténtalo de nuevo más tarde.
        </div>
      `;
    });
}

// Exportar la función para que pueda ser usada desde index.js
window.initOffers = initOffers;