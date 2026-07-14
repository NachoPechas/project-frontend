# 📚 EncartaUnal - Frontend

Este repositorio contiene la interfaz de usuario de **EncartaUnal**, el sistema de gestión virtual para la biblioteca del edificio **CYT (Ciencia y Tecnología)** de la Universidad Nacional de Colombia.

La aplicación permite a la comunidad académica reservar puestos de estudio por franjas horarias en tiempo real, conocer las características de cada puesto y gestionar el préstamo de libros.

---

## ✨ Características Principales

*   **Puestos en tiempo real:** Mapa interactivo para ver qué puestos del CYT están libres u ocupados al instante.
*   **Detalle de puestos:** Información sobre enchufes, tipo de mesa, ventilación, etc.
*   **Reservas por franja horaria:** Bloqueo de espacios de estudio según tu horario.
*   **Préstamo de libros:** Consulta de catálogo y reservas desde la plataforma.

---

## 🛠️ Stack Tecnológico

*   **Framework:** Angular
*   **Diseño:** HTML5 y CSS3
*   **Consumo de API:** Angular `HttpClient` (RxJS)
*   **Despliegue y Entorno:** Docker

---

## 🐳 Ejecución con Docker

Para facilitar el despliegue y evitar problemas de configuración local, el proyecto está contenedorizado. Solo necesitas tener instalado Docker y ejecutar:

```bash
docker-compose up --build
