import { cargarIdioma, t } from "./i18n.js";
import { mostrarToast } from "./toastsGenerico.js";

const form = document.getElementById("cambiarPassword");

async function iniciarPagina() {

	const idiomaGuardado = localStorage.getItem("idioma") || "es";
	await cargarIdioma(idiomaGuardado);

}

iniciarPagina();


function getToken() {

	const params = new URLSearchParams(window.location.search);
	return params.get("token");

}

form.addEventListener("submit", async (e) => {

	e.preventDefault();

	const password = document.getElementById("password").value;
	const password2 = document.getElementById("password2").value;

	if (password !== password2) {

		mostrarToast(t("passwordNoCoinciden"), "danger");
		return;

	}

	const token = getToken();

	if (!token) {

		mostrarToast(t("tokenInvalido"), "danger");
		return;

	}

	try {

		const res = await fetch("/api/auth/reset-password", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				token: token,
				password: password
			})
		});

		if (res.ok) {

			mostrarToast(t("passwordActualizada"), "success");

			setTimeout(() => {
				window.location.href = "/index.html";
			}, 2000);

		} else {

			mostrarToast(t("errorActualizarPassword"), "danger");

		}

	} catch (err) {

		mostrarToast(t("errorConexion"), "danger");

	}

});