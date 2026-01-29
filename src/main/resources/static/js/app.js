import { initMapa } from './mapa.js';
import { cargarEventos, verEventosOrganizador, verDetalles } from './eventos.js';
import { initUbicacionModal } from './ubicacion.js';
import { initFormularioEvento } from './formularioEvento.js';
import { initFormularioOrganizador } from './formularioOrganizador.js';
import { actualizarMenuUsuario } from './AuthUI.js';
import { initAdminPanel } from './adminPanel.js';
import { decodeJwt } from './issuerDecode.js';
import { initPasswordToggles } from './passwordToggle.js';
import { initVerOrganizador } from './organizador.js';
import "./filtros.js";
import "./buscadorUI.js";
import { initBuscadorEventos } from './buscador.js';
import { hasEdad, setEdad, clearEdad } from './verificacionEdad.js';

export async function iniciarApp() {
	

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
	cargarEventos(map); // Solo los públicos, esto sí se puede cargar al inicio
	initBuscadorEventos();
	initPasswordToggles();
	initFormularioEvento();
	actualizarMenuUsuario();
	initUbicacionModal();
	initFormularioOrganizador();
	initVerOrganizador();

	// Delegar acciones por botones o tabs
	const modalMisEventos = document.getElementById("modalAdministrarEventosOrganizador");
	if (modalMisEventos) {
		modalMisEventos.addEventListener("shown.bs.modal", () => verEventosOrganizador());
	}

	const modalAdministrador = document.getElementById("adminPanelModal");
	if (modalAdministrador) {
		modalAdministrador.addEventListener("shown.bs.modal", () => initAdminPanel());
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
	
	setInterval(() => {
		if (window.mapInstance) {
			cargarEventos(window.mapInstance);
		}
	}, 60_000);
}