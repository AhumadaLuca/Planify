
import { cargarEventos } from './eventos.js';
import { verEventosOrganizador } from './eventos.js';
import { mostrarToast } from './toastsGenerico.js';
import { mostrarModalConfirmacion } from "./confirmarGenerico.js";
import { limpiarFormularioGenerico } from "./limpiezaFormGenerico.js";

export function initFormularioEvento() {

	document.getElementById("nuevoEventoModal").addEventListener("hidden.bs.modal", () => {
		console.log("🧹 Cerrando MODAL — limpiando formulario de evento...");
		limpiarFormularioGenerico("#formEvento", {
			idTitulo: "tituloModalEvento",
			textoTitulo: "Nuevo Evento",
			idBoton: "btnGuardarEvento",
			textoBoton: "Crear Evento",
			previewImagenSelector: "#previewImagenEvento"
		});
	});

	const form = document.getElementById("formEvento");
	if (!form) return;

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

	// ------------------ Helpers y UI Redes Sociales ------------------
	function obtenerIconoPorTipo(type) {
	// retorna un string con SVG (icons minimalistas)
	switch (type) {
		case 'FACEBOOK': return `<i class="ti ti-brand-facebook fs-3"></i>`;
		case 'INSTAGRAM': return `<i class="ti ti-brand-instagram fs-3"></i>`;
		case 'YOUTUBE': return `<i class="ti ti-brand-youtube fs-3"></i>`;
		case 'TWITTER': return `<i class="ti ti-brand-x fs-3"></i>`;
		case 'TIKTOK': return `<i class="ti ti-brand-facebook fs-3"></i>`;
		case 'WHATSAPP': return `<i class="ti ti-brand-tiktok fs-3"></i>`;
		default:
			return `<i class="ti ti-link"></i>`;
	}
}
	
	function detectarRedSocialPorTipo(url) {
		if (!url) return 'OTHER';
		try {
			// aseguramos esquema para parsing
			const u = new URL(url.startsWith('http') ? url : 'https://' + url);
			const host = u.hostname.toLowerCase();
			if (host.includes('facebook.com')) return 'FACEBOOK';
			if (host.includes('instagram.com')) return 'INSTAGRAM';
			if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YOUTUBE';
			if (host.includes('twitter.com') || host.includes('x.com')) return 'TWITTER';
			if (host.includes('tiktok.com')) return 'TIKTOK';
			if (host.includes('wa.me') || host.includes('whatsapp.com')) return 'WHATSAPP';
			// si es dominio genérico con www o sin subdominio
			if (host.match(/\.[a-z]{2,}$/)) return 'WEBSITE';
		} catch (e) {
			return 'OTHER';
		}
		return 'OTHER';
	}


	// Normalizar: si no tiene esquema, le agregamos https://
	function normalizarUrl(url) {
		if (!url) return url;
		if (!/^https?:\/\//i.test(url)) {
			return 'https://' + url;
		}
		return url;
	}

	function validarUrl(url) {
		if (!url) return false;
		try {
			new URL(normalizarUrl(url));
			return true;
		} catch (e) {
			return false;
		}
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
			alert(`Máximo ${MAX_LINKS} links permitidos.`);
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
		// icono de placeholder (puedes usar Tabler aquí)
		iconBox.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14h-2v-2h2zm0-4h-2V6h2z"/></svg>`;

		const input = document.createElement('input');
		input.type = 'url';
		input.className = 'form-control red-url-input';
		input.placeholder = 'https://ejemplo.com/mi-perfil';
		input.setAttribute('aria-label', 'Link de red social o página web');

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
				// Si querés usar Tabler, aquí podés crear <i data-tabler-icon="brand-instagram">...
				// Ejemplo simple: dejar title y no cambiar el SVG por ahora.
			}, 220);
		});

		if (data && data.url) {
			input.value = data.url;
			iconBox.title = detectarRedSocialPorTipo(data.url);
		}

		const btnRemove = document.createElement('button');
		btnRemove.type = 'button';
		btnRemove.className = 'btn btn-link btn-remove-link p-1 text-danger';
		btnRemove.title = 'Eliminar link';
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
				throw new Error(`URL inválida: ${raw}`);
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

		const btnGuardar = document.querySelector("#btnGuardarEvento");
		btnGuardar.disabled = true;
		btnGuardar.textContent = "Guardando...";
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
			if (!titulo) { showFieldError("eventoTitulo", "El título es obligatorio"); hasError = true; }
			if (!descripcion) { showFieldError("eventoDescripcion", "La descripción es obligatoria"); hasError = true; }

			if (isNaN(categoriaId)) { showFieldError("eventoCategoriaId", "Seleccione una categoria"); hasError = true; }

			const now = new Date();
			const fechaInicioDate = new Date(fechaInicio);
			const fechaFinDate = new Date(fechaFin);
			if (isNaN(fechaInicioDate) || isNaN(fechaFinDate)) {
				showFieldError("eventoFechaInicio", "Debes ingresar fechas válidas");
				hasError = true;
			} else {
				if (fechaInicioDate < now) { showFieldError("eventoFechaInicio", "La fecha de inicio no puede estar en el pasado"); hasError = true; }
				if (fechaFinDate <= fechaInicioDate) { showFieldError("eventoFechaFin", "La fecha de fin debe ser posterior a la fecha de inicio"); hasError = true; }
			}

			if (!ubicacion) { showFieldError("eventoDireccion", "La dirección es obligatoria"); hasError = true; }
			if (isNaN(latitud) || isNaN(longitud)) { showFieldError("eventoDireccion", "Selecciona una ubicación en el mapa"); hasError = true; }

			if (precio !== "" && (isNaN(precio) || precio < 0)) {
				showFieldError("eventoPrecio", "El precio debe ser un número válido o vacío si es gratis");
				hasError = true;
			}

			// Validación URL
			if (urlVentaExterna) {
				try { new URL(urlVentaExterna); }
				catch { showFieldError("eventoUrlVentaExterna", "La URL externa no es válida"); hasError = true; }
			}

			// Validación imagen
			console.log("dataset id:", form.dataset.idEvento);
			console.log("esEdicion:", esEdicion);
			if (imagenUrl) {
				const validExt = ["image/jpeg", "image/png", "image/webp"];

				if (!validExt.includes(imagenUrl.type)) {
					showFieldError("eventoImagen", "Formato de imagen inválido (JPG, PNG o WEBP)");
					hasError = true;
				}
				if (imagenUrl.size > 2 * 1024 * 1024) {
					showFieldError("eventoImagen", "La imagen no debe superar los 2MB");
					hasError = true;
				}
				const ok = await validarDimensionesImagen(imagenUrl);
				if (!ok) { showFieldError("eventoImagen", "La imagen debe ser mínimo 150x150 pixeles"); hasError = true; }
			} else if (!esEdicion) {
				showFieldError("eventoImagen", "Debe ingresar una imagen obligatoriamente del evento");
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
				btnGuardar.textContent = esEdicion ? "Guardar Cambios" : "Crear Evento";
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
				throw new Error("Error al guardar el evento");
			} else {
				mostrarToast(idEvento ? "Evento actualizado ✅" : "Evento creado ✅", "success");

				// Limpia
				form.reset();

				// Cierra modal
				bootstrap.Modal.getInstance(document.getElementById("nuevoEventoModal")).hide();

				// Limpiar el formulario

				delete formEvento.dataset.idEvento;
				const modalLabel = document.querySelector("#nuevoEventoModalLabel");
				const btnGuardar = document.querySelector("#btnGuardarEvento");

				if (modalLabel) modalLabel.textContent = "Nuevo Evento";
				if (btnGuardar) btnGuardar.textContent = "Crear Evento";
				//Refrescamos mapa
				if (window.mapInstance) {
					cargarEventos(window.mapInstance);
				}
			}
		} catch (err) {
			console.error("❌ Error al guardar:", err);
			alert("Error al guardar el evento: " + err.message);
		} finally {
			const btnGuardar = document.querySelector("#btnGuardarEvento");
			btnGuardar.disabled = false;

			const idEvento = form.dataset.idEvento;
			btnGuardar.textContent = idEvento ? "Guardar Cambios" : "Crear Evento";
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
		if (!id) return;

		try {
			const response = await fetch(`http://localhost:8080/api/eventos/${id}`);

			if (!response.ok) {
				throw new Error("No se pudo obtener el evento");
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
			document.querySelector("#tituloModalEvento").textContent = "Editar Evento";
			document.querySelector("#btnGuardarEvento").textContent = "Guardar Cambios";



		} catch (error) {
			console.error("Error al cargar evento:", error);
			alert("No se pudo cargar la información del evento");
		}

	});

	// CONFIRMAR ELIMINACION	

	document.addEventListener("click", (e) => {

		// 🗑️ Botón "Eliminar evento"
		if (e.target.matches(".btn-eliminar-evento")) {
			const eventoId = e.target.dataset.id;
			if (!eventoId) return;

			mostrarModalConfirmacion({
				titulo: "Eliminar evento",
				mensaje: `¿Seguro que deseas eliminar el evento #${eventoId}?`,
				tipo: "danger",
				textoBoton: "Eliminar",
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

						if (!response.ok) throw new Error("No se pudo eliminar el evento");

						mostrarToast("✅ Evento eliminado correctamente", "success");

						// Refrescar mapa
						if (window.mapInstance) {
							cargarEventos(window.mapInstance);
						}

						// Recargar lista de eventos del organizador
						if (typeof verEventosOrganizador === "function") {
							verEventosOrganizador();
						}

					} catch (error) {
						console.error("Error al eliminar evento:", error);
						mostrarToast("❌ Ocurrió un error al intentar eliminar el evento", "danger");
					}
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