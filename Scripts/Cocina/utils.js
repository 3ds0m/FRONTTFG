// Function to generate star rating HTML
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

// Function to display price level
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

// Function to shuffle array (Fisher-Yates shuffle)
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Function to display an error message
export function showError(message) {
  const errorContainer = document.createElement("div")
  errorContainer.classList.add("alert", "alert-danger")
  errorContainer.textContent = message

  const mainContent = document.querySelector("main") || document.body
  mainContent.prepend(errorContainer)

  // Remove the error message after 5 seconds
  setTimeout(() => {
    errorContainer.remove()
  }, 5000)
}
