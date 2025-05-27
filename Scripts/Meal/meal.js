// Variables globales
let traducciones = {};
let recetasData = [];

// Cargar el archivo de traducciones
async function cargarTraducciones() {
  try {
    const response = await fetch('Ingredients.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de traducciones');
    }
    traducciones = await response.json();
    return traducciones;
  } catch (error) {
    console.error('Error al cargar traducciones:', error);
    return {};
  }
}

// Función para traducir un ingrediente
function traducirIngrediente(ingrediente) {
  const ingredienteLower = ingrediente.toLowerCase().trim();
  return traducciones[ingredienteLower] || ingrediente;
}

const PRECIOS_ESTIMADOS = {
  egg: 0.3, potato: 0.4, rice: 0.5, pasta: 0.5,
  bread: 0.4, onion: 0.3, cheese: 0.7, tomato: 0.5,
  carrot: 0.3, cabbage: 0.4, lentils: 0.6, beans: 0.6
};

function estimarPrecioIngrediente(nombre) {
  const base = nombre.toLowerCase().trim();
  return PRECIOS_ESTIMADOS[base] || 0.8;
}

async function obtenerDetallesReceta(id) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error("Error al obtener detalles de la receta:", error);
    return null;
  }
}

async function obtenerRecetasPorIngrediente(ingrediente) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingrediente}`);
    const data = await res.json();
    return data.meals || [];
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    return [];
  }
}

// Función para crear modales de recetas
function crearModalesRecetas(recetas) {
  const container = document.querySelector(".modal-container") || document.body;
  
  // Eliminar modales anteriores
  document.querySelectorAll('.modal-recipe').forEach(el => el.remove());
  
  // Crear modales para cada receta
  recetas.forEach(async (receta, index) => {
    const detalleReceta = await obtenerDetallesReceta(receta.idMeal);
    if (!detalleReceta) return;
    
    const listaIngredientes = [];
    
    for (let i = 1; i <= 20; i++) {
      const ing = detalleReceta[`strIngredient${i}`];
      const cant = detalleReceta[`strMeasure${i}`];
      if (ing && ing.trim()) {
        const ingredienteTraducido = traducirIngrediente(ing);
        const precio = estimarPrecioIngrediente(ing).toFixed(2);
        listaIngredientes.push({
          nombre: ingredienteTraducido,
          cantidad: cant.trim() || "cantidad no especificada",
          precio: precio
        });
      }
    }
    
    const precioTotal = listaIngredientes.reduce((acc, ing) => acc + parseFloat(ing.precio), 0).toFixed(2);
    
    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="modal fade modal-recipe" id="recipeModal-${index}" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header" style="background: var(--gradient-1); color: white;">
              <h5 class="modal-title">${detalleReceta.strMeal}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
              <div class="modal-recipe-details">
                <div class="modal-recipe-img-container">
                  <div class="modal-recipe-img">
                    <img src="${detalleReceta.strMealThumb}" alt="${detalleReceta.strMeal}">
                  </div>
                </div>
                <div class="modal-recipe-content">
                  <h5><i class="fas fa-utensils me-2"></i>Ingredientes</h5>
                  <ul class="ingredientes-list mt-3">
                    ${listaIngredientes.map(ing => `
                      <li>
                        <span>${ing.nombre} (${ing.cantidad})</span>
                        <span><strong>${ing.precio} €</strong></span>
                      </li>
                    `).join('')}
                  </ul>
                  <div class="precio-total-modal">
                    <i class="fas fa-euro-sign me-1"></i> Precio total estimado: <strong>${precioTotal} €</strong>
                  </div>
                  <p class="mt-2 mb-0"><small class="text-muted">*Precios estimados por ingrediente</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
    );
  });
}

// Función para abrir el modal de una receta
function abrirModalReceta(index) {
  const modalElement = document.getElementById(`recipeModal-${index}`);
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}

async function mostrarRecetas(ingrediente) {
  const contenedor = document.getElementById('recetasContainer');
  contenedor.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
  
  try {
    const recetas = await obtenerRecetasPorIngrediente(ingrediente);
    
    if (recetas.length === 0) {
      contenedor.innerHTML = '<div class="col-12"><div class="alert alert-info">No se encontraron recetas con este ingrediente. Prueba con otro.</div></div>';
      return;
    }
    
    contenedor.innerHTML = '';
    
    // Guardar las recetas en la variable global
    recetasData = recetas.slice(0, 6);

    // Crear los modales para las recetas
    crearModalesRecetas(recetasData);

    // Mostrar las tarjetas de recetas
    recetasData.forEach((receta, index) => {
      const tarjeta = `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card meal-card h-100">
            <img src="${receta.strMealThumb}" class="card-img-top" alt="${receta.strMeal}" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${receta.strMeal}</h5>
              <button class="ver-ingredientes mt-auto" onclick="abrirModalReceta(${index})">
                <i class="fas fa-list-ul me-1"></i> Ver ingredientes
              </button>
            </div>
          </div>
        </div>
      `;
      contenedor.innerHTML += tarjeta;
    });
  } catch (error) {
    console.error("Error:", error);
    contenedor.innerHTML = '<div class="col-12"><div class="alert alert-danger">Hubo un error al cargar las recetas. Por favor, intenta más tarde.</div></div>';
  }
}

document.getElementById('ingredienteSelect').addEventListener('change', (e) => {
  const ingrediente = e.target.value;
  mostrarRecetas(ingrediente);
});

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Hacer accesible la función abrirModalReceta desde HTML
  window.abrirModalReceta = abrirModalReceta;
  document.addEventListener("userReady", () => {
    initUserMenu();
  });
  // Cargar traducciones
  await cargarTraducciones();
  
  // Cargar recetas iniciales
  mostrarRecetas('egg');
});


// Variables globales para almacenar datos y estado
let currentCuisineRestaurants = []
let allRestaurantsData = []
let userFavorites = []

// Función para inicializar el menú de usuario
function initUserMenu() {
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
    loadUserFavorites();
  } else {
    // Usuario no logueado - mostrar botón de login
    userMenuContainer.innerHTML = `
      <a href="login.html" class="login-btn">
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

