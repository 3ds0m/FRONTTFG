import { getCoordinatesFromAddress, showError } from './utils.js';

export function initMap(restaurantsData) {
  try {
    const madridCenter = [40.4168, -3.7038];
    const map = L.map('map').setView(madridCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    restaurantsData.forEach(restaurant => {
      const coordinates = getCoordinatesFromAddress(restaurant.address_obj);
      const marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map);
    
      const address = restaurant.address_obj?.street1 || ''; // Dirección
      const cuisineTags = restaurant.cuisine_tags ? restaurant.cuisine_tags.join(", ") : ''; // Etiquetas de cocina
      const rating = restaurant.rating || 'No disponible';  // Rating
      const ratingStars = generateRatingStars(rating);  // Generar estrellas

      marker.bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <img src="${restaurant.image || 'img/default-restaurant.jpg'}" 
               alt="${restaurant.name}" 
               style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
          <h6>${restaurant.name}</h6>
          <p><i class="fas fa-map-marker-alt"></i> ${address}</p>
          
          <!-- Mostrar rating y estrellas -->
          <div class="rating-stars mb-2">
            ${ratingStars} <span class="ms-2">${rating}</span>
          </div>
          
          ${cuisineTags ? `<p><strong><i class="fas fa-utensils"></i> Cocina:</strong></p><div class="cuisine-tags mb-3">${cuisineTags}</div>` : ""}
          
          <a href="https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}+${encodeURIComponent(address)}" 
             target="_blank" 
             class="btn btn-outline-primary">
            <i class="fas fa-map-marker-alt"></i> Ver en Google Maps
          </a>
        </div>
      `);
    });

    window.restaurantMap = map;
  } catch (error) {
    console.error("Error al inicializar el mapa:", error);
    showError("Hubo un problema al cargar el mapa.");
  }
}

// Esta es la función que genera las estrellas basadas en el rating.
function generateRatingStars(rating) {
  if (!rating) return ''; // Si no hay rating, no mostramos estrellas.

  let stars = '';
  const fullStar = '<i class="fas fa-star"></i>';
  const halfStar = '<i class="fas fa-star-half-alt"></i>';
  const emptyStar = '<i class="far fa-star"></i>';

  const fullStars = Math.floor(rating);  // Estrellas completas.
  const halfStars = rating % 1 >= 0.5 ? 1 : 0;  // Estrellas medias (si el rating tiene decimales).
  const emptyStars = 5 - fullStars - halfStars;  // Rellenar con estrellas vacías.

  stars += fullStar.repeat(fullStars);  // Genera las estrellas completas.
  stars += halfStar.repeat(halfStars);  // Genera las estrellas medias.
  stars += emptyStar.repeat(emptyStars);  // Genera las estrellas vacías.

  return stars;
}
