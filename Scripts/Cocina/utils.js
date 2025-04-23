// Funcion para generar el HTML de la calificación con estrellas
export function generateRatingStars(rating) {
  const starCount = Math.round(rating)
  let stars = ""
  for (let i = 0; i < 5; i++) {
    if (i < starCount) {
      stars += '<i class="fas fa-star"></i>'
    } else {
      stars += '<i class="far fa-star"></i>'
    }
  }
  return stars
}

// Funcion para mostrar el rango de precio
export function displayPriceLevel(level) {
  // Si el nivel de precio es N/A, mostrar "Sorpresa"
  if (level === "N/A") {
    return `<span class="price-level" style="background: var(--primary);">Sorpresa</span>`
  }

  const ranges = {
    $: "5-15€",
    $$: "15-30€",
    $$$: "30-50€",
    $$$$: "50€+",
    "$ - $$": "15-30€",
    "$$ - $$$": "30-50€",
  }
  return level
    ? `<span class="price-level">${level}</span> <small>(${ranges[level] || ""})</small>`
    : '<span class="text-muted">Precio no disponible</span>'
}

// Funcion para mezclar un array (Fisher-Yates shuffle)
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Funcion para mostrar un mensaje de error
export function showError(message) {
  const errorContainer = document.createElement("div")
  errorContainer.classList.add("alert", "alert-danger")
  errorContainer.textContent = message

  const mainContent = document.querySelector("main") || document.body
  mainContent.prepend(errorContainer)

  // Remueve el mensaje de error después de 5 segundos
  setTimeout(() => {
    errorContainer.remove()
  }, 5000)
}