// Función para cargar favoritos del usuario - CORREGIDA
async function loadUserFavorites() {
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

// Función para actualizar botones de favoritos
function updateFavoriteButtons() {
  document.querySelectorAll('.favorite-btn, .favorite-btn-modal').forEach(btn => {
    const locationId = btn.dataset.locationId;
    if (userFavorites.includes(locationId)) {
      btn.classList.add('active');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'fas fa-heart';
      btn.title = 'Eliminar de favoritos';
    } else {
      btn.classList.remove('active');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'far fa-heart';
      btn.title = 'Agregar a favoritos';
    }
  });
}

// Función para toggle del dropdown de usuario
function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(event) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('user-dropdown');
  
  if (dropdown && userMenu && !userMenu.contains(event.target)) {
    dropdown.classList.remove('show');
  }
});
// Función para manejar el click en favoritos - MEJORADA PARA MANEJAR Z-INDEX
async function handleFavoriteClick(event, locationId, restaurantName) {
  event.stopPropagation();
  event.preventDefault();
  
  const button = event.currentTarget;
  const icon = button.querySelector('i');
  
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
      window.location.href = 'login.html';
    };
    return;
  }

  // Cambiar estado visual inmediatamente
  button.disabled = true;
  icon.className = 'fas fa-spinner fa-spin';

  try {
    const isFavorite = userFavorites.includes(locationId);
    
    let success;
    if (isFavorite) {
      // Eliminar de favoritos
      success = await premiumManager.removeFavoriteFromPage(locationId, restaurantName);
    } else {
      // Agregar a favoritos
      success = await premiumManager.addFavoriteFromPage(locationId, restaurantName);
    }
    
    if (success) {
      if (isFavorite) {
        userFavorites = userFavorites.filter(id => id !== locationId);
        button.classList.remove('active');
        icon.className = 'far fa-heart';
        button.title = 'Agregar a favoritos';
      } else {
        userFavorites.push(locationId);
        button.classList.add('active');
        icon.className = 'fas fa-heart';
        button.title = 'Eliminar de favoritos';
      }
      
      // Actualizar todos los botones de favoritos para este restaurante
      updateFavoriteButtonsForRestaurant(locationId, !isFavorite);
    } else {
      icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    }
  } catch (error) {
    icon.className = 'far fa-heart';
    console.error('Error handling favorite:', error);
  } finally {
    button.disabled = false;
  }
}

// Función para actualizar botones de favoritos de un restaurante específico
function updateFavoriteButtonsForRestaurant(locationId, isFavorite) {
  document.querySelectorAll(`[data-location-id="${locationId}"]`).forEach(btn => {
    const icon = btn.querySelector('i');
    if (isFavorite) {
      btn.classList.add('active');
      if (icon) icon.className = 'fas fa-heart';
      btn.title = 'Eliminar de favoritos';
    } else {
      btn.classList.remove('active');
      if (icon) icon.className = 'far fa-heart';
      btn.title = 'Agregar a favoritos';
    }
  });
}
window.toggleUserDropdown = toggleUserDropdown;
window.premiumManager = premiumManager;