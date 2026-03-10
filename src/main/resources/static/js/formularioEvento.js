
import { cargarEventos } from './eventos.js';
import { verEventosOrganizador, eventosCache } from './eventos.js';
import { mostrarToast } from './toastsGenerico.js';
import { mostrarModalConfirmacion } from "./confirmarGenerico.js";
import { limpiarFormularioGenerico } from "./limpiezaFormGenerico.js";
import { detectarRedSocialPorTipo, normalizarUrl, obtenerIconoPorTipo, validarUrl } from "./redesSociales.js";
import { panelModal, initAdminPanel } from "./adminPanel.js";
import { t } from "./i18n.js";


export function initFormularioEvento() {
	
	const form = document.getElementById("formEvento");

	document.getElementById("nuevoEventoModal").addEventListener("hidden.bs.modal", () => {
		
		
    	const origen = form.dataset.origen;
		
		console.log("🧹 Cerrando MODAL — limpiando formulario de evento...");
		limpiarFormularioGenerico("#formEvento", {
			idTitulo: "tituloModalEvento",
			textoTitulo: t("eventoNuevoTitulo"),
			idBoton: "btnGuardarEvento",
			textoBoton: t("eventoCrearEvento"),
			previewImagenSelector: "#previewImagenEvento"
		});
		
		// 🔥 SI VENÍA DEL ADMIN → REABRIR PANEL
    if (origen === "admin") {
        const adminModalEl = document.getElementById("adminPanelModal");
        if (adminModalEl) {
            bootstrap.Modal.getOrCreateInstance(adminModalEl).show();
        }
    }

    // 🔥 SI VENÍA DEL ORGANIZADOR → REFRESCAR LISTA
    if (origen === "organizador") {
        if (typeof verEventosOrganizador === "function") {
            verEventosOrganizador();
        }
    }
    
    delete form.dataset.origen;
    if (!form) return;
		
	});	
	


	// Contenedores DOM (se asignan en initRedesUI)
	let redesWrapper = null;
	let btnAddLink = null;
	const MAX_LINKS = 12;

	initRedesUI();

	const errBox = document.getElementById("eventoError");

	// escuchar inputs una sola vez (no dentro del submit)
	form.addEventListener("input", (e) => {
		if (e && e.target && e.target.id) clearFieldError(e.target.id);
		if (errBox) {
			errBox.classList.add("d-none");
			errBox.innerText = "";
		}
	});

	// helpers
	function showFieldError(inputId, msg) {
		const input = document.getElementById(inputId);
		const error = document.getElementById("error" + inputId.replace("evento", ""));
		if (!input || !error) return;
		input.classList.add("is-invalid");
		error.textContent = msg;
		error.classList.remove("d-none");
	}

	function clearFieldError(inputId) {
		const input = document.getElementById(inputId);
		const error = document.getElementById("error" + inputId.replace("evento", ""));
		if (!input || !error) return;
		input.classList.remove("is-invalid");
		error.textContent = "";
		error.classList.add("d-none");
	}

	function preloadRedes(redesArray) {
		// redesArray: [{ id?, url, tipo? }, ...] o list of strings
		if (!redesWrapper) return;
		redesWrapper.innerHTML = '';
		if (!Array.isArray(redesArray)) return;
		redesArray.forEach(r => {
			if (typeof r === 'string') addLinkRow({ url: r });
			else addLinkRow({ id: r.id, url: r.url || r.url });
		});
	}


	// agregar una fila de link al DOM
	function addLinkRow(data = null) {
		// data = { id?, url? }
		if (!redesWrapper) return;
		const count = redesWrapper.querySelectorAll('.red-row').length;
		if (count >= MAX_LINKS) {
			// uso de interpolación con t()
			alert(t("eventoMaxLinks", { max: MAX_LINKS }));
			return;
		}

		const row = document.createElement('div');
		row.className = 'red-row d-flex gap-2 align-items-center mb-2';

		const inputGroup = document.createElement('div');
		inputGroup.className = 'red-input-group d-flex gap-2 align-items-center flex-grow-1';

		const iconBox = document.createElement('div');
		iconBox.className = 'red-icon d-inline-flex align-items-center justify-content-center';
		iconBox.style.width = '36px';
		iconBox.style.height = '36px';

		iconBox.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14h-2v-2h2zm0-4h-2V6h2z"/></svg>`;

		const input = document.createElement('input');
		input.type = 'url';
		input.className = 'form-control red-url-input';
		input.placeholder = t("eventoPlaceholderLink");
		input.setAttribute('aria-label', t("eventoAriaLink"));

		const hiddenId = document.createElement('input');
		hiddenId.type = 'hidden';
		hiddenId.className = 'link-id';
		if (data && data.id) hiddenId.value = data.id;

		// detectar tipo mientras escribe (debounce)
		let tmr;
		input.addEventListener('input', () => {
			clearTimeout(tmr);
			tmr = setTimeout(() => {
				const v = input.value.trim();
				if (!v) {
					iconBox.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14h-2v-2h2zm0-4h-2V6h2z"/></svg>`;
					return;
				}
				const tipo = detectarRedSocialPorTipo(v);
				iconBox.innerHTML = obtenerIconoPorTipo(tipo);
				iconBox.title = tipo;
			}, 220);
		});

		if (data && data.url) {
			input.value = data.url;
			iconBox.title = detectarRedSocialPorTipo(data.url);
		}

		const btnRemove = document.createElement('button');
		btnRemove.type = 'button';
		btnRemove.className = 'btn btn-link btn-remove-link p-1 text-danger';
		btnRemove.title = t("eventoEliminarLink");
		btnRemove.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm2 4h2v11h-2V7z"/></svg>`;
		btnRemove.addEventListener('click', () => row.remove());

		inputGroup.appendChild(iconBox);
		inputGroup.appendChild(input);
		inputGroup.appendChild(hiddenId);

		row.appendChild(inputGroup);
		row.appendChild(btnRemove);

		redesWrapper.appendChild(row);
		input.focus();
	}

	// colectar links desde DOM (para envío)
	function agarrarRedesDOM() {
		if (!redesWrapper) return [];
		const rows = Array.from(redesWrapper.querySelectorAll('.red-row'));
		const redes = [];
		for (const r of rows) {
			const urlInput = r.querySelector('.red-url-input');
			const idInput = r.querySelector('.link-id');
			const raw = urlInput ? urlInput.value.trim() : '';
			if (!raw) continue;
			const url = normalizarUrl(raw);
			if (!validarUrl(url)) {
				// lanzo error con texto traducible
				throw new Error(t("eventoUrlInvalidaDetalle", { url: raw }));
			}
			redes.push({
				id: idInput && idInput.value ? Number(idInput.value) : null,
				url,
				tipo: detectarRedSocialPorTipo(url)
			});
		}
		return redes;
	}

	// inicializar referencias DOM (llamar desde initFormularioEvento)
	function initRedesUI() {
		redesWrapper = document.getElementById('redesWrapper');
		btnAddLink = document.getElementById('btnAddLink');

		// si no existe el contenedor, no hacemos nada (para compatibilidad)
		if (!redesWrapper || !btnAddLink) return;

		// añadir una fila vacía por defecto si no hay ninguna
		if (redesWrapper.querySelectorAll('.red-row').length === 0) addLinkRow();

		btnAddLink.addEventListener('click', () => addLinkRow());
	}

	console.log("🎯 initFormularioOrganizador cargado correctamente");
	// GUARDAR EVENTO
	form.addEventListener("submit", async function(e) {
		e.preventDefault();

		const esEdicion = !!form.dataset.idEvento;
		const origen = form.dataset.origen;

		const btnGuardar = document.querySelector("#btnGuardarEvento");
		btnGuardar.disabled = true;
		btnGuardar.textContent = t("eventoGuardando");
		try {
			// Capturar campos
			const titulo = document.getElementById("eventoTitulo").value.trim();
			const descripcion = document.getElementById("eventoDescripcion").value.trim();
			const categoriaId = parseInt(document.getElementById("eventoCategoriaId").value);
			const fechaInicio = document.getElementById("eventoFechaInicio").value;
			const fechaFin = document.getElementById("eventoFechaFin").value;
			const ubicacion = document.getElementById("eventoDireccion").value.trim();
			const latitud = parseFloat(document.getElementById("eventoLatitud").value);
			const longitud = parseFloat(document.getElementById("eventoLongitud").value);
			const precio = document.getElementById("eventoPrecio").value.trim();
			const urlVentaExterna = document.getElementById("eventoUrlVentaExterna").value.trim();
			const requiereVerificarEdad = !!document.getElementById("eventoRequiereVerificarEdad")?.checked;
			const imagenUrl = document.getElementById("eventoImagen")?.files?.[0];

			let hasError = false;

			// Validaciones principales
			if (!titulo) { showFieldError("eventoTitulo", t("eventoTituloObligatorio")); hasError = true; }
			if (!descripcion) { showFieldError("eventoDescripcion", t("eventoDescripcionObligatoria")); hasError = true; }

			if (isNaN(categoriaId)) { showFieldError("eventoCategoriaId", t("eventoSeleccioneCategoria")); hasError = true; }

			const now = new Date();
			const fechaInicioDate = new Date(fechaInicio);
			const fechaFinDate = new Date(fechaFin);
			if (isNaN(fechaInicioDate) || isNaN(fechaFinDate)) {
				showFieldError("eventoFechaInicio", t("eventoFechasInvalidas"));
				hasError = true;
			} else {
				if (fechaInicioDate < now) { showFieldError("eventoFechaInicio", t("eventoFechaInicioPasado")); hasError = true; }
				if (fechaFinDate <= fechaInicioDate) { showFieldError("eventoFechaFin", t("eventoFechaFinPosterior")); hasError = true; }
			}

			if (!ubicacion) { showFieldError("eventoDireccion", t("eventoDireccionObligatoria")); hasError = true; }
			if (isNaN(latitud) || isNaN(longitud)) { showFieldError("eventoDireccion", t("eventoSeleccionarUbicacionMapa")); hasError = true; }

			if (precio !== "" && (isNaN(precio) || precio < 0)) {
				showFieldError("eventoPrecio", t("eventoPrecioNumeroValido"));
				hasError = true;
			}

			// Validación URL
			if (urlVentaExterna) {
				try { new URL(urlVentaExterna); }
				catch { showFieldError("eventoUrlVentaExterna", t("eventoUrlInvalida")); hasError = true; }
			}

			// Validación imagen
			console.log("dataset id:", form.dataset.idEvento);
			console.log("esEdicion:", esEdicion);
			if (imagenUrl) {
				const validExt = ["image/jpeg", "image/png", "image/webp"];

				if (!validExt.includes(imagenUrl.type)) {
					showFieldError("eventoImagen", t("eventoFormatoImagenInvalido"));
					hasError = true;
				}
				if (imagenUrl.size > 2 * 1024 * 1024) {
					showFieldError("eventoImagen", t("eventoImagenTamano"));
					hasError = true;
				}
				const ok = await validarDimensionesImagen(imagenUrl);
				if (!ok) { showFieldError("eventoImagen", t("eventoImagenDimensiones")); hasError = true; }
			} else if (!esEdicion) {
				showFieldError("eventoImagen", t("eventoImagenObligatoria"));
				hasError = true;
			}

			if (hasError) {
				return;
			}

			// recolectar redes desde el DOM (validará URLs y lanzará error si alguna inválida)
			let redesSociales = [];
			try {
				redesSociales = agarrarRedesDOM();
			} catch (err) {
				// mostrar mensaje global en errBox o con showFieldError
				if (errBox) {
					errBox.classList.remove('d-none');
					errBox.innerText = err.message;
				} else {
					alert(err.message);
				}
				btnGuardar.disabled = false;
				btnGuardar.textContent = esEdicion ? t("eventoGuardarCambios") : t("eventoCrearEvento");
				return;
			}


			// Armar objeto evento plano
			const evento = {
				titulo,
				descripcion,
				fechaInicio,
				fechaFin,
				ubicacion,
				latitud,
				longitud,
				precio,
				urlVentaExterna,
				requiereVerificarEdad,
				categoriaId,
				redesSociales
			};

			// Preparar FormData final
			const data = new FormData();
			data.append("evento", new Blob([JSON.stringify(evento)], { type: "application/json" }));
			if (imagenUrl) {
				data.append("imagenUrl", imagenUrl);
			}

			const token = localStorage.getItem("token");


			const idEvento = form.dataset.idEvento; // ← se lee el atributo que guardamos antes
			const method = idEvento ? "PUT" : "POST";
			const url = idEvento
				? `http://localhost:8080/api/eventos/editar/${idEvento}`
				: `http://localhost:8080/api/eventos/guardar`;

			console.log("Empezando el guardado");

			const resp = await fetch(url, {
				method,
				headers: {
					"Authorization": `Bearer ${token}`
				},
				body: data
			});

			if (!resp.ok) {
				throw new Error(t("eventoErrorGuardar"));
			} else {
				mostrarToast(idEvento ? t("eventoActualizado") : t("eventoCreado"), "success");

				// Limpia
				form.reset();

				// Cierra modal
				bootstrap.Modal.getInstance(document.getElementById("nuevoEventoModal")).hide();

				// Limpiar el formulario

				delete form.dataset.idEvento;
				const modalLabel = document.querySelector("#nuevoEventoModalLabel");
				const btnGuardar = document.querySelector("#btnGuardarEvento");

				if (modalLabel) modalLabel.textContent = t("eventoNuevoTitulo");
				if (btnGuardar) btnGuardar.textContent = t("eventoCrearEvento");

				// Invalidar cache
				eventosCache.length = 0;

				// Forzar recarga
				if (window.mapInstance) {
					cargarEventos(window.mapInstance, { force: true });
				}
				
				if (origen === "admin") {
					
					await initAdminPanel(true);
					
					if (panelModal) panelModal.show();
				}
				else if (origen === "organizador") {
					if (typeof verEventosOrganizador === "function") {
						verEventosOrganizador();
					}
				}

			}
		} catch (err) {
			console.error("❌ Error al guardar:", err);
			alert(t("eventoErrorGuardarDetalle") + err.message);
		} finally {
			const btnGuardar = document.querySelector("#btnGuardarEvento");
			btnGuardar.disabled = false;

			const idEvento = form.dataset.idEvento;
			btnGuardar.textContent = idEvento ? t("eventoGuardarCambios") : t("eventoCrearEvento");
		}
	});

	// TRAER EVENTO PARA EDITAR
	document.getElementById('nuevoEventoModal').addEventListener('show.bs.modal', async (e) => {

		const button = e.relatedTarget;
		if (!button.classList.contains("btn-editar-evento")) {
			// ⬅Se llama a la función limpia
			return; // ⬅️ así NO entra al bloque de edición
		}

		const id = button.dataset.id;
		const origen = button.dataset.origen;
		if (!id) return;

		const form = document.getElementById("formEvento");
		form.dataset.origen = origen;

		try {
			const response = await fetch(`http://localhost:8080/api/eventos/${id}`);

			if (!response.ok) {
				throw new Error(t("eventoErrorObtener"));
			}
			const evento = await response.json();

			preloadRedes(evento.redesSociales || []);

			console.log(evento);

			// 🧩 Cargar valores en los inputs del formulario
			document.getElementById("eventoTitulo").value = evento.titulo || "";
			document.getElementById("eventoDescripcion").value = evento.descripcion || "";
			document.getElementById("eventoCategoriaId").value = evento.categoriaId || "";
			document.getElementById("eventoDireccion").value = evento.ubicacion || "";
			document.getElementById("eventoLatitud").value = evento.ubicacion?.latitud || "";
			document.getElementById("eventoLongitud").value = evento.ubicacion?.longitud || "";
			document.getElementById("eventoLatitud").value = evento.latitud || "";
			document.getElementById("eventoLongitud").value = evento.longitud || "";

			// 📅 Fechas (formato ISO local compatible con input type="datetime-local")
			if (evento.fechaInicio) {
				document.getElementById("eventoFechaInicio").value = evento.fechaInicio.substring(0, 16);
			}
			if (evento.fechaFin) {
				document.getElementById("eventoFechaFin").value = evento.fechaFin.substring(0, 16);
			}

			// 💲 Precio
			document.getElementById("eventoPrecio").value = evento.precio || "";

			// 🔗 URL de venta externa
			document.getElementById("eventoUrlVentaExterna").value = evento.urlVentaExterna || "";

			// 🔞 Verificación de edad
			document.getElementById("eventoRequiereVerificarEdad").checked = evento.requiereVerificarEdad || false;

			// 🖼️ Imagen
			const imagenPreview = document.getElementById("previewImagenEvento");
			if (imagenPreview && evento.imagenUrl) {
				imagenPreview.src = evento.imagenUrl;
				imagenPreview.style.display = "block";
			}

			// 💾 Guardamos el ID del evento en el formulario para saber que estamos editando
			const form = document.getElementById("formEvento");
			form.dataset.idEvento = evento.id;

			// 📝 Cambiar título del modal y texto del botón
			document.querySelector("#tituloModalEvento").textContent = t("eventoEditarTitulo");
			document.querySelector("#btnGuardarEvento").textContent = t("eventoGuardarCambios");




		} catch (error) {
			console.error("Error al cargar evento:", error);
			alert(t("eventoNoCargoInfo"));
		}

	});

	// CONFIRMAR ELIMINACION	

	document.addEventListener("click", (e) => {

		// 🗑️ Botón "Eliminar evento"
		if (e.target.matches(".btn-eliminar-evento")) {
			const eventoId = e.target.dataset.id;
			if (!eventoId) return;

			if (panelModal) {
				panelModal.hide();
			}

			mostrarModalConfirmacion({
				titulo: t("eventoEliminarTitulo"),
				mensaje: `${t("eventoEliminarConfirmacion")} #${eventoId}?`,
				tipo: "danger",
				textoBoton: t("eventoBotonEliminar"),
				onConfirm: async () => {
					try {
						const response = await fetch(
							`http://localhost:8080/api/eventos/eliminar/${eventoId}`,
							{
								method: "DELETE",
								headers: {
									"Authorization": `Bearer ${localStorage.getItem("token")}`
								}
							}
						);

						if (!response.ok) throw new Error(t("eventoErrorEliminar"));

						mostrarToast(t("eventoEliminadoCorrectamente"), "success");

						// Invalidar cache
						eventosCache.length = 0;

						// Forzar recarga
						if (window.mapInstance) {
							cargarEventos(window.mapInstance, { force: true });
						}
						
						await initAdminPanel(true);

						// Recargar lista de eventos del organizador
						if (typeof verEventosOrganizador === "function") {
							verEventosOrganizador();
						}

					} catch (error) {
						console.error("Error al eliminar evento:", error);
						mostrarToast(t("eventoErrorEliminarMostrar"), "danger");
					} finally {
						if (panelModal)
							panelModal.show();
					}
				},
				onCancel: () => {
					if (panelModal)
						panelModal.show();
				}
			});
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