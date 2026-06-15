import { initMapa } from './mapa.js';
import { cargarEventos, verEventosOrganizador, verDetalles, dibujarEventosEnMapa, eventosCache } from './eventos.js';
import { initUbicacionModal } from './ubicacion.js';
import { initFormularioEvento } from './formularioEvento.js';
import { initFormularioOrganizador } from './formularioOrganizador.js';
import { actualizarMenuUsuario } from './AuthUI.js';
import { initAdminPanel } from './adminPanel.js';
import { decodeJwt } from './issuerDecode.js';
import { initPasswordToggles } from './passwordToggle.js';
import "./filtros.js";
import "./buscadorUI.js";
import { initBuscadorEventos } from './buscador.js';
import { hasEdad, setEdad } from './verificacionEdad.js';
import { initGPS, centrarEnUsuario, estaGPSActivo } from './gps.js';
import { initSidebar } from './sidebarmovil.js';
import { verPerfilOrganizador, editarPerfil } from './organizador.js';
import { cargarIdioma, traducirPagina } from "./i18n.js";
import { recuperarContra } from './recuperarContra.js';
import { t } from "./i18n.js";
import { mostrarToast } from "./toastsGenerico.js";

export let regionesCache = [];

export async function iniciarApp() {

	window.addEventListener("offline", () => {
		mostrarToast(t("noNet"), "danger");
	});

	const idiomaGuardado = localStorage.getItem("idioma") || "es";
	await cargarIdioma(idiomaGuardado);

	document.getElementById("idiomaActual").textContent = idiomaGuardado.toUpperCase();

	document.getElementById("btnLangES")?.addEventListener("click", async () => {
		await cargarIdioma("es");
		document.getElementById("idiomaActual").textContent = "ES";
		refrescarUI();
		traducirPagina();
	});

	document.getElementById("btnLangEN")?.addEventListener("click", async () => {
		await cargarIdioma("en");
		document.getElementById("idiomaActual").textContent = "EN";
		refrescarUI();
		traducirPagina();
	});

	function refrescarUI() {
		actualizarMenuUsuario();
		dibujarEventosEnMapa(eventosCache);
	}

	let issuerBackend = null;
	try {
		const res = await fetch("/issuer/validar");
		issuerBackend = await res.text();
	} catch (e) {
		console.warn("No se pudo obtener el issuer del servidor");
	}

	if (issuerBackend) {
		const token = localStorage.getItem("token");

		if (token) {
			const payload = decodeJwt(token);
			const issuerToken = payload?.iss;

			// 2. Si el issuer guardado es diferente → token inválido → limpiar
			if (issuerToken !== issuerBackend) {
				localStorage.removeItem("token");
				localStorage.removeItem("rol");
				localStorage.removeItem("nombre");
				localStorage.removeItem("regionId");
			}
		}
	}


	if (!hasEdad()) {
		const modal = new bootstrap.Modal(
			document.getElementById("ageGateModal")
		);
		modal.show();

		document.getElementById("btn-age-confirm").onclick = () => {
			setEdad();
			modal.hide();

			if (window.mapInstance) {
				cargarEventos(window.mapInstance, { force: true });
			}
		};
		document.getElementById("btn-age-deny").onclick = () => {
			modal.hide();

			if (window.mapInstance) {
				cargarEventos(window.mapInstance, { force: true });
			}
		};

		document.getElementById("btn-age-exit").onclick = () => {
			window.location.href = "https://www.google.com"; // o página informativa
		};
	}

	const map = initMapa();
	window.mapInstance = map;

	const btnGPS = document.getElementById("btnUbicacion");
	btnGPS.addEventListener("click", () => {

		if (!estaGPSActivo()) {
			initGPS(map);
		} else {
			centrarEnUsuario(map);
		}

	});

	cargarEventos(map); // Solo los públicos, esto sí se puede cargar al inicio
	initSidebar();
	initBuscadorEventos();
	initPasswordToggles();
	initFormularioEvento();
	actualizarMenuUsuario();
	initUbicacionModal();
	initFormularioOrganizador();
	recuperarContra();

	// Delegar acciones por botones o tabs
	const modalMisEventos = document.getElementById("modalAdministrarEventosOrganizador");
	if (modalMisEventos) {
		modalMisEventos.addEventListener("shown.bs.modal", () => {
			verEventosOrganizador();
			traducirPagina();
		});
	}

	const modalAdministrador = document.getElementById("adminPanelModal");
	if (modalAdministrador) {
		modalAdministrador.addEventListener("shown.bs.modal", () => {
			initAdminPanel();
			traducirPagina();
		});
	}

	document.addEventListener("click", async (e) => {
		if (e.target.classList.contains("btn-validar-evento")) {
			const id = e.target.dataset.id;

			const modalAdmin = bootstrap.Modal.getInstance(document.getElementById("adminPanelModal"));
			if (modalAdmin) modalAdmin.hide();

			// 🔹 Abrir el modal de detalle
			await verDetalles(id, true);
		}
	});

	document.addEventListener("click", (e) => {
		if (e.target.closest("#linkPerfil")) {
			verPerfilOrganizador(e);
			traducirPagina();
		}
	});

	setInterval(() => {
		if (window.mapInstance) {
			cargarEventos(window.mapInstance);
		}
	}, 60_000);

	document.getElementById("formRegistro")
		.addEventListener("submit", async (e) => {

			e.preventDefault();

			const form = e.target;
			const modo = form.dataset.modo || "registro";

			if (modo === "editar") {
				editarPerfil(form);
			}

		});


	// Cargar regiones al iniciar
	fetch('/api/regiones')
		.then(res => res.json())
		.then(data => {
			regionesCache = data;
			cargarProvincias();
		});

	function cargarProvincias() {
		const select = document.getElementById("provincia");

		const provincias = [...new Set(regionesCache.map(r => r.provincia))];

		provincias.forEach(p => {
			const option = document.createElement("option");
			option.value = p;
			option.textContent = p;
			select.appendChild(option);
		});
	}

	function cargarDepartamentos(provinciaSeleccionada) {
		const selectDepto = document.getElementById("departamento");



		const departamentos = regionesCache.filter(r => r.provincia === provinciaSeleccionada);

		departamentos.forEach(r => {
			const option = document.createElement("option");
			option.value = r.id; // 👈 importante
			option.textContent = r.departamento;
			selectDepto.appendChild(option);
		});
	}

	// Cuando cambia provincia
	document.getElementById("provincia").addEventListener("change", function() {

		const provincia = this.value;
		const selectDepto = document.getElementById("departamento");

		selectDepto.innerHTML = "";

		const filtrados = regionesCache.filter(r => r.provincia === provincia);

		filtrados.forEach(r => {
			const option = document.createElement("option");
			option.value = r.id; // 🔥 IMPORTANTE
			option.textContent = r.departamento;
			selectDepto.appendChild(option);
		});

	});

	document.getElementById("provincia").addEventListener("change", (e) => {
		const provincia = e.target.value;
		cargarDepartamentos(provincia);
	});
	
	document.addEventListener("click", (e) => {
		if (e.target.closest("#linkNuevoAdmin")) {

			const form = document.getElementById("formRegistro");

			form.dataset.tipo = "ADMIN";

			document.getElementById("registroModalTitulo").textContent =
				"Registro - Administrador";

			document.getElementById("btnRegistroOrganizador").textContent =
				"Crear administrador";
		}
	});

	document.addEventListener("click", (e) => {
		if (e.target.closest("#linkRegistroOrganizador")) {

			const form = document.getElementById("formRegistro");

			form.dataset.tipo = "ORGANIZADOR";

			document.getElementById("registroModalTitulo").textContent =
				"Registro - Organizador";

			document.getElementById("btnRegistroOrganizador").textContent =
				"Registrar";
		}
	});

}