# Changelog
Todos los cambios notables de este proyecto se documentan en este archivo.

---

## [v0.5.0] - 2026-01-08

### Añadido
- Rediseño visual del modal de detalle de eventos: imagen en la cabecera y contenido con jerarquía visual.
- Iconografía en el detalle de eventos usando Tabler Icons para fecha, ubicación, precio, organizador, validación, etc.
- Botón de acción "Comprar entradas" que abre el enlace de venta en nueva pestaña; si no hay enlace, se muestra un botón deshabilitado.
- Identidad visual con logo SVG propio mostrado junto al nombre "Planify" (header/título).
- Favicon configurado usando el SVG del logo desde `assets/icons`.
- Estructura estándar para recursos gráficos en `assets/icons` (preparación para variantes PNG/tamaños).
- Preparación de sección de redes sociales del organizador (estructura lista, oculta hasta la implementación).

### Mejorado
- Tamaño y color de iconos del modal aumentados para mejor contraste y jerarquía visual.
- Actualización visual del menú y micro-animaciones CSS en los iconos al pasar el cursor.

### Corregido
- Sincronización del estado de edición en el formulario de eventos: `esEdicion` evaluado en tiempo de ejecución para permitir conservar la imagen existente si no se selecciona una nueva.
- Funcionamiento del botón mostrar/ocultar contraseña: agregado `data-password` al input y corrección del script de alternancia.

---

## [v0.4.1] - 2025-12-09

### Añadido
- Filtrado de eventos en el mapa:
  - Implementación de filtros por **categorías**, **precio máximo** y **rango de fechas** desde el modal de filtros.
  - Caché local en memoria (`eventosCache`) para evitar llamadas innecesarias al backend y permitir una experiencia de filtrado instantánea.
  - Botón "Quitar filtros" en el sidebar para restaurar rápidamente la vista completa del mapa.

### Mejorado
- Lógica de carga y dibujo de eventos separada en `cargarEventos()` / `dibujarEventosEnMapa()` / `filtrarEventos()` para facilitar mantenimiento y testing.

### Corregido
- Fondo negro persistente al cerrar el modal de detalle:
  - Se eliminó la apertura doble del modal (se quitó la llamada redundante que mostraba el modal por segunda vez), evitando backdrops duplicados que bloqueaban la interacción.
- Visualización de categoría en popups y detalle:
  - Se añadió mapeo de iconos por categoría (emoji) y se muestra el icono junto al nombre en el popup del mapa y en la vista "Ver más".
- Validación de imagen al crear eventos:
  - Se añadió el flujo `else` cuando no se sube imagen, de modo que se muestre el mensaje de validación correcto y se evite que aparezca un error inesperado.

---

## [v0.4.0] - 2025-11-26

### Añadido
- Modal genérico de confirmación reutilizable:
  - Reemplaza los distintos `confirm()` y modales individuales por uno configurable (título, mensaje, estilo y texto del botón).
- Modal genérico para visualizar detalles:
  - Sustituye a los modales individuales de “Detalle del Evento” y “Detalle del Organizador”, recibiendo título, cuerpo y botones dinámicos.
- Ruta y módulo para ver perfil de organizador:
  - Nueva ruta `GET /api/organizadores/ver/{id}` y módulo frontend dedicado para cargar y mostrar el perfil del organizador.
- Función genérica `limpiarFormularioGenerico()`:
  - Utilizada por formularios (eventos, organizadores) para resetear inputs, títulos, botones y errores.

### Mejorado
- UX de registro/login del organizador:
  - Tras el registro no se inicia sesión automáticamente; se abre el modal de inicio de sesión para mantener flexibilidad para verificación por email futura.
- Mostrar/ocultar contraseña en formularios:
  - Botón con ícono de ojo para alternar visibilidad de campos `password`.
- Botones dinámicos según estado (validado / verificado):
  - Texto y estilo del botón cambian según el estado real del elemento para mayor claridad.
- Notificaciones con toasts para acciones de verificación/validación:
  - Reemplazo de `alert()` por toast para validar/invald. eventos y verificar/desverificar organizadores.
- Unificación de toasts de creación/actualización:
  - Mensajes de creación/actualización de eventos usan el sistema de toasts genérico ("Evento creado ✅", etc.) para coherencia visual.

### Refactor
- Uso del modal genérico en todos los flujos:
  - Flujos de verificación, validación y eliminación actualizados para usar el nuevo modal centralizado, reduciendo duplicación.
- Revisión de la lógica de recarga de eventos:
  - Llamados de actualización (reload) ejecutados sólo cuando corresponde tras crear/actualizar/eliminar, evitando recargas innecesarias.

### Corregido
- Sesiones falsas por JWT persistido en `localStorage`:
  - Backend genera un `issuer` único por ejecución; frontend valida el token al iniciar la app y limpia `localStorage` si el `issuer` es antiguo, evitando usuarios "logueados" tras despliegues/reinicios.
- Carga de eventos del organizador con respuesta vacía:
  - Se detecta correctamente la ausencia de contenido y se muestra "No hay eventos cargados" en lugar de fallar por `response.json()` sobre cuerpo vacío.
- Visualización de imágenes en el mapa (errores 404):
  - `uploads/` movida a la raíz del proyecto; Spring Boot la expone como recurso estático; la lógica crea la carpeta si no existe y permite sobrescritura segura, garantizando persistencia entre reinicios.
- Carga de categoría al editar evento:
  - El backend ahora devuelve `categoriaId` y `categoriaNombre`, permitiendo la selección automática en el formulario de edición.
