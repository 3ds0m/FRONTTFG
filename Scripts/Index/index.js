import { initMap } from './map.js';
import { initRestaurants } from './restaurant.js';
import { showError } from './utils.js';
import * as bootstrap from 'bootstrap';

document.addEventListener("DOMContentLoaded", () => {
  // Cargar todos los restaurantes desde el nuevo endpoint
  fetch("http://localhost:9000/listarestaurantes")
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar los datos de restaurantes");
      return response.json();
    })
    .then(data => {
      window.restaurantsData = data;
      initMap(window.restaurantsData);
      
      // Cargar restaurantes lowcost para la sección específica
      fetch("http://localhost:9000/listalowcost")
        .then(response => {
          if (!response.ok) throw new Error("No se pudo cargar los datos de restaurantes económicos");
          return response.json();
        })
        .then(lowCostData => {
          window.lowCostRestaurantsData = lowCostData;
          initRestaurants(window.restaurantsData, window.lowCostRestaurantsData);
        })
        .catch(error => {
          console.error("Error al cargar los datos de restaurantes económicos:", error);
          showError("Error al cargar los datos de restaurantes económicos.");
          // Si falla la carga de lowcost, inicializar con todos los restaurantes
          initRestaurants(window.restaurantsData, []);
        });
    })
    .catch(error => {
      console.error("Error al cargar los datos:", error);
      showError("Error al cargar los datos de restaurantes. Verifica que el servidor esté funcionando.");
    });

  // Agregar evento al botón de recargar
  document.getElementById("reload-restaurants-btn")?.addEventListener("click", () => {
    location.reload();
  });
  
  // Cargar el script de ofertas dinámicamente
  const offersScript = document.createElement('script');
  offersScript.src = 'Scripts/index/offers.js';
  offersScript.onload = function() {
    // Una vez cargado el script, inicializar las ofertas
    if (typeof window.initOffers === 'function') {
      window.initOffers();
    }
  };
  document.body.appendChild(offersScript);
  
  // Cargar Bootstrap para los modales
  if (typeof bootstrap === 'undefined') {
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(bootstrapScript);
  }
});