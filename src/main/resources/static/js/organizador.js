import { mostrarToast } from './toastsGenerico.js';
import { abrirModalDetalle } from "./modalDetallesGenerico.js";
import { t } from "./i18n.js";


export async function verPerfilOrganizador(e){	
	
    e.preventDefault();

    const orgId = localStorage.getItem("id");
    if (!orgId) {
        mostrarToast(traducciones.errorIdPerfil, "danger");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/organizadores/ver/${orgId}`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${localStorage.getItem("token")}` 
            }
        });

        if (!response.ok){
			mostrarToast(traducciones.errorPerfil, "danger");
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
        <button class="btn btn-secondary" data-bs-dismiss="modal">
            ${t("cerrar")}
        </button>
    `
});

    } catch (err) {
        mostrarToast(traducciones.errorPerfilCarga, "danger");
    }
}
