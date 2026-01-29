
import { cargarEventos, eventosCache } from './eventos.js';
import { mostrarToast } from './toastsGenerico.js';
import { mostrarModalConfirmacion } from "./confirmarGenerico.js";
import { abrirModalDetalle } from "./modalDetallesGenerico.js";
import { renderEstadoEvento, renderEstadoEventoAdmin } from "./renderEstadoEvento.js";

export async function initAdminPanel() {
	const tbody = document.getElementById("eventosAdminBody");
	if (!tbody) return console.error("No se encontró #eventosAdminBody en el DOM");

	const _escape = (str) => {
		if (typeof escapeHtml === "function") return escapeHtml(str);
		if (str === null || str === undefined) return "";
		return String(str)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	};

	tbody.innerHTML = `<tr><td colspan="8" class="text-center">Cargando...</td></tr>`;

	try {
		const resp = await fetch("http://localhost:8080/api/admin/organizadoresYeventos", {
			headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
		});

		if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

		const organizadores = await resp.json();

		if (!Array.isArray(organizadores) || organizadores.length === 0) {
			tbody.innerHTML = `<tr><td colspan="8" class="text-center">No hay organizadores.</td></tr>`;
			return;
		}

		tbody.innerHTML = "";

		organizadores.forEach(org => {
			const orgId = org.organizadorId;
			const eventos = org.eventos || [];

			const collapseId = `eventos-org-${orgId}`;

			// Fila principal del organizador
			const trOrg = document.createElement("tr");
			trOrg.classList.add("table-primary");
			trOrg.innerHTML = `
                <td colspan="8">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${_escape(org.nombreOrganizador)}</strong>
                            <br>
                            <span class="text-muted">${_escape(org.emailOrganizador)}</span>
                            <br>
                            ${org.verificadoOrganizador
					? '<span class="badge bg-success">Verificado</span>'
					: '<span class="badge bg-secondary">No verificado</span>'}
                        </div>

                        <div>
                        
                        ${org.verificadoOrganizador
                         ? `<button class="btn btn-sm btn-warning btn-ver-organizador"
                                data-organizador-id="${orgId}">
                                Revocar Verificar
                            </button>`
                        :`<button class="btn btn-sm btn-success btn-ver-organizador"
                                data-organizador-id="${orgId}">
                                Verificar
                            </button>`}

                            <button class="btn btn-sm btn-danger btn-eliminar-organizador"
                                data-organizador-id="${orgId}">
                                Eliminar Organizador
                            </button>

                            <button class="btn btn-sm btn-info"
                                data-bs-toggle="collapse"
                                data-bs-target="#${collapseId}">
                                Ver eventos (${eventos.length})
                            </button>
                        </div>
                    </div>
                </td>
            `;
			tbody.appendChild(trOrg);

			// Fila que contiene la tabla colapsable
			const trEventos = document.createElement("tr");
			trEventos.innerHTML = `
                <td colspan="8" class="p-0">
                    <div id="${collapseId}" class="collapse">
                        ${eventos.length === 0 ? `
                            <div class="p-3 text-center text-muted">
                                Este organizador no tiene eventos.
                            </div>
                        ` : `
                            <table class="table table-sm table-bordered m-0">
                                <thead>
                                    <tr class="table-light">
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Categoría</th>
                                        <th>Fechas</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${eventos.map(ev => {
				const fi = ev.fechaInicio ? ev.fechaInicio.replace("T", " ").slice(0, 16) : "—";
				const ff = ev.fechaFin ? ev.fechaFin.replace("T", " ").slice(0, 16) : "—";

				return `
                                            <tr>
                                                <td>${_escape(ev.id)}</td>
                                                <td>
                                                    <strong>${_escape(ev.titulo)}</strong><br>
                                                    <small class="text-muted">${_escape(ev.descripcion)}</small>
                                                </td>
                                                <td>${_escape(ev.categoria || "—")}</td>
                                                <td>${fi}<br><small class="text-muted">${ff}</small></td>

                                                <td>
                                                   ${renderEstadoEvento(ev.estado)}
                                                </td>

                                                <td>
                                                    ${renderEstadoEventoAdmin(ev)}

                                                    <button class="btn btn-sm btn-primary btn-editar-evento"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#nuevoEventoModal"
                                                        data-id="${ev.id}">
                                                        Editar
                                                    </button>

                                                    <button class="btn btn-sm btn-danger btn-eliminar-evento"
                                                        data-id="${ev.id}">
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
			}).join("")}
                                </tbody>
                            </table>
                        `}
                    </div>
                </td>
            `;

			tbody.appendChild(trEventos);
		});

	} catch (err) {
		console.error("Error cargando admin panel:", err);
		tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error cargando datos.</td></tr>`;
	}
}

document.addEventListener("click", async (e) => {
	// Actualizar Validacion evento (ACEPTADO o RECHAZADO)
	if (e.target.matches(".btn-cambiar-estado-evento")) {
		const id = e.target.dataset.id;
		const estado = e.target.dataset.estado;
		if (!id || !estado) return;
		
		const esAceptado = estado === "ACEPTADO";

		mostrarModalConfirmacion({
			titulo: esAceptado ? "Aceptar evento" : "Rechazar evento",
			mensaje: esAceptado ? `¿Confirmás la aceptación del evento #${id}?` : `¿Confirmás el rechazo del evento #${id}?`,
			tipo: esAceptado ? "success" : "warning",
			textoBoton: esAceptado ? "Aceptar" : "Rechazar",
			onConfirm: async () => {
				try {
					const response = await fetch(`http://localhost:8080/api/admin/eventos/cambiarEstado/${id}?estado=${estado}`, {
						method: "PUT",
						headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
					});

					if (response.ok) {
						mostrarToast(esAceptado ? "☑️ Evento aceptado correctamente" : "❌ Evento rechazado correctamente", "success");

						// Invalidar cache
						eventosCache.length = 0;

						// Forzar recarga
						if (window.mapInstance) {
							cargarEventos(window.mapInstance, { force: true });
						}

						new bootstrap.Modal(document.getElementById("adminPanelModal")).show();
					} else {
						mostrarToast(esAceptado ? "❌ No se pudo aceptar el evento" : "❌ No se pudo rechazar el evento", "danger");
					}
				} catch (err) {
					mostrarToast(esAceptado ? "Error al aceptar el evento: " + err : "Error al rechazar el evento: " + err, "danger");
				}
			}
		});
	}

	// Ver organizador para verificar
	if (e.target.matches(".btn-ver-organizador")) {

		const orgId = e.target.dataset.organizadorId;

		try {
			const response = await fetch(`http://localhost:8080/api/admin/organizadores/ver/${orgId}`, {
				method: "GET",
				headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
			});
			if (!response.ok) { throw new Error("No se pudo obtener el organizador"); }

			const org = await response.json();

			abrirModalDetalle({
				titulo: "Detalles del organizador",
				cuerpoHTML: `
      <div class="text-center">
        <img src="${org.fotoPerfil}" class="img-fluid rounded-circle mb-3" 
             style="width: 120px; height: 120px; object-fit: cover;">
        <h4>${org.nombre} ${org.apellido}</h4>
        <p><b>Email:</b> ${org.email}</p>
        <p><b>Teléfono:</b> ${org.telefono}</p>
        <p><b>Fecha de nacimiento:</b> ${org.fechaNacimiento}</p>
        <p><b>Organización:</b> ${org.nombreOrganizacion}</p>
        <p><b>Dirección:</b> ${org.direccionOrganizacion}</p>
        <p><b>Rol:</b> ${org.rol}</p>
        <p><b>Registrado el:</b> ${org.fechaRegistro}</p>
        <p><b>Verificado:</b> ${org.verificado ? "✅ Sí" : "❌ No"}</p>
      </div>
    `,
				botonesHTML: `
      <button class="btn btn-secondary btn-volver-admin">
        Volver al Panel
      </button>
			<button class="btn btn-warning btn-verificar-organizador" data-bs-dismiss="modal" data-id="${org.id}" data-estado="${org.verificado}">
              ${org.verificado ? 'Revocar Verificar Organizador' : 'Verificar Organizador'}
            </button>	
    `
			});
			const panelModal = bootstrap.Modal.getInstance(document.getElementById("adminPanelModal"));
			if (panelModal) {
				panelModal.hide();
			}

			// Invalidar cache
			eventosCache.length = 0;

			// Forzar recarga
			if (window.mapInstance) {
				cargarEventos(window.mapInstance, { force: true });
			}

			document.getElementById("modalDetalleGenerico").querySelector(".btn-volver-admin").addEventListener("click", () => {
				const detalleModal = bootstrap.Modal.getInstance(document.getElementById("modalDetalleGenerico"));
				if (detalleModal) detalleModal.hide();
				const modalAdmin = new bootstrap.Modal(document.getElementById("adminPanelModal"));
				modalAdmin.show();
			});

		} catch (err) {
			console.error("Error:", err);
			alert("Error");
		}
		return;
	}

	//Actualizar Verificacion organizador
	if (e.target.matches(".btn-verificar-organizador")) {
		const orgId = e.target.dataset.id;
		const estado = e.target.dataset.estado === "true";
		mostrarModalConfirmacion({
			titulo: estado ? "Revocar verificación" : "Verificar organizador",
			mensaje: estado ? `¿Confirmas la revocación de la verificación del organizador #${orgId}?` : `¿Confirmas la verificación del organizador #${orgId}?`,
			tipo: estado ? "warning" : "success",
			textoBoton: estado ? "Revocar" : "Verificar",
			onConfirm: async () => {
				try {
					const response = await fetch(`http://localhost:8080/api/admin/organizadores/verificar/${orgId}`, {
						method: "PUT",
						headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
					});

					if (!response.ok) throw new Error("No se pudo verificar el organizador");

					// Invalidar cache
					eventosCache.length = 0;

					// Forzar recarga
					if (window.mapInstance) {
						cargarEventos(window.mapInstance, { force: true });
					}

					mostrarToast(estado ? "☑️ Verificación removida correctamente" : "☑️ Organizador verificado correctamente", "success");

					new bootstrap.Modal(document.getElementById("adminPanelModal")).show();
				} catch {
					mostrarToast(estado ? "Error removiendo verificación" : "Error verificando organizador", "danger");
				}
			}
		});
	}

	// Eliminar organizador
	if (e.target.matches(".btn-eliminar-organizador")) {
		const orgId = e.target.dataset.organizadorId;

		mostrarModalConfirmacion({
			titulo: "Eliminar organizador",
			mensaje: "¿Eliminar organizador y todos sus eventos?",
			tipo: "danger",
			textoBoton: "Eliminar",
			onConfirm: async () => {
				try {
					const resp = await fetch(`http://localhost:8080/api/admin/organizadores/eliminar/${orgId}`, {
						method: "DELETE",
						headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
					});

					if (!resp.ok) throw new Error();

					mostrarToast("☑️ Organizador y sus eventos eliminados correctamente", "success");

					const modalAbierto = document.querySelector(".modal.show");
					if (modalAbierto) {
						const instancia = bootstrap.Modal.getInstance(modalAbierto);
						instancia?.hide();
					}

					// Invalidar cache
					eventosCache.length = 0;

					// Forzar recarga
					if (window.mapInstance) {
						cargarEventos(window.mapInstance, { force: true });
					}

					new bootstrap.Modal(document.getElementById("adminPanelModal")).show();
				} catch (err) {
					console.error(err);
					mostrarToast("Error eliminando organizador", "danger");
				}
			}
		});
	}

});

// helpers seguros (escape)
function escapeHtml(str) {
	if (!str) return "";
	return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
