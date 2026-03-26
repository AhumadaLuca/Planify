import { mostrarToast } from './toastsGenerico.js';
import { actualizarMenuUsuario } from './AuthUI.js';
import { limpiarFormularioGenerico } from "./limpiezaFormGenerico.js";
import { t } from "./i18n.js";
import { manejarErrorResponse, showFieldError, clearFieldError } from "./manejoErrores.js";

export function initFormularioOrganizador() {


	document.getElementById("registroModal").addEventListener("hidden.bs.modal", () => {
		limpiarFormularioGenerico("#formRegistro", {
			idTitulo: "registroModalTitulo",
			textoTitulo: t("registroOrganizadorTitulo"),
			idBoton: "btnRegistroOrganizador",
			textoBoton: t("registroBotonRegistro"),
			previewImagenSelector: null
		});

		form.dataset.modo = "registro";

		document.getElementById("regPassword").required = true;
		document.getElementById("regPassword2").required = true;

		document.getElementById("regPassword").closest(".col-md-6").style.display = "block";
		document.getElementById("regPassword2").closest(".col-md-6").style.display = "block";

		document.getElementById("regEmail").readOnly = false;
	});

	const form = document.getElementById("formRegistro");
	if (!form) return;

	const errBox = document.getElementById("registroError");

	form.addEventListener("input", (e) => {
		if (e && e.target && e.target.id) clearFieldError(e.target.id, "reg");
		if (errBox) {
			errBox.classList.add("d-none");
			errBox.innerText = "";
		}
	});

	const modo = form.dataset.modo || "registro";

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

		if (!nombre) { showFieldError("regNombre", t("registroNombreObligatorio"), "reg"); hasError = true; }
		if (!apellido) { showFieldError("regApellido", t("registroApellidoObligatorio"), "reg"); hasError = true; }
		if (modo === "registro") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

			if (!emailRegex.test(email)) {
				showFieldError("regEmail", t("registroEmailInvalido"), "reg");
				hasError = true;
			}

			if (password.length < 6) {
				showFieldError("regPassword", t("registroPasswordMinimo"), "reg");
				hasError = true;
			}
			if (password !== password2) {
				showFieldError("regPassword2", t("registroPasswordsNoCoinciden"), "reg");
				hasError = true;
			}
			if (!passwordRegex.test(password)) {
				showFieldError("regPassword", t("registroPasswordFormato"), "reg");
				hasError = true;
			}
		}

		const telefonoRegex = /^[+]?[0-9\s\-()]{6,20}$/;

		if (telefono && !telefonoRegex.test(telefono)) {
			showFieldError("regTelefono", t("registroTelefonoInvalido"), "reg");
			hasError = true;
		}

		if (!nombre || nombre.length < 2) {
			showFieldError("regNombre", t("registroNombreInvalido"), "reg");
			hasError = true;
		}

		if (!apellido || apellido.length < 2) {
			showFieldError("regApellido", t("registroApellidoInvalido"), "reg");
			hasError = true;
		}

		if (!fechaNacimiento) {
			showFieldError("regFechaNacimiento", t("registroFechaNacimientoObligatoria"), "reg");
			hasError = true;
		} else {
			const userDate = new Date(fechaNacimiento);
			if (isNaN(userDate.getTime())) {
				showFieldError("regFechaNacimiento", t("registroFechaInvalida"), "reg");
				hasError = true;
			} else {
				const adultLimit = new Date();
				adultLimit.setFullYear(adultLimit.getFullYear() - 18);
				if (userDate > adultLimit) {
					showFieldError("regFechaNacimiento", t("registroDebeSerMayorEdad"), "reg");
					hasError = true;
				}
			}
		}

		if (imagen) {
			const validExt = ["image/jpeg", "image/png", "image/webp"];
			if (!validExt.includes(imagen.type)) {
				showFieldError("regImagenPerfil", t("registroFormatoImagenInvalido"), "reg");
				hasError = true;
			}
			if (imagen.size > 2 * 1024 * 1024) {
				showFieldError("regImagenPerfil", t("registroImagenTamano"), "reg");
				hasError = true;
			}
			if (typeof validarDimensionesImagen === "function") {
				const ok = await validarDimensionesImagen(imagen);
				if (!ok) { showFieldError("regImagenPerfil", t("registroImagenDimensiones"), "reg"); hasError = true; }
			}
		}

		if (hasError) {
			mostrarToast(t("registroErroresFormulario"), "danger");
			return;
		}

		const organizador = {
			nombre: nombre.trim(),
			apellido: apellido.trim(),

			email: email.trim().toLowerCase(),

			fechaNacimiento,

			nombreOrganizacion: nombreOrganizacion
				? nombreOrganizacion.trim()
				: undefined,

			direccionOrganizacion: direccionOrganizacion
				? direccionOrganizacion.trim()
				: undefined,

			telefono: telefono ? telefono.trim() : undefined
		};

		if (modo === "registro") {
			organizador.password = password;
		}

		const formData = new FormData();
		formData.append("organizador", new Blob([JSON.stringify(organizador)], { type: "application/json" }));
		if (imagen) formData.append("fotoPerfil", imagen);

		const url = modo === "editar"
			? `/api/organizadores/editar/${localStorage.getItem("id")}`
			: "/api/auth/registro";

		const method = modo === "editar" ? "PUT" : "POST";

		try {
			const res = await fetch(url, {
				method: method,
				body: formData
			});

			if (!res.ok) {
				await manejarErrorResponse(res, "organizador");
				return;
			}

			form.dataset.modo = "registro";
			form.reset();
			bootstrap.Modal.getInstance(document.getElementById("registroModal")).hide();
			if (modo === "editar") {
				mostrarToast(t("perfilActualizado"), "success");
			} else {
				mostrarToast(t("registroExitoso"), "success");
			}

			const modalLogin = new bootstrap.Modal(document.getElementById("loginModal"));
			modalLogin.show();

		} catch (error) {
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
			const resp = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password })
			});

			if (!resp.ok) {
				await manejarErrorResponse(resp);
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