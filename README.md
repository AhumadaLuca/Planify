# 🎟️ Eventos_App — Aplicación de Eventos Interactivos

Una aplicación web que permite visualizar eventos en un mapa interactivo, administrar organizadores y eventos mediante un sistema con CRUD completo, autenticación mediante JWT y un panel de administración para moderación.

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

---

## ⚙️ Funcionalidades principales

### 🌍 **Eventos**
- Visualización de eventos en un mapa dinámico (Leaflet.js)
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Validación de fechas de inicio/fin
- Gestión de precios (eventos gratuitos o pagos)
- OpenCage Data API (para búsqueda de direcciones y obtención de coordenadas).
- Modal de detalle para ver información extendida
- Opción de requerir verificación de edad
- Soporte para enlaces externos (venta de tickets, redes, etc.)
- **Filtrado avanzado (v0.4.1)**:
  - Filtrado por **categorías** (Música, Deporte, Teatro).
  - Filtrado por **precio máximo**.
  - Filtrado por **rango de fechas** (Fecha desde / Fecha hasta).
  - Botón **"Quitar filtros"** en el sidebar para restaurar la vista completa.
  - Filtrado realizado en frontend sobre un **cache local** (`eventosCache`) para respuestas rápidas sin recargar el backend.

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
  - Validar / invalidar eventos.
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

### Backend
- Controladores para organizadores, eventos y administrador.
- Servicios con lógica de negocio separada.
- Repositories para `Evento`, `Organizador` y `Categoria`.
- Filtros y configuración JWT.
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

---

## 📘 Registro de versiones (resumen)

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

## ▶️ Estado actual del proyecto
✔ En desarrollo activo  
✔ API funcional  
✔ CRUD completo de entidades principales  
✔ Autenticación y roles implementados  
⚠ Pendiente: refinado del flujo de validación por parte del admin  
⚠ Pendiente: revisar y optimizar el comportamiento responsive en dispositivos móviles y tablets.

---

## 📌 Futuras mejoras
- Buscador por nombre y filtros avanzados con autocompletado.
- Filtro por distancia (eventos cercanos a mi ubicación).
- Dashboard de estadísticas
- Mejoras en UI del panel administrador
- Tests unitarios y de integración

---

## 📄 Licencia
Proyecto académico — uso libre con fines educativos.