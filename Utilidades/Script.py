import requests
base_url = "https://api.content.tripadvisor.com/api/v1/location/search"
api_key = ""
categories = ["casera", "cocteleria", "bar", "restaurante", "chocolateria","kebab"]
# Límites aproximados de Madrid
lat_start, lat_end = 40.35, 40.50
lon_start, lon_end = -3.80, -3.60
# Paso de ~1.5 km
lat_step = 0.0135
lon_step = 0.0180
# Generar todas las combinaciones
urls = []
current_lat = lat_start
while current_lat <= lat_end:
    current_lon = lon_start
    while current_lon <= lon_end:
        for category in categories:
            url = (
                f"{base_url}?key={api_key}"
                f"&searchQuery={category}"
                f"&category=restaurant"
                f"&latLong={current_lat},{current_lon}"
                f"&radius=1"  # Ahora 1 km en lugar de 3 km
                f"&radiusUnit=km"
                f"&language=es"
            )
            urls.append(url)
        current_lon += lon_step
    current_lat += lat_step

# Guardar en un archivo (opcional)
with open("tripadvisor_urls.txt", "w") as f:
    for url in urls:
        f.write(url + "\n")
<<<<<<< HEAD
print(f"Total URLs generadas: {len(urls)}")
=======

print(f"Total URLs generadas: {len(urls)}")
>>>>>>> c4e4b13fefac63c2f71e96f5e938b34c927bf40c
