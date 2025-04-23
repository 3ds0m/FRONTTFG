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
  
  // Cargar traducciones
  await cargarTraducciones();
  
  // Cargar recetas iniciales
  mostrarRecetas('egg');
});