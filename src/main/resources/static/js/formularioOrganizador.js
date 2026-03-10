
import { mostrarToast } from './toastsGenerico.js';
import { actualizarMenuUsuario } from './AuthUI.js';
import { limpiarFormularioGenerico } from "./limpiezaFormGenerico.js";
import { t } from "./i18n.js";

export function initFormularioOrganizador() {

	document.getElementById("registroModal").addEventListener("hidden.bs.modal", () => {
		limpiarFormularioGenerico("#formRegistro", {
			idTitulo: "registroModalTitulo",
			textoTitulo: t("registroOrganizadorTitulo"),
			idBoton: "btnRegistroOrganizador",
			textoBoton: t("registroBotonRegistro"),
			previewImagenSelector: null
		});
	});
	
	const form = document.getElementById("formRegistro");
	if (!form) return;

	const errBox = document.getElementById("registroError");

	function showFieldError(inputId, msg) {
		const input = document.getElementById(inputId);
		const error = document.getElementById("error" + inputId.replace("reg", ""));
		if (!input || !error) return;
		input.classList.add("is-invalid");
		error.textContent = msg;
		error.classList.remove("d-none");
	}

	function clearFieldError(inputId) {
		const input = document.getElementById(inputId);
		const error = document.getElementById("error" + inputId.replace("reg", ""));
		if (!input || !error) return;
		input.classList.remove("is-invalid");
		error.textContent = "";
		error.classList.add("d-none");
	}

	form.addEventListener("input", (e) => {
		if (e && e.target && e.target.id) clearFieldError(e.target.id);
		if (errBox) {
			errBox.classList.add("d-none");
			errBox.innerText = "";
		}
	});

	form.addEventListener("submit", async function(e) {
		e.preventDefault();

		const nombre = document.getElementById("regNombre")?.value.trim() || "";
		const apellido = document.getElementById("regApellido")?.value.trim() || "";
		const email = document.getElementById("regEmail")?.value.trim() || "";
		const password = document.getElementById("regPassword")?.value || "";
		const password2 = document.getElementById("regPassword2")?.value || "";
		const fechaNacimiento = document.getElementById("regFechaNacimiento")?.value || "";
		const telefono = document.getElementById("regTelefono")?.value || "";
		const nombreOrganizacion = document.getElementById("regNombreOrganizacion")?.value.trim() || "";
		const direccionOrganizacion = document.getElementById("regDireccionOrganizacion")?.value.trim() || "";
		const imagenInput = document.getElementById("regImagenPerfil");
		const imagen = imagenInput && imagenInput.files && imagenInput.files[0] ? imagenInput.files[0] : null;

		let hasError = false;

		if (!nombre) { showFieldError("regNombre", t("registroNombreObligatorio")); hasError = true; }
		if (!apellido) { showFieldError("regApellido", t("registroApellidoObligatorio")); hasError = true; }
		if (!email || !email.includes("@")) { showFieldError("regEmail", t("registroEmailInvalido")); hasError = true; }
		if (password.length < 6) { showFieldError("regPassword", t("registroPasswordMinimo")); hasError = true; }
		if (password !== password2) { showFieldError("regPassword2", t("registroPasswordsNoCoinciden")); hasError = true; }

		if (!fechaNacimiento) {
			showFieldError("regFechaNacimiento", t("registroFechaNacimientoObligatoria"));
			hasError = true;
		} else {
			const userDate = new Date(fechaNacimiento);
			if (isNaN(userDate.getTime())) {
				showFieldError("regFechaNacimiento", t("registroFechaInvalida"));
				hasError = true;
			} else {
				const adultLimit = new Date();
				adultLimit.setFullYear(adultLimit.getFullYear() - 18);
				if (userDate > adultLimit) {
					showFieldError("regFechaNacimiento", t("registroDebeSerMayorEdad"));
					hasError = true;
				}
			}
		}

		if (imagen) {
			const validExt = ["image/jpeg", "image/png", "image/webp"];
			if (!validExt.includes(imagen.type)) {
				showFieldError("regImagenPerfil", t("registroFormatoImagenInvalido"));
				hasError = true;
			}
			if (imagen.size > 2 * 1024 * 1024) {
				showFieldError("regImagenPerfil", t("registroImagenTamano"));
				hasError = true;
			}
			if (typeof validarDimensionesImagen === "function") {
				const ok = await validarDimensionesImagen(imagen);
				if (!ok) { showFieldError("regImagenPerfil", t("registroImagenDimensiones")); hasError = true; }
			}
		}

		if (hasError) {
			mostrarToast(t("registroErroresFormulario"), "danger");
			return;
		}

		const organizador = {
			nombre,
			apellido,
			email,
			password,
			fechaNacimiento,
			nombreOrganizacion,
			direccionOrganizacion,
			telefono
		};

		const formData = new FormData();
		formData.append("organizador", new Blob([JSON.stringify(organizador)], { type: "application/json" }));
		if (imagen) formData.append("fotoPerfil", imagen);

		try {
			const res = await fetch("http://localhost:8080/api/auth/registro", {
				method: "POST",
				body: formData
			});

			if (!res.ok) {
				const msg = await res.text().catch(() => null);
				mostrarToast(t("registroErrorRegistrar") + msg, "danger");
				return;
			}

			form.reset();
			bootstrap.Modal.getInstance(document.getElementById("registroModal")).hide();
			mostrarToast(t("registroExitoso"), "success");

			const modalLogin = new bootstrap.Modal(document.getElementById("loginModal"));
			modalLogin.show();

		} catch (error) {
			console.error("Error en fetch registro: ", error);
			mostrarToast(t("registroErrorConexion"), "danger");
		}
	});

	document.getElementById("loginModal").addEventListener("show.bs.modal", () => {
		const form = document.getElementById("formLogin");
		if (form) form.reset();

		const err = document.getElementById("loginError");
		if (err) {
			err.classList.add("d-none");
			err.innerText = "";
		}
	});

	document.getElementById("formLogin").addEventListener("submit", async function(e) {
		e.preventDefault();

		const email = document.getElementById("loginEmail").value.trim();
		const password = document.getElementById("loginPassword").value.trim();
		const err = document.getElementById("loginError");

		err.classList.add("d-none");
		err.innerText = "";

		if (!email || !password) {
			err.innerText = t("loginCompletarCampos");
			err.classList.remove("d-none");
			return;
		}

		try {
			const resp = await fetch("http://localhost:8080/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password })
			});

			if (!resp.ok) {
				mostrarToast(t("loginCredencialesIncorrectas"), "danger");
				return;
			}

			const data = await resp.json();

			localStorage.setItem("id", data.id);
			localStorage.setItem("token", data.token);
			localStorage.setItem("nombre", data.nombre);
			localStorage.setItem("rol", data.rol);

			bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();

			mostrarToast(t("loginBienvenida") + data.nombre + "!", "success");
			actualizarMenuUsuario();

		} catch (error) {
			console.error("Error en login:", error);
			mostrarToast(t("loginErrorServidor"), "danger");
		}
	});

	async function validarDimensionesImagen(file) {
		return new Promise(resolve => {
			const img = new Image();
			img.src = URL.createObjectURL(file);
			img.onload = () => {
				const ok = img.width >= 150 && img.height >= 150;
				resolve(ok);
			};
			img.onerror = () => resolve(false);
		});
	}
}