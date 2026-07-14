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
Markdown
# 🚀 Frontend Clean — Client Application

Este directorio contiene el cliente de la aplicación web, construido sobre la arquitectura de **Angular**. El proyecto utiliza herramientas modernas de formateo, estilos globales con Angular Material y un entorno optimizado para desarrollo y producción.

---

## 📂 Estructura del Proyecto

A continuación se detalla la distribución de archivos y directorios del frontend:

```text
frontend-clean/
├── .angular/                  # Caché local de compilación (Angular CLI)
│   └── cache/
├── .vscode/                   # Configuración recomendada para el espacio de trabajo en VS Code
│   ├── extensions.json        # Extensiones sugeridas para el equipo de desarrollo
│   ├── launch.json            # Configuraciones para depuración (Debug)
│   ├── mcp.json               # Configuración del servidor de contexto (IA)
│   └── tasks.json             # Tareas automatizadas de ejecución
├── public/                    # Archivos estáticos servidos directamente por el navegador
│   └── favicon.ico            # Icono del sitio web
├── src/                       # Código fuente principal del cliente
│   ├── app/                   # Componentes, servicios, módulos y lógica de negocio
│   ├── index.html             # Documento HTML principal (Single Page Application)
│   ├── main.ts                # Punto de entrada de inicialización de la app
│   ├── material-theme.scss    # Paletas, temas y configuración de Angular Material
│   └── styles.css             # Estilos CSS globales y reinicios básicos
├── .editorconfig              # Configuración de codificación para consistencia entre editores
├── .prettierrc                # Reglas automáticas de formateo de código con Prettier
├── angular.json               # Configuración global de Angular CLI (Builds, assets, estilos)
├── package-lock.json          # Árbol exacto de dependencias instaladas para consistencia
├── package.json               # Definición de dependencias y scripts de terminal
├── proxy.conf.json            # Redirección de llamadas a la API para evitar conflictos de CORS
├── tsconfig.app.json          # Configuración de compilación de TypeScript para la app
├── tsconfig.json              # Configuración base de TypeScript del proyecto
└── tsconfig.spec.json         # Configuración del entorno de pruebas unitarias (Karma/Jasmine)
🛠️ Requisitos del Entorno
Antes de comenzar, asegúrate de tener instalado el siguiente software en tu equipo:

Node.js: v20.x o superior (LTS recomendada).

Gestor de paquetes: npm (v10.x o superior).

Angular CLI (Opcional, pero recomendado): Instalar globalmente con:

Bash
npm install -g @angular/cli
⚙️ Guía de Inicio Rápido
Sigue estos pasos para clonar, configurar y ejecutar la aplicación de forma local:

1. Descargar las dependencias
Desde la raíz de la carpeta frontend-clean/, instala todos los módulos requeridos por el proyecto:

Bash
npm install
2. Levantar el Servidor de Desarrollo
Inicia el entorno interactivo de Angular CLI. El servidor se mantendrá a la escucha de cualquier cambio que realices en el código para recargar automáticamente la pestaña del navegador:

Bash
npm run start
💡 Nota: La aplicación se sirve por defecto en la dirección: http://localhost:4200/

3. Evitar Conflictos con la API (Proxy)
Para el desarrollo local, el proyecto está configurado para redirigir las peticiones al backend a través de proxy.conf.json. Si necesitas modificar la dirección base de tu servidor de APIs local, actualiza la propiedad target en dicho archivo.

🧪 Pruebas y Calidad de Código
Ejecutar pruebas unitarias (Specs):

Bash
npm run test
Formatear el código automáticamente:

Bash
npx prettier --write "src/**/*.{ts,html,css,scss}"
📦 Despliegue y Construcción (Producción)
Para compilar la aplicación optimizando el rendimiento, minimizando recursos y aplicando Tree Shaking, ejecuta:

Bash
npm run build
## 🐳 Ejecución con Docker

Para facilitar el despliegue y evitar problemas de configuración local, el proyecto está contenedorizado. Solo necesitas tener instalado Docker y ejecutar:

```bash
docker-compose up --build
