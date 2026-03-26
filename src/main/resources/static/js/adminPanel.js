
import { cargarEventos, eventosCache, obtenerTextoFecha } from './eventos.js';
import { mostrarToast } from './toastsGenerico.js';
import { mostrarModalConfirmacion } from "./confirmarGenerico.js";
import { abrirModalDetalle } from "./modalDetallesGenerico.js";
import { renderEstadoEvento, renderEstadoEventoAdmin } from "./renderEstadoEvento.js";
import { t } from "./i18n.js";

const adminModalEl = document.getElementById("adminPanelModal");
export const panelModal = new bootstrap.Modal(adminModalEl);

let adminCache = null;



export async function initAdminPanel(forceReload = false) {
	const tbody = document.getElementById("eventosAdminBody");

	if (adminCache && !forceReload) {
		renderAdminTable(adminCache);
		return;
	}

	if (!tbody) return console.error("No se encontró #eventosAdminBody en el DOM");


	if (!adminCache || forceReload) {
		tbody.innerHTML = `<tr><td colspan="8" class="text-center">${t("carga")}</td></tr>`;
	}

	try {
		const resp = await fetch("/api/admin/organizadoresYeventos", {
			headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
		});

		if (!resp.ok) {
			await manejarErrorResponse(resp);
			return;
		}

		const organizadores = await resp.json();

		adminCache = organizadores;

		if (!Array.isArray(organizadores) || organizadores.length === 0) {
			tbody.innerHTML = `<tr><td colspan="8" class="text-center">${t("noOrg")}</td></tr>`;
			return;
		}

		renderAdminTable(organizadores);

	} catch (err) {
		tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${t("noDatos")}</td></tr>`;
	}
}

document.addEventListener("click", async (e) => {
	// Actualizar Validacion evento (ACEPTADO o RECHAZADO)
	if (e.target.matches(".btn-cambiar-estado-evento")) {
		const id = e.target.dataset.id;
		const estado = e.target.dataset.estado;
		if (!id || !estado) return;

		const esAceptado = estado === "ACEPTADO";

		if (panelModal) {
			panelModal.hide();
		}

		mostrarModalConfirmacion({
			titulo: esAceptado ? t("eventoAceptarTitulo") : t("eventoRechazarTitulo"),
			mensaje: esAceptado
				? `${t("eventoConfirmarAceptacion")} #${id}?`
				: `${t("eventoConfirmarRechazo")} #${id}?`,
			tipo: esAceptado ? "success" : "warning",
			textoBoton: esAceptado ? t("eventoBotonAceptar") : t("eventoBotonRechazar"),

			onConfirm: async () => {
				try {
					const response = await fetch(`/api/admin/eventos/cambiarEstado/${id}?estado=${estado}`, {
						method: "PUT",
						headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
					});

					if (response.ok) {

						mostrarToast(
							esAceptado
								? `☑️ ${t("eventoAceptadoCorrectamente")}`
								: `❌ ${t("eventoRechazadoCorrectamente")}`,
							"success"
						);

						// Invalidar cache
						eventosCache.length = 0;

						// Forzar recarga
						if (window.mapInstance) {
							cargarEventos(window.mapInstance, { force: true });
						}

						await initAdminPanel(true);

					} else {
						await manejarErrorResponse(resp);
						return;
					}

				} catch (err) {

					mostrarToast(
						esAceptado
							? `${t("eventoErrorAceptarDetalle")} ${err}`
							: `${t("eventoErrorRechazarDetalle")} ${err}`,
						"danger"
					);

				} finally {
					panelModal.show();
				}
			},

			onCancel: () => {
				panelModal.show();
			}
		});
	}

	// Ver organizador para verificar
	if (e.target.matches(".btn-ver-organizador")) {

		const orgId = e.target.dataset.organizadorId;

		try {
			const response = await fetch(`/api/admin/organizadores/ver/${orgId}`, {
				method: "GET",
				headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
			});

			if (!response.ok) {
				await manejarErrorResponse(response);
				return;
			}
			const org = await response.json();

			abrirModalDetalle({
				titulo: t("organizadorDetalleTitulo"),
				cuerpoHTML: `
      <div class="text-center">
        <img src="${org.fotoPerfil}" class="img-fluid rounded-circle mb-3" 
             style="width: 120px; height: 120px; object-fit: cover;">
        <h4>${org.nombre} ${org.apellido}</h4>
        <p><b>${t("organizadorEmail")}:</b> ${org.email}</p>
        <p><b>${t("organizadorTelefono")}:</b> ${org.telefono}</p>
        <p><b>${t("organizadorFechaNacimiento")}:</b> ${org.fechaNacimiento}</p>
        <p><b>${t("organizadorOrganizacion")}:</b> ${org.nombreOrganizacion}</p>
        <p><b>${t("organizadorDireccion")}:</b> ${org.direccionOrganizacion}</p>
        <p><b>${t("organizadorRol")}:</b> ${org.rol}</p>
        <p><b>${t("organizadorRegistradoEl")}:</b> ${org.fechaRegistro}</p>
        <p><b>${t("organizadorVerificado")}:</b> ${org.verificado ? "✅ " + t("si") : "❌ " + t("no")}</p>
      </div>
    `,
				botonesHTML: `
      <button class="btn btn-secondary btn-volver-admin">
        ${t("volverPanelAdmin")}
      </button>
			<button class="btn btn-warning btn-verificar-organizador" data-bs-dismiss="modal" data-id="${org.id}" data-estado="${org.verificado}">
              ${org.verificado ? t("organizadorRevocarVerificacion") : t("organizadorVerificar")}
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
			mostrarToast(t("errorGenerico") + err, "danger");
		}

		return;
	}

	//Actualizar Verificacion organizador
	if (e.target.matches(".btn-verificar-organizador")) {
		const orgId = e.target.dataset.id;
		const estado = e.target.dataset.estado === "true";

		if (panelModal) {
			panelModal.hide();
		}

		mostrarModalConfirmacion({
			titulo: estado ? t("organizadorRevocarVerificacionTitulo") : t("organizadorVerificarTitulo"),
			mensaje: estado
				? `${t("organizadorConfirmarRevocarVerificacion")} #${orgId}?`
				: `${t("organizadorConfirmarVerificacion")} #${orgId}?`,
			tipo: estado ? "warning" : "success",
			textoBoton: estado ? t("organizadorBotonRevocar") : t("organizadorBotonVerificar"),

			onConfirm: async () => {
				try {
					const response = await fetch(`/api/admin/organizadores/verificar/${orgId}`, {
						method: "PUT",
						headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
					});

					if (!response.ok) {
						await manejarErrorResponse(response);
						return;
					}
					// Invalidar cache
					eventosCache.length = 0;

					// Forzar recarga
					if (window.mapInstance) {
						cargarEventos(window.mapInstance, { force: true });
					}

					await initAdminPanel(true);

					mostrarToast(
						estado
							? `☑️ ${t("organizadorVerificacionRemovidaCorrectamente")}`
							: `☑️ ${t("organizadorVerificadoCorrectamente")}`,
						"success"
					);

				} catch {
					mostrarToast(
						estado
							? t("organizadorErrorRemoverVerificacion")
							: t("organizadorErrorVerificando"),
						"danger"
					);
				} finally {
					panelModal.show();
				}
			},

			onCancel: () => {
				panelModal.show();
			}
		});
	}

	// Eliminar organizador
	if (e.target.matches(".btn-eliminar-organizador")) {
		const orgId = e.target.dataset.organizadorId;

		if (panelModal) {
			panelModal.hide();
		}

		mostrarModalConfirmacion({
			titulo: t("organizadorEliminarTitulo"),
			mensaje: t("organizadorEliminarConfirmacion"),
			tipo: "danger",
			textoBoton: t("organizadorBotonEliminar"),

			onConfirm: async () => {
				try {
					const resp = await fetch(`/api/admin/organizadores/eliminar/${orgId}`, {
						method: "DELETE",
						headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
					});

					if (!resp.ok) {
						await manejarErrorResponse(resp);
						return;
					}

					mostrarToast(`☑️ ${t("organizadorEliminadoCorrectamente")}`, "success");

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

					await initAdminPanel(true);

				} catch (err) {
					console.error(err);
					mostrarToast(t("organizadorErrorEliminar"), "danger");
				} finally {
					panelModal.show();
				}
			},

			onCancel: () => {
				panelModal.show();
			}
		});
	}

});

function renderAdminTable(organizadores) {
	const tbody = document.getElementById("eventosAdminBody");

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
    <div class="d-flex align-items-center">

        <div class="flex-grow-1 mx-1">
            <strong>${_escape(org.nombreOrganizador)}</strong><br>

            <span class="text-muted">
                ${_escape(org.emailOrganizador)}
            </span><br>

            ${org.verificadoOrganizador
				? `<span class="badge bg-success">${t("organizadorVerificado")}</span>`
				: `<span class="badge bg-secondary">${t("organizadorNoVerificado")}</span>`}
        </div>

        <div class="d-flex flex-wrap gap-2 justify-content-end mx-1">
            
            ${org.verificadoOrganizador
				? `<button class="btn btn-sm btn-warning text-nowrap btn-ver-organizador"
                        data-organizador-id="${orgId}">
                        ${t("organizadorBotonRevocar")}
                    </button>`
				: `<button class="btn btn-sm btn-success text-nowrap btn-ver-organizador"
                        data-organizador-id="${orgId}">
                        ${t("organizadorBotonVerificar")}
                    </button>`}

            <button class="btn btn-sm btn-danger text-nowrap btn-eliminar-organizador"
                data-organizador-id="${orgId}">
                ${t("organizadorBotonEliminar")}
            </button>

            <button class="btn btn-sm btn-info text-nowrap"
                data-bs-toggle="collapse"
                data-bs-target="#${collapseId}">
                ${t("tablaAdminEventos")} (${eventos.length})
            </button>

        </div>
    </div>
</td>
`;
		tbody.appendChild(trOrg);

		const trEventos = document.createElement("tr");
		trEventos.innerHTML = `
<td colspan="8" class="p-0">
<div id="${collapseId}" class="collapse">

${eventos.length === 0 ? `
<div class="p-3 text-center text-muted">
${t("organizadorSinEventos")}
</div>
` : `
<table class="table table-sm table-bordered m-0">
<thead>
<tr class="table-light">
<th>${t("tablaAdminId")}</th>
<th>${t("tablaAdminTitulo")}</th>
<th>${t("tablaAdminCategoria")}</th>
<th>${t("tipoEvento")}</th>
<th>${t("tablaAdminFechas")}</th>
<th>${t("tablaAdminEstado")}</th>
<th>${t("tablaAdminAcciones")}</th>
</tr>
</thead>

<tbody>
${eventos.map(ev => {

			return `
<tr>

<td>${_escape(ev.id)}</td>

<td>
<strong>${_escape(ev.titulo)}</strong>
</td>

<td style="min-width:140px">
${_escape(ev.categoria || "—")}
</td>

<td style="min-width:140px">
${_escape(ev.estado || "—")}
</td>

<td style="min-width:180px">
${obtenerTextoFecha(ev)}
</td>

<td>
${renderEstadoEvento(ev.estado)}
</td>

<td>

<div class="d-flex flex-column gap-2 align-items-center">

<div class="d-flex justify-content-center gap-1">

<div class="d-flex flex-wrap gap-1">
${renderEstadoEventoAdmin(ev)}
</div>

<div class="d-flex flex-wrap gap-1">

<button class="btn btn-sm btn-outline-primary fw-bold btn-editar-evento"
data-bs-toggle="modal"
data-bs-target="#nuevoEventoModal"
data-id="${ev.id}"
data-origen="admin">

${t("eventoBotonEditar")}

</button>

<button class="btn btn-sm btn-outline-danger fw-bold btn-eliminar-evento"
data-id="${ev.id}">

${t("eventoBotonEliminar")}

</button>

</div>
</div>
</div>

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
}

// helpers seguros (escape)
function escapeHtml(str) {
	if (!str) return "";
	return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

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
