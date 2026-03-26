import { traducirErrorBackend, t } from "./i18n.js";
import { mostrarToast } from "./toastsGenerico.js";

export async function manejarErrorResponse(resp, contexto = null) {
	let data;

	try {
		data = await resp.json();
	} catch (e) {
		// 🔴 No vino JSON válido
		mostrarToast(t("errorGenerico"), "error");
		return { handled: true };
	}

	// 🟡 VALIDACIONES
	if (Array.isArray(data)) {
		data.forEach(e => {
			const mensaje = traducirErrorBackend(e.error);

			if (contexto === "organizador") {
				showFieldError(`error${capitalize(e.field)}`, mensaje, "reg");
			}

			if (contexto === "evento") {
				showFieldError(`evento${capitalize(e.field)}`, mensaje, "evento");
			}
		});
		mostrarToast(t("revisarDatos"), "danger");
		return { handled: true };
	}

	// 🔴 ERROR GENERAL (esperado)
	if (data?.error) {
		const mensaje = traducirErrorBackend(data.error)
			|| data.message
			|| t("errorGenerico");
		mostrarToast(mensaje, "danger");
		return { handled: true };
	}

	// ⚠️ ERROR DESCONOCIDO (fallback)
	console.warn("⚠️ Error no esperado del backend:", data);

	mostrarToast(t("errorGenerico"), "danger");

	return { handled: true };
}

//helpers para los forms y manejo de errores
export function showFieldError(inputId, msg, contexto) {
	const input = document.getElementById(inputId);
	const error = document.getElementById("error" + inputId.replace(contexto, ""));
	if (!input || !error) return;
	input.classList.add("is-invalid");
	error.textContent = msg;
	error.classList.remove("d-none");
}

export function clearFieldError(inputId, contexto) {
	const input = document.getElementById(inputId);
	const error = document.getElementById("error" + inputId.replace(contexto, ""));
	if (!input || !error) return;
	input.classList.remove("is-invalid");
	error.textContent = "";
	error.classList.add("d-none");
}

function capitalize(str) {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}