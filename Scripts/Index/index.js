import { initMap } from './map.js';
import { initRestaurants } from './restaurant.js';
import { showError } from './utils.js';
import { getCoordinatesFromAddress } from './utils.js'; 

document.addEventListener("DOMContentLoaded", () => {
  fetch("../restaurantes.json")
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
      return response.json();
    })
    .then(data => {
      window.restaurantsData = data;
      initApp();
    })
    .catch(error => {
      console.error("Error al cargar los datos:", error);
      showError("Error al cargar los datos. Verifica que el archivo JSON existe.");
    });
});

function initApp() {
  if (typeof L === 'undefined') {
    showError("La biblioteca de mapas no se cargó correctamente.");
    return;
  }

  initMap(window.restaurantsData);
  initRestaurants(window.restaurantsData);
}
