# ✨ PLANIFY — Aplicación de Eventos Interactivos
### v1.3.0 · Versión estable

Una aplicación web estable que permite visualizar eventos en un mapa interactivo, administrar organizadores y eventos mediante un sistema con CRUD completo, autenticación mediante JWT y un panel de administración para moderación.

---

## 🚀 Tecnologías utilizadas

### **Frontend**
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5
- Leaflet.js (Mapas interactivos)
- Fetch API para comunicación con el backend
- Módulos JS para UI (toasts, panel admin, modales, etc.)

### **Backend**
- Java Spring Boot (API REST)
- JPA / Hibernate
- MySQL
- Spring Security + JWT
- DTOs para Request/Response
- Jsoup (sanitización y prevención de XSS)
---

## ⚙️ Funcionalidades principales

### 🌍 **Eventos**
- Visualización de eventos en un mapa dinámico (Leaflet.js)
- Marcadores personalizados en el mapa según la categoría del evento:
  - Uso de pines SVG con colores diferenciados por tipo de evento.
  - Mejora visual que permite identificar rápidamente la naturaleza del evento directamente desde el mapa.
  - Categorías contempladas: Música, Deporte, Teatro, Artes & Cultura, Gastronomía, Festivales & Ferias, Educación, Familiar, Tecnología y Bienestar.
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Validación de fechas de inicio/fin
- Validación de coordenadas geográficas
- Sistema de estados de evento (PENDIENTE / ACEPTADO / RECHAZADO)
- Gestión de precios (eventos gratuitos o pagos)
- OpenCage Data API (búsqueda de direcciones y obtención de coordenadas)
- Modal de detalle para ver información extendida
- Sistema de redes sociales por evento con soporte para múltiples enlaces y tipos de red
- **Buscador de eventos** por título y ubicación con filtrado en tiempo real
- **Panel lateral de resultados** sincronizado con el mapa
- Sistema de verificación de edad no invasivo para eventos con restricción (+18):
  - Modal inicial al ingresar a la aplicación.
  - Persistencia de la decisión del usuario.
  - Ocultamiento automático de eventos no aptos según la edad.
  - Integración completa con mapa, buscador y filtros
- Filtrado avanzado:
  - Por categorías, precio máximo y rango de fechas
  - Botón *“Quitar filtros”* para restaurar la vista
  - Filtrado en frontend usando caché local (`eventosCache`)
-Geolocalización del usuario (GPS):
  -Centrado automático del mapa en la ubicación del usuario.
  -Botón GPS que permite activar el seguimiento de ubicación o recentrar el mapa.
  -Visualización del radio de precisión del GPS en el mapa.
  -Optimización de seguimiento mediante watchPosition.
  -Mejora visual del mapa en dispositivos móviles mediante detectRetina.

### 👤 **Organizadores**
- Registro y Login mediante JWT
- CRUD completo para organizadores
- Validación desde un administrador
- Vista de “Mi perfil” (consumo de `GET /api/organizadores/ver/{id}`).
- Soporte para foto de perfil y verificación.

### 🛡️ **Administración**
- **AdminInitializer** que crea un usuario administrador por defecto
- Panel de administración (UI) con:
  - Lista de organizadores y sus eventos.
  - Verificar / desverificar organizadores.
  - Moderación de eventos mediante estados (PENDIENTE / ACEPTADO / RECHAZADO).
  - Flujo completo de moderación administrativa con estados de evento.
  - Eliminar organizadores (eliminación en cascada de sus eventos).
- Modal genérico para confirmar acciones y modal genérico para detalles.

---

## 🧱 Arquitectura principal

### DTOs implementados
- `RegistroOrganizadorDTO` (Request/Response)
- `LoginOrganizadorDTO` (Request/Response)
- `EventoDTO` (Request/Response)
- `EventoAdminDTO`
- `OrganizadorAdminDTO`
- `RedSocialLinkDTO`

### Backend
- Controladores para organizadores, eventos y administrador.
- Servicios con separación de responsabilidades:
  - Validación
  - Sanitización (Jsoup)
  - Persistencia
