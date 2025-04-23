import { generateRatingStars, displayPriceLevel, showError } from "./utils.js"
//import * as bootstrap from "bootstrap"

// Variables globales para almacenar datos y estado
let currentCuisineRestaurants = []
let allRestaurantsData = []

// Función para cargar los datos de restaurantes desde un archivo JSON
async function loadRestaurantsData() {
  try {
    const response = await fetch("../restaurantes.json")

    if (!response.ok) {
      throw new Error("Error al cargar el archivo JSON")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al obtener datos de restaurantes:", error)
    showError("No se pudieron cargar los datos de restaurantes. Por favor, intenta más tarde.")
    return []
  }
}

// Función para generar la lista de tipos de cocina
function generateCuisineList(restaurantsData) {
  const cuisineListContainer = document.getElementById("cuisine-list")
  if (!cuisineListContainer) return

  cuisineListContainer.innerHTML = ""

  // Crear un Set para obtener tipos de cocina únicos
  const allCuisines = new Set()
  restaurantsData.forEach((restaurant) => {
    if (restaurant.cuisine_types) {
      const cuisines = restaurant.cuisine_types.split(", ").map((cuisine) => cuisine.trim())
      cuisines.forEach((cuisine) => {
        if (cuisine) allCuisines.add(cuisine)
      })
    }
  })

  // Convertir a array y ordenar alfabéticamente
  const sortedCuisines = Array.from(allCuisines).sort()

  // Crear un botón para cada tipo de cocina
  sortedCuisines.forEach((cuisine) => {
    const cuisineButton = document.createElement("button")
    cuisineButton.classList.add("cuisine-tag")
    cuisineButton.innerText = cuisine
    cuisineButton.addEventListener("click", () => showRestaurantsByCuisine(cuisine, restaurantsData))
    cuisineListContainer.appendChild(cuisineButton)
  })

  // Verificar si hay un parámetro de cocina en la URL
  const urlParams = new URLSearchParams(window.location.search)
  const cuisineParam = urlParams.get("cuisine")

  // Si hay un parámetro de cocina, mostrar los restaurantes de esa cocina
  if (cuisineParam && sortedCuisines.includes(cuisineParam)) {
    // Encontrar el botón correspondiente y simular un clic
    const buttons = cuisineListContainer.querySelectorAll(".cuisine-tag")
    buttons.forEach((button) => {
      if (button.innerText === cuisineParam) {
        button.click()
      }
    })
  }
}

// Modificar la función para mostrar restaurantes por cocina
function showRestaurantsByCuisine(cuisine, restaurantsData) {
  // Resaltar el botón seleccionado
  document.querySelectorAll(".cuisine-tag").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.innerText === cuisine) {
      btn.classList.add("active")
    }
  })

  // Filtramos los restaurantes que contienen el tipo de cocina seleccionado
  const filteredRestaurants = restaurantsData.filter((restaurant) => {
    return (
      restaurant.cuisine_types &&
      restaurant.cuisine_types
        .split(", ")
        .map((c) => c.trim())
        .includes(cuisine)
    )
  })

  // Guardamos los restaurantes filtrados en la variable global
  currentCuisineRestaurants = filteredRestaurants

  // Obtenemos el contenedor donde se mostrarán los restaurantes filtrados
  const restaurantListContainer = document.getElementById("restaurant-list")
  if (!restaurantListContainer) return

  restaurantListContainer.innerHTML = "" // Limpiamos el contenedor

  // Si no hay restaurantes de ese tipo de cocina, mostramos un mensaje
  if (filteredRestaurants.length === 0) {
    restaurantListContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">No hay restaurantes de cocina ${cuisine} disponibles.</div>
      </div>`
    return
  }

  // Desplazarse suavemente a la sección de restaurantes
  document.getElementById("cocinas").scrollIntoView({ behavior: "smooth" })

  // Creamos una tarjeta por cada restaurante filtrado
  filteredRestaurants.forEach((restaurant, index) => {
    const restaurantCol = document.createElement("div")
    restaurantCol.classList.add("col-md-6", "col-lg-4", "mb-4")

    restaurantCol.innerHTML = `
      <div class="restaurant-card-wrapper">
        <div class="restaurant-card">
          <div class="restaurant-card-img">
            <img src="${restaurant.image || "../img/default-restaurant.jpg"}" 
                 alt="${restaurant.name}" 
                 onerror="this.src='../img/default-restaurant.jpg'">
          </div>
          <div class="restaurant-card-content">
            <div>
              <h5 class="restaurant-card-title">${restaurant.name}</h5>
              <div class="rating-stars mb-2">
                ${generateRatingStars(restaurant.rating)}
                <span class="ms-1">${restaurant.rating || "N/A"}</span>
              </div>
              <p class="mb-2">${displayPriceLevel(restaurant.price_level)}</p>
            </div>
            <button class="view-details-btn" onclick="openRestaurantModal(${index}, 'cuisine')">
              <i class="fas fa-info-circle"></i> Ver detalles
            </button>
          </div>
        </div>
      </div>
    `

    restaurantListContainer.appendChild(restaurantCol)
  })

  // Crear modales para los restaurantes
  createRestaurantModals(filteredRestaurants, "cuisine")
}

// Función para crear modales para cada restaurante
function createRestaurantModals(restaurants, type) {
  const container = document.querySelector(".modal-container") || document.body

  // Eliminar modales anteriores
  document.querySelectorAll(`.modal-${type}`).forEach((el) => el.remove())

  // Crear modales para cada restaurante
  restaurants.forEach((restaurant, index) => {
    const cuisineTags = (restaurant.cuisine_types?.split(", ") || [])
      .map((c) => `<span class="cuisine-tag" onclick="navigateToCuisine('${c}')">${c}</span>`)
      .join("")

    const address =
      restaurant.address_obj?.address_string || restaurant.address_obj?.street1 || "Dirección no disponible"

    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="modal fade modal-${type}" id="restaurantModal-${type}-${index}" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${restaurant.name}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
              <div class="modal-restaurant-details">
                <div class="modal-restaurant-img-container">
                  <div class="modal-restaurant-img">
                    <img src="${restaurant.image || "../img/default-restaurant.jpg"}" alt="${restaurant.name}" onerror="this.src='../img/default-restaurant.jpg'">
                  </div>
                </div>
                <div class="modal-restaurant-content">
                  <div class="rating-stars mb-3">${generateRatingStars(restaurant.rating)}<span class="ms-2">${restaurant.rating || "N/A"}</span></div>
                  <p class="mb-2">${displayPriceLevel(restaurant.price_level)}</p>
                  <p><strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong></p>
                  <p>${address}</p>
                  ${cuisineTags ? `<p><strong><i class="fas fa-utensils"></i> Cocina:</strong></p><div class="cuisine-tags mb-3">${cuisineTags}</div>` : ""}
                  <a href="https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}+${encodeURIComponent(address)}" target="_blank" class="btn btn-outline-primary">
                    <i class="fas fa-map-marker-alt"></i> Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    )
  })
}

// Función para abrir el modal de un restaurante
function openRestaurantModal(index, type) {
  const modalElement = document.getElementById(`restaurantModal-${type}-${index}`)
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement)
    modal.show()
  }
}

// Función para navegar a un tipo de cocina
function navigateToCuisine(cuisine) {
  // 1. Cerrar el modal actual (modal de detalles)
  const modalElement = document.querySelector(".modal.show")
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement)
    modal.hide() // Cerrar el modal
  }

  // 2. Redirigir a la página con el parámetro de cocina
  const url = new URL(window.location.href)
  url.searchParams.set("cuisine", cuisine) // Agregar el tipo de cocina como parámetro en la URL
  window.location.href = url.toString() // Redirigir a la nueva URL
}

// Modificar la función para inicializar la página
document.addEventListener("DOMContentLoaded", async () => {
  // Configurar funciones globales para que sean accesibles desde HTML
  window.openRestaurantModal = openRestaurantModal
  window.navigateToCuisine = navigateToCuisine

  // Cargar datos de restaurantes
  const restaurantsData = await loadRestaurantsData()

  if (restaurantsData.length > 0) {
    allRestaurantsData = restaurantsData
    generateCuisineList(restaurantsData)

    // Verificar si hay un parámetro de cocina en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const cuisineParam = urlParams.get("cuisine")

    if (cuisineParam) {
      // Buscar el tipo de cocina en los datos
      const cuisineExists = restaurantsData.some(
        (restaurant) =>
          restaurant.cuisine_types &&
          restaurant.cuisine_types
            .split(", ")
            .map((c) => c.trim())
            .includes(cuisineParam),
      )

      if (cuisineExists) {
        // Mostrar directamente los restaurantes de esa cocina
        showRestaurantsByCuisine(cuisineParam, restaurantsData)

        // También seleccionar el botón correspondiente
        setTimeout(() => {
          const buttons = document.querySelectorAll(".cuisine-tag")
          buttons.forEach((button) => {
            if (button.innerText === cuisineParam) {
              button.classList.add("active")
            }
          })
        }, 100)
      } else {
        // Si el tipo de cocina no existe, mostrar mensaje de bienvenida
        showWelcomeMessage(restaurantsData.length)
      }
    } else {
      // Si no hay parámetro de cocina, mostrar mensaje de bienvenida
      showWelcomeMessage(restaurantsData.length)
    }
  } else {
    showError("No se encontraron restaurantes en la base de datos")
  }
})

// Función para mostrar mensaje de bienvenida
function showWelcomeMessage(restaurantCount) {
  const restaurantListContainer = document.getElementById("restaurant-list")
  if (restaurantListContainer) {
    restaurantListContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3>Selecciona un tipo de cocina para ver los restaurantes disponibles</h3>
        <p>Tenemos ${restaurantCount} restaurantes en nuestra base de datos</p>
      </div>
    `
  }
}
