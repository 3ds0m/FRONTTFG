import { showError } from './utils.js';
import { generateRatingStars } from './utils.js';
import * as L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';

export function initMap(restaurantsData) {
  try {
    const madridCenter = [40.4168, -3.7038];
    const map = L.map('map').setView(madridCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    restaurantsData.forEach(restaurant => {
      // Usar directamente las coordenadas proporcionadas en el JSON
      if (restaurant.latitude && restaurant.longitude) {
        const marker = L.marker([restaurant.latitude, restaurant.longitude]).addTo(map);
      
        const address = restaurant.street1 || ''; // Dirección
        const cuisineType = restaurant.cuisine_type || ''; // Tipo de cocina
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
            
            ${cuisineType ? `<p><strong><i class="fas fa-utensils"></i> Cocina:</strong> ${cuisineType}</p>` : ""}
            
            <a href="https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}+${encodeURIComponent(address)}" 
               target="_blank" 
               class="btn btn-outline-primary">
              <i class="fas fa-map-marker-alt"></i> Ver en Google Maps
            </a>
          </div>
        `);
      }
    });

    window.restaurantMap = map;
  } catch (error) {
    console.error("Error al inicializar el mapa:", error);
    showError("Hubo un problema al cargar el mapa.");
  }
}