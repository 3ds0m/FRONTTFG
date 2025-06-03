import { initMap } from './map.js';
import { initRestaurants } from './restaurant.js';
import { showError , initUserMenu , loadUserFavorites , toggleUserDropdown} from './utils.js';
import { initOffers } from './offers.js';
document.addEventListener("DOMContentLoaded", () => {
  initUserMenu();
  document.addEventListener("userReady", () => {
    initUserMenu();
  });
  // Cargar todos los restaurantes desde el nuevo endpoint
  fetch("https://tfg-zbc8.onrender.com/listarestaurantes")
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar los datos de restaurantes");
      return response.json();
    })
    .then(data => {
      window.restaurantsData = data;
      initMap(window.restaurantsData);
      
      // Cargar restaurantes lowcost para la sección específica
      fetch("https://tfg-zbc8.onrender.com/listalowcost")
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
  initOffers();
});

window.toggleUserDropdown = toggleUserDropdown;