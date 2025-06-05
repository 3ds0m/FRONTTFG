# Despliegue en Vercel

Subí y desplegué mi proyecto web (HTML, CSS, JS y Bootstrap) en la plataforma [Vercel](https://vercel.com), ya que se trata de una aplicación completamente estática que realiza llamadas a APIs externas desde el navegador, sin necesidad de backend ni variables de entorno.

## Estructura del Proyecto

El proyecto contiene múltiples archivos HTML (como `index.html`, `Login.html`, `Favoritos.html`, etc.), junto con carpetas para estilos (`/CSS`), scripts (`/Scripts`) e imágenes (`/img`). Toda la lógica dinámica se encuentra en archivos JS que consumen APIs externas mediante `fetch()`.

##  Pasos del Despliegue

1. Subí el proyecto al repositorio:  
    [https://github.com/3ds0m/FRONTTFG](https://github.com/3ds0m/FRONTTFG)

2. Ingresé a [vercel.com](https://vercel.com) e inicié sesión.

3. Hice clic en **"Add New Project"** y seleccioné mi repositorio.

4. En la configuración:
   - Elegí el preset **Other**.
   - Dejé la carpeta raíz como `./`.
   - No configuré comando de build ni salida, ya que es contenido estático.

5. Hice clic en **Deploy**.

## Resultado

Vercel generó una URL pública con el sitio desplegado. Cada cambio que subo a GitHub actualiza automáticamente el contenido en producción.