- Uso consistente de DTOs para evitar exponer entidades JPA
- Repositories para `Evento`, `Organizador` y `Categoria` y `RedSocialLink`.
- Filtros y configuración JWT.
- Handler global de excepciones para manejo centralizado de errores
- Prevención de SQL Injection mediante JPA/Hibernate
- Prevención de XSS mediante sanitización de datos
- Endpoints destacados:
  - `GET /api/eventos` — listar eventos públicos.
  - `GET /api/eventos/{id}` — detalle de evento.
  - `POST /api/eventos/guardar` — crear evento.
  - `PUT /api/eventos/editar/{id}` — editar evento.
  - `DELETE /api/eventos/eliminar/{id}` — eliminar evento.
  - `GET /api/organizadores/ver/{id}` — ver perfil organizador.
  - `GET /api/admin/organizadoresYeventos` — organizadores con sus eventos (panel admin).

### Frontend
- JS modularizado (UI, toasts, panel admin)
- Modales HTML para manejo de GET, acciones y roles
- Integración completa con endpoints del backend
-Sistema de caché en frontend para reducir llamadas innecesarias al backend
- Manejo mejorado de errores provenientes del backend en `fetch`
- Corrección de validaciones dinámicas en formularios

---

## 📘 Registro de versiones (resumen)

- **v1.3.0 — 2026-03-26**
  - 🔐 Seguridad:
    - Sanitización con Jsoup (prevención XSS)
    - Validación de coordenadas geográficas
    - Protección contra SQL Injection mediante JPA/Hibernate
  
  - ⚙️ Backend:
    - Separación de responsabilidades en servicios (validación, sanitización, persistencia)
    - Uso consistente de DTOs y soporte para multipart (`@RequestPart` + `@Valid`)
  
  - 🧱 Refactor:
    - Manejo centralizado de errores con handler global
    - Sanitización aplicada en el mapeo DTO → Entity
    - Reorganización y centralización de lógica en servicios
  
  - 🐛 Fixes:
    - Mejora en manejo de errores en `fetch`
    - Correcciones en formularios dinámicos y Bootstrap
    - Fix de fechas (`LocalTime`) y datos en panel admin
    - Corrección de filtros, duplicación en mapa y renderizado
    - Prevención de serialización infinita (DTOs)
    - Gestión correcta de tokens de recuperación

- **v1.2.0 — 2026-03-10**
  -Integración de geolocalización (GPS) para centrar el mapa en la ubicación del usuario.
  -Botón GPS con activación de seguimiento y recentrado manual.
  -Mejora visual del mapa para pantallas móviles (detectRetina).
  -Implementación de caché con TTL para /api/eventos reduciendo llamadas al backend.
  -Refactor en backend para utilizar EventoResponseDTO en lugar de entidades JPA.
  -Optimización de consultas Hibernate eliminando el problema N+1.
  -Mejora del manejo de eventos dinámicos mediante delegación de eventos en frontend.
  -Ajustes iniciales de diseño responsive para dispositivos móviles.
  -Correcciones en carga de perfil del organizador y reapertura del panel administrador.

- **v1.1.1 — 2026-02-01**
  - Ajustes y reorganizaciones visuales y ampliación en los paneles de organizador y administrador para una mejor distribución de contenido en tablas.

- **v1.1.0 — 2026-01-31**
  - Añadidas nuevas categorías de eventos para ampliar la cobertura de tipos de actividades.
  - Implementación de marcadores personalizados en el mapa con colores diferenciados según la categoría del evento.
  - Mejora de la experiencia visual y de identificación rápida de eventos en el mapa.

- **v1.0.0 — 2026-01-28**
  - Lanzamiento de la primera versión estable del sistema.
  - Implementación del sistema de estados de evento (PENDIENTE / ACEPTADO / RECHAZADO), reemplazando la validación booleana previa.
  - Nuevo flujo de moderación administrativa con endpoint unificado para aceptar o rechazar eventos.
  - Actualización de la base de datos para soportar el nuevo modelo de estados de evento.
  - Incorporación de un sistema de verificación de edad no invasivo para eventos con restricción (+18).
  - Integración completa de la verificación de edad en mapa, buscador y filtros, garantizando coherencia en toda la aplicación.
  - Correcciones de sincronización de caché (`eventosCache`) y recarga de vistas tras acciones administrativas.