- Guardado con precio vacío:
  - El formulario acepta correctamente cadenas vacías en `precio` (evento gratuito) tal como lo permite el backend.
- Latitud/longitud faltantes al editar:
  - Los campos ocultos de lat/lng se rellenan al cargar el evento para que la validación no falle cuando la ubicación se muestra en pantalla.
- Texto del botón de guardado en modal de eventos:
  - Se diferencia correctamente entre modo "Crear" y "Editar"; el botón ya no vuelve a "Crear Evento" tras errores de validación/guardado.
- Desfase horario al guardar fechas:
  - El formulario deja de enviar objetos `Date` (que convertían a UTC); ahora envía fechas como `string` y el backend las interpreta como `LocalDateTime`, eliminando desfases (+3 a +6 horas).
- Actualización correcta del mapa (marcadores):
  - Uso de un `LayerGroup` global para administrar marcadores; se limpian y redibujan correctamente tras crear, editar o eliminar eventos evitando duplicados o marcadores de eventos borrados.
- Formulario no conserva datos al crear nuevo evento:
  - Al abrir modal en modo creación el formulario se limpia completamente (inputs, archivos, previews, validaciones).
- Formulario de login se limpia al abrir:
  - Campos y mensajes de error se resetean cada vez que se abre el modal de inicio de sesión (evita datos residuales tras logout).
- Eliminación de doble apertura de modal y backdrops persistentes:
  - Se eliminó `data-bs-toggle` duplicado y ahora los modales se abren sólo desde JavaScript, evitando aperturas dobles y backdrops bloqueantes.
- Vista previa de imagen previa al crear un nuevo evento:
  - Se limpia el campo de archivo y se oculta la vista previa al reiniciar/abrir el modal en modo creación.
- Modal no muestra título incorrecto al ver organizador:
  - El título del modal ahora se actualiza dinámicamente según el contexto (evento u organizador).
- Cierre automático de modales y retorno al Panel de Admin:
  - Tras validar/invalidar o modificar eventos el modal se cierra y el Panel de Administración reaparece automáticamente.
- Mensajes y textos invertidos corregidos:
  - Corrección de textos que mostraban acciones opuestas (validar vs invalidar, verificar vs quitar verificación) según `data-estado`.
- Mensaje al invalidar eventos corregido:
  - Botones, modales y toasts reflejan correctamente la acción de invalidar.
- Mensaje al quitar verificación corregido:
  - Ahora muestra "Quitar verificación" cuando corresponde.
- Error por campo de dirección indefinido en modal de evento:
  - Validación previa para evitar errores cuando `direccion` es `null` o inexistente.
- Formulario del evento se limpia al cerrar el modal:
  - Se eliminan campos, errores visuales y valores previos al cerrar el modal.
- Mapa limpiado al cerrar modal:
  - Latitud, longitud, marcador y popup previos se eliminan al cerrar el modal para evitar restos visuales.
- Actualización del mapa al eliminar evento:
  - Tras eliminación exitosa se recarga la capa de eventos para quitar el marcador correspondiente.
- Panel de Administración: ahora incluye organizadores con sus eventos:
  - La API devuelve organizadores con la lista de sus eventos asociados; UI muestra la información agrupada por organizador.
- Eliminar organizador ya no deja fondo negro ni bloquea la pantalla:
  - Se asegura el cierre correcto de modales y la remoción de backdrops antes de reabrir el panel de administración.

---

## [v0.3.0] - 2025-11-17

### Añadido
- Sistema completo de autenticación:
  - Configuración de JWT (config + filter)
  - Filtros de autorización por rol (organizador/admin)
- Paquete de DTOs:
  - RegistroOrganizadorDTO (Req/Res)
  - LoginOrganizadorDTO (Req/Res)
  - EventoDTO (Req/Res)
  - EventoAdminDTO
- CRUD completo:
  - Eventos: crear, leer, actualizar, eliminar
  - Organizadores: crear, leer, actualizar, eliminar
- AdminInitializer:
  - Crea un usuario administrador por defecto
- Funcionalidades del Admin:
  - Verificar organizadores
  - Validar eventos
  - Acceso a CRUD (excepto creación de organizadores/eventos)
- Repositories añadidos:
  - CategoriaRepository
  - EventoRepository
  - OrganizadorRepository
- Frontend:
  - Fetch para todos los endpoints implementados
  - Panel de administración con acciones para eventos y organizadores
  - Sistema de toasts genérico reutilizable
  - Archivos JS modularizados para UI
- HTML:
  - Modales para GET/UPDATE/DELETE según rol (anónimo, organizador, admin)
  - Ajustes en estructura para nuevas funciones

### Mejorado
- Refactor general del frontend para adaptarse a nuevas funciones
- Actualización de controladores y servicios para soportar DTOs
- Mejoras de mantenibilidad y limpieza del código en JS
- Archivo JS principal en donde se importa el resto del código JS

### Corregido
- Ajustes para evitar inconsistencias en las operaciones CRUD
- Correcciones menores en eventos y validaciones de fechas

### Pendiente
- Vista y edición del perfil del organizador (planeado)
- Se evaluará si el admin podrá crear organizadores/eventos en futuras versiones
- Filtrado de eventos en el mapa

---

## [v0.2.0] - 2025-10-22
### Añadido
- Funcionalidad CREATE y READ de eventos
- Visualización de eventos en mapa con Leaflet.js

### Mejorado
- Separación inicial de archivos JS en módulos

---

## [v0.1.0] - 2025-10-15
### Añadido
- Protótipo inicial del proyecto
- Configuración base en backend y frontend