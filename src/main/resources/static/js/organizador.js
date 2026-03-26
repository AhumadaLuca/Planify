import { mostrarToast } from './toastsGenerico.js';
import { abrirModalDetalle } from "./modalDetallesGenerico.js";
import { t } from "./i18n.js";


export async function verPerfilOrganizador(e) {

	e.preventDefault();

	const orgId = localStorage.getItem("id");
	if (!orgId) {
		mostrarToast(traducciones.errorIdPerfil, "danger");
		return;
	}

	try {
		const response = await fetch(`/api/organizadores/ver/${orgId}`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		});

		if (!response.ok) {
			await manejarErrorResponse(response);
			return;
		}

		const org = await response.json();

		abrirModalDetalle({
			titulo: t("miPerfil"),
			cuerpoHTML: `
        <div class="text-center">
            <img src="${org.fotoPerfil}" 
                 class="img-fluid rounded-circle mb-3" 
                 style="width: 120px; height: 120px; object-fit: cover;">

            <h4>${org.nombre} ${org.apellido}</h4>
            <p><b>${t("email")}:</b> ${org.email}</p>
            <p><b>${t("telCel")}:</b> ${org.telefono}</p>
            <p><b>${t("fechaNacimiento")}:</b> ${org.fechaNacimiento}</p>
            <p><b>${t("organizacion")}:</b> ${org.nombreOrganizacion || "-"}</p>
            <p><b>${t("direccion")}:</b> ${org.direccionOrganizacion || "-"}</p>
            <p><b>${t("rol")}:</b> ${org.rol}</p>
            <p><b>${t("registradoEl")}:</b> ${org.fechaRegistro}</p>
            <p><b>${t("verificado")}:</b> ${org.verificado ? t("si") : t("no")}</p>
        </div>
    `,
			botonesHTML: `
    <button class="btn btn-primary" data-bs-dismiss="modal" id="btnEditarPerfil">
        ${t("editarPerfil")}
    </button>

    <button class="btn btn-secondary" data-bs-dismiss="modal">
        ${t("cerrar")}
    </button>
`
		});

	} catch (err) {
		mostrarToast(t("errorPerfilCarga"), "danger");
	}

	setTimeout(() => {
		const btnEditar = document.getElementById("btnEditarPerfil");
		if (btnEditar) {
			btnEditar.addEventListener("click", abrirEditarPerfil);
		}
	}, 100);

}

export async function abrirEditarPerfil() {


	const orgId = localStorage.getItem("id");
	

	try {

		const response = await fetch(`/api/organizadores/ver/${orgId}`, {
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		});

		if (!response.ok) {
			await manejarErrorResponse(response);
			return;
		}

		const org = await response.json();

		const modal = new bootstrap.Modal(document.getElementById("registroModal"));
		const form = document.getElementById("formRegistro");

		form.reset();

		// modo edición
		form.dataset.modo = "editar";

		// email no editable
		document.getElementById("regEmail").readOnly = true;

		// ocultar password
		document.getElementById("regPassword").closest(".col-md-6").style.display = "none";
		document.getElementById("regPassword2").closest(".col-md-6").style.display = "none";

		document.getElementById("regPassword").required = false;
		document.getElementById("regPassword2").required = false;

		// cargar datos
		document.getElementById("regNombre").value = org.nombre || "";
		document.getElementById("regApellido").value = org.apellido || "";
		document.getElementById("regEmail").value = org.email || "";
		document.getElementById("regTelefono").value = org.telefono || "";
		document.getElementById("regFechaNacimiento").value = org.fechaNacimiento || "";
		document.getElementById("regNombreOrganizacion").value = org.nombreOrganizacion || "";
		document.getElementById("regDireccionOrganizacion").value = org.direccionOrganizacion || "";

		// cambiar textos
		document.getElementById("registroModalTitulo").textContent = t("editarPerfil");
		document.getElementById("btnRegistroOrganizador").textContent = t("guardarCambios");

		modal.show();

	} catch (err) {
		mostrarToast(t("errorCargarPerfil"), "danger");
	}

}

export async function editarPerfil(form) {

	const orgId = localStorage.getItem("id");

	const formData = new FormData(form);

	try {

		const response = await fetch(`/api/organizadores/editar/${orgId}`, {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
			body: formData
		});

		if (!response.ok) {
			await manejarErrorResponse(response);
			return;
		}

		mostrarToast(t("perfilActualizado"), "success");
		
		actualizarSidebarNombre(formData.get("nombre"));

		bootstrap.Modal.getInstance(
			document.getElementById("registroModal")
		).hide();

	} catch (err) {
		mostrarToast(t("errorActualizarPerfil"), "danger");
	}

}

function actualizarSidebarNombre(nombre) {
    const el = document.getElementById("sidebarNombre");
    if (el) {
        el.textContent = `${t("hola")}, ${nombre}`;
    }
}