- **v0.7.0 — 2026-01-20**
  - Añadido: Sistema de redes sociales por evento con soporte para múltiples enlaces y tipos de red.
  - Mejorado: Formulario de eventos con gestión dinámica, validación y carga de redes sociales en edición.
  - Mejorado: Visualización de redes sociales en el detalle de evento, mapa y panel del organizador.
  - Añadido: Buscador de eventos activo con filtrado en tiempo real y panel lateral de resultados.
  - Mejorado: Optimización del sistema de caché de eventos y refactorización de la lógica frontend asociada.

- **v0.6.0 — 2026-01-13**
  - Añadido: Sistema de **redes sociales por evento**, permitiendo asociar múltiples enlaces a cada evento mediante una entidad dedicada en el backend.
  - Añadido: Enumeración de tipo de red social (Facebook, Instagram, YouTube, Twitter/X, TikTok, WhatsApp, sitio web u otros) para una correcta clasificación y visualización.
  - Mejorado: Formulario de creación y edición de eventos con inputs dinámicos para agregar y eliminar redes sociales, validación de URLs, normalización automática de enlaces y detección del tipo de red según el dominio ingresado.
  - Mejorado: Visualización de redes sociales en la vista de detalle del evento, en el mapa interactivo y en el panel del organizador, utilizando iconografía consistente (Tabler Icons).
  - Mejorado: Refactorización de la lógica de enlaces sociales en el frontend mediante helpers reutilizables para detección, validación y renderizado.
  - Corregido: Problema de serialización JSON al cargar eventos con redes sociales asociadas, evitando ciclos infinitos entre entidades y restableciendo la correcta carga del mapa y las vistas públicas.

- **v0.5.0 — 2026-01-08**
  - Mejorado: Rediseño visual del modal de detalle de eventos e incorporación de iconografía para mejorar la legibilidad.
  - Añadido: Botón de acción "Comprar entradas" con manejo de disponibilidad desde enlace externo.
  - Mejorado: Incorporación de identidad visual propia (logo SVG y favicon) y reorganización de recursos gráficos.
  - Mejorado: Actualización visual del menú con iconos más representativos y micro-animaciones.
  - Corregido: Sincronización del estado de edición en eventos y funcionamiento del botón mostrar/ocultar contraseña en login.

- **v0.4.1 — 2025-12-09**
  - Añadido: Sistema de filtros en el mapa (categorías, precio, rango de fechas), cache local `eventosCache`, botón "Quitar filtros".
  - Corregido: Fondo negro persistente al cerrar modal de detalle (backdrop duplicado) y validación de imagen al crear eventos (manejo correcto cuando no se sube imagen).
  - Mejorado: Visualización de categoría en popups y detalle (emoji por categoría).

- **v0.4.0 — 2025-11-26**
  - Mejoras masivas en UX, modal genérico de confirmación y detalle, limpieza automática de formularios, corrección en mapa, mejoras en flujo de registro/login, manejo de imágenes, panel admin agrupado por organizadores y eventos, fixes de JWT persistido, fecha/hora, precio vacío, categorías, dirección, backdrops, botones dinámicos, etc.

- **v0.3.0 — 2025-11-17**
  - DTOs, CRUD completo de organizadores y eventos, JWT, panel admin, initializer, repositorios y modularización del frontend.

- **v0.2.0 — 2025-10-22**
  - CREATE y READ de eventos, visualización en el mapa con Leaflet.js.

- **v0.1.0 — 2025-10-15**
  - Protótipo inicial, configuración base de backend, estructura inicial de frontend, vista preliminar.

---
> Para el detalle completo de cambios por versión, consultar el archivo CHANGELOG.md.
---

## 📄 Licencia
Proyecto académico — uso libre con fines educativos.