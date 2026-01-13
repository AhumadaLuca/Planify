// eventos.js
import { formatearFecha } from './utils.js';
import { abrirModalDetalle } from "./modalDetallesGenerico.js";

// Cache en memoria (se carga una sola vez por sesión)
export let eventosCache = [];

export async function cargarEventos(map) {
	try {
		// Si ya tenemos caché, usarlo directamente
		if (eventosCache.length > 0) {
			dibujarEventosEnMapa(eventosCache);
			console.log(eventosCache);
			return eventosCache;
		}

		// Si no hay caché → pedir al backend
		const resp = await fetch("http://localhost:8080/api/eventos");
		const eventos = await resp.json();

		// Guardar en caché
		eventosCache = eventos;

		// Dibujar en el mapa
		dibujarEventosEnMapa(eventos);

		return eventos;

	} catch (err) {
		console.error("❌ Error cargando eventos:", err);
	}
}

export function dibujarEventosEnMapa(eventos) {

	if (window.eventMarkersLayer) {
		window.eventMarkersLayer.clearLayers();
	}

	console.log(eventos);

	eventos.forEach(evento => {
		// Crear un div real
		const popupDiv = document.createElement('div');
		popupDiv.style.width = '230px';
		popupDiv.style.fontFamily = "'Inter', sans-serif";
		popupDiv.style.color = '#333';
		popupDiv.style.borderRadius = '8px';
		popupDiv.style.overflow = 'hidden';
		popupDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
		popupDiv.style.background = '#fff';

		// Inner HTML de la imagen y contenido
		popupDiv.innerHTML = `
        ${evento.imagenUrl ? `
          <img src="${evento.imagenUrl}" alt="${evento.titulo}" 
            style="width:100%; height:120px; object-fit:cover; display:block; border-bottom:1px solid #eee;">
        ` : `
          <div style="width:100%; height:120px; background:#ccc;"></div>
        `}
        <div style="padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h6 style="margin:0; font-weight:600; font-size:14px;">${evento.titulo}</h6>
            <span style="font-weight:600; color:#007bff; font-size:13px;">
              ${evento.precio > 0 ? `$${evento.precio}` : 'Gratis'}
            </span>
          </div>
          <p style="margin:5px; font-size:12px;">
            <b>📅</b> ${formatearFecha(evento.fechaInicio)}
          </p>
          <p style="margin:5px;" font-size:12px;>
          <b>${obtenerIconoCategoria(evento.categoria.nombre)}</b> ${evento.categoria.nombre}
          </p>
          <p style="margin:0; margin-top:5px;"><b>Validado:</b> ${evento.validado ? '☑️' : '❌'}</p>
        </div>
      `;

		// Crear botón con listener
		const btn = document.createElement('button');
		btn.className = 'btn btn-sm btn-primary mt-2';
		btn.style.width = '100%';
		btn.style.fontSize = '13px';
		btn.style.borderRadius = '6px';
		btn.style.padding = '4px 0';
		btn.textContent = 'Ver más';
		btn.addEventListener('click', () => verDetalles(evento.id));

		popupDiv.appendChild(btn);

		// Agregar el popup al marker
		L.marker([evento.latitud, evento.longitud])
			.addTo(window.eventMarkersLayer)
			.bindPopup(popupDiv);
	});
}

const iconosPorCategoria = {
	"Música": "🎵",
	"Deporte": "🏅",
	"Teatro": "🎭",
	// Default si la categoría no está definida
	"default": "❓"
};

function obtenerIconoCategoria(nombreCat) {
	return iconosPorCategoria[nombreCat] || iconosPorCategoria.default;
}

export function filtrarEventos({ categorias, precioMax, fechaDesde, fechaHasta }) {

	let filtrados = [...eventosCache];

	console.log("Sin filtrar: ", filtrados);

	// Categorías
	if (Array.isArray(categorias) && categorias.length > 0) {
		filtrados = filtrados.filter(e => categorias.includes(e.categoria.nombre));
	}

	// Precio
	if (precioMax && precioMax > 0) {
		filtrados = filtrados.filter(e => e.precio <= precioMax);
	}

	// Fecha desde
	if (fechaDesde) {
		filtrados = filtrados.filter(e => new Date(e.fechaInicio) >= new Date(fechaDesde));
	}

	// Fecha hasta
	if (fechaHasta) {
		filtrados = filtrados.filter(e => new Date(e.fechaInicio) <= new Date(fechaHasta));
	}

	// Dibujar en el mapa
	dibujarEventosEnMapa(filtrados);

	return filtrados;
}

export async function verDetalles(eventoId, modoAdmin = false) {
	try {
		const res = await fetch(`http://localhost:8080/api/eventos/${eventoId}`);
		if (!res.ok) throw new Error("No se pudo obtener el evento");
		const evento = await res.json();

		console.log(evento);

		abrirModalDetalle({
			titulo: "Detalles del evento",
			cuerpoHTML: `
  <div class="card border-0">
    ${evento.imagenUrl ? `
      <img src="${evento.imagenUrl}" alt="${evento.titulo}" class="card-img-top img-fluid rounded mb-3" style="object-fit:cover; max-height:360px;">
    ` : ''}

    <div class="card-body p-0">
      <h5 class="card-title mb-2">${evento.titulo}</h5>

      <div class="mb-2 d-flex flex-wrap gap-2">
        <span class="badge bg-secondary">${evento.categoriaNombre || 'Sin categoría'}</span>
        ${evento.validado ? '<span class="badge bg-success">Validado</span>' : '<span class="badge bg-danger">No validado</span>'}
      </div>

      <p class="card-text mb-3">${evento.descripcion || ''}</p>

      <ul class="list-unstyled mb-3">
        <li class="d-flex align-items-center mb-2">
          <i class="ti ti-calendar evento-icon me-2" aria-hidden="true"></i>
          <div><strong>Fecha:</strong><br>${formatearFecha(evento.fechaInicio)} - ${formatearFecha(evento.fechaFin)}</div>
        </li>

        <li class="d-flex align-items-center mb-2">
          <i class="ti ti-map-pin evento-icon me-2" aria-hidden="true"></i>
          <div><strong>Ubicación:</strong><br>${evento.ubicacion || 'No especificada'}</div>
        </li>

        <li class="d-flex align-items-center mb-2">
          <i class="ti ti-currency-dollar evento-icon me-2" aria-hidden="true"></i>
          <div><strong>Precio:</strong><br>${evento.precio > 0 ? `$${evento.precio}` : 'Gratis'}</div>
        </li>

        <li class="d-flex align-items-center mb-2">
          <i class="ti ti-shield-check evento-icon me-2" aria-hidden="true"></i>
          <div><strong>Verificación de edad:</strong><br>${evento.requiereVerificarEdad ? 'Sí' : 'No'}</div>
        </li>

        <li class="d-flex align-items-center mb-2">
          <i class="ti ti-user evento-icon me-2" aria-hidden="true"></i>
          <div><strong>Organizador:</strong><br>${evento.nombreOrganizador || 'Desconocido'}</div>
        </li>

        <li class="d-flex align-items-center mb-2">
          <i class="ti ti-progress-help evento-icon me-2" aria-hidden="true"></i>
          <div><strong>Validado:</strong><br>${evento.validado ? '☑️ Sí' : '❌ No'}</div>
        </li>
      </ul>
      	<li class="d-flex align-items-center mb-2">
          <div><i class="ti ti-click me-1 fs-3" aria-hidden="true"></i><strong>Redes Sociales:</strong><br><div id="organizador-redes" class="mt-3" style="display: none;"></div>
          
        </li>

      <div class="d-flex gap-2 mb-3">
        ${evento.urlVentaExterna
					? `<a href="${evento.urlVentaExterna}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="height: 40px; width: 218px;">
               <i class="ti ti-ticket me-1" aria-hidden="true"></i> Comprar entradas
             </a>`
					: `<button class="btn btn-outline-secondary btn-sm" disabled style="height: 40px; width: 218px;">
               <i class="ti ti-ticket me-1" aria-hidden="true"></i> Entradas no disponibles
             </button>`}
      </div>

      ${modoAdmin ? `
        <div class="text-center mt-2">
          <button
            class="btn ${evento.validado ? 'btn-warning' : 'btn-success'} btn-confirmar-validar-evento"
            data-bs-dismiss="modal"
            data-id="${evento.id}"
            data-estado="${evento.validado}">
            ${evento.validado ? 'Invalidar Evento' : 'Validar Evento'}
          </button>
        </div>
      ` : ''}
      
      </div>
    </div>
  </div>

  <style>
    .evento-icon { font-size:1.6rem; width:34px; text-align:center; color:#000; line-height: 1;}
    .card-title { font-weight:600; font-size:1.05rem; }
    .card-text { color:#333; margin-bottom:.75rem; }
    /* Ajustes responsivos menores */
    @media (max-width: 576px) {
      img.card-img-top { max-height:240px; }
    }
  </style>
`, botonesHTML:
				`${modoAdmin

					? `<button class="btn btn-secondary btn-volver-admin" data-bs-dismiss="modal">Volver al Panel</button>`
					: `<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`
				}`
		});

		const redesCont = document.getElementById('organizador-redes');
		if (redesCont) {
			// evento.redesSociales espera un array: [{id, tipo, url}, ...]
			// si tu backend devuelve solo url (strings), transforma a objetos: { url: '...' }
			const redes = Array.isArray(evento.redesSociales)
				? evento.redesSociales
				: (Array.isArray(evento.redes) ? evento.redes : []); // fallback si llama diferente

			if (redes.length > 0) {
				redesCont.style.display = ''; // mostrar
				renderizarRedesSocialesContenedor(redes, redesCont);
			} else {
				// mostrar "Sin links" dentro del contenedor
				redesCont.style.display = '';
				redesCont.innerHTML = '<p class="small-muted">Sin links</p>';
			}
		}

		if (modoAdmin) {
			modalFooter.querySelector(".btn-volver-admin").addEventListener("click", () => {
				// detalleModal.hide();
				const modalAdmin = new bootstrap.Modal(document.getElementById("adminPanelModal"));
				modalAdmin.show();
			});
		}

	} catch (err) {
		console.error("Error cargando detalle del evento:", err);
	}
}

export async function verEventosOrganizador() {
	const token = localStorage.getItem('token');
	const tabla = document.getElementById("tablaEventosOrganizador").querySelector("tbody");

	tabla.innerHTML = "<tr><td colspan='8' class='text-center'>Cargando eventos...</td></tr>";

	try {
		const response = await fetch("http://localhost:8080/api/eventos/mis-eventos", {
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if (!response.ok) {
			tabla.innerHTML = "<tr><td colspan='8' class='text-center text-danger'>Error al obtener los eventos.</td></tr>";
			return;
		}

		const text = await response.text();

		if (!text) {
			tabla.innerHTML = "<tr><td colspan='8' class='text-center'>No hay eventos cargados.</td></tr>";
			return;
		}

		const eventos = JSON.parse(text);

		// Limpio la tabla antes de llenar
		tabla.innerHTML = "";

		// Recorro y agrego cada evento
		eventos.forEach(evento => {
			const fila = document.createElement("tr");
			const redesHtml = tablasRedesSociales(evento.redesSociales || evento.redes || []);
			console.log(evento);
			fila.innerHTML = `
        <td>${evento.titulo || "-"}</td>
        <td>${evento.descripcion || "-"}</td>
        <td>${evento.categoria.nombre || "-"}</td>
        <td>${evento.ubicacion || "-"}</td>
        <td>${formatearFecha(evento.fechaCreacion)}</td>
    	<td>${formatearFecha(evento.fechaInicio)}</td>
    	<td>${formatearFecha(evento.fechaFin)}</td>
        <td>
          ${evento.imagenUrl ? `<img src="${evento.imagenUrl}" alt="Imagen" style="max-width: 100px; border-radius: 6px;">` : "-"}
        </td>
        <td>${evento.precio ? "$" + evento.precio : "Gratis"}</td>
        <td>
          ${evento.urlVentaExterna ? `<a href="${evento.urlVentaExterna}" target="_blank" rel="noopener noreferrer">Ver enlace</a>` : "No disponible"}
        </td>
        <td>${evento.requiereVerificarEdad ? "Sí" : "No"}</td>
        <td>${evento.validado ? "Sí" : "No"}</td>
        <td>
      ${redesHtml}
    </td>
        <td>
          <button class="btn btn-warning btn-sm btn-editar-evento" data-bs-toggle="modal" data-bs-target="#nuevoEventoModal" data-id="${evento.id}">Editar</button>
          <button class="btn btn-danger btn-sm btn-eliminar-evento" data-id="${evento.id}">Eliminar</button>
        </td>
      `;

			tabla.appendChild(fila);
		});

	} catch (error) {
		console.error("Error al cargar eventos:", error);
		tabla.innerHTML = "<tr><td colspan='8' class='text-center text-danger'>Error de conexión al servidor.</td></tr>";
	}
}

function renderizarRedesSocialesContenedor(redesArray, containerElement) {
	containerElement.innerHTML = ''; // limpiar
	if (!Array.isArray(redesArray) || redesArray.length === 0) {
		containerElement.innerHTML = '<p class="small-muted">Sin links</p>';
		return;
	}
	const list = document.createElement('div');
	list.className = 'd-flex gap-2 flex-wrap align-items-center';
	redesArray.forEach(s => {
		const tipo = s.tipo || detectarRedSocialPorTipo(s.url);
		const link = document.createElement('a');
		link.href = normalizarUrl(s.url);
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.className = 'd-flex align-items-center gap-2 px-2 py-1 rounded border';
		link.style.textDecoration = 'none';
		link.style.color = 'inherit';

		const iconWrapper = document.createElement('span');
		iconWrapper.innerHTML = obtenerIconoPorTipo(tipo);

		const label = document.createElement('span');
		// puedes mostrar nombre corto por tipo o el host
		const labelText = tipo !== 'WEBSITE' && tipo !== 'OTHER' ? tipo.toLowerCase() : (new URL(normalizarUrl(s.url))).hostname;
		label.textContent = labelText;

		link.appendChild(iconWrapper);
		link.appendChild(label);
		list.appendChild(link);
	});
	containerElement.appendChild(list);
}

// ------------------ Helpers: detección y SVG icons ------------------
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

function obtenerIconoPorTipo(type) {
	// retorna un string con SVG (icons minimalistas)
	switch (type) {
		case 'FACEBOOK': return `<i class="ti ti-brand-facebook"></i>`;
		case 'INSTAGRAM': return `<i class="ti ti-brand-instagram"></i>`;
		case 'YOUTUBE': return `<i class="ti ti-brand-youtube"></i>`;
		case 'TWITTER': return `<i class="ti ti-brand-x"></i>`;
		case 'TIKTOK': return `<i class="ti ti-brand-facebook"></i>`;
		case 'WHATSAPP': return `<i class="ti ti-brand-tiktok"></i>`;
		default:
			return `<i class="ti ti-link"></i>`;
	}
}

// Normalizar: si no tiene esquema, le agregamos https://
function normalizarUrl(url) {
	if (!url) return url;
	if (!/^https?:\/\//i.test(url)) {
		return 'https://' + url;
	}
	return url;
}

function tablasRedesSociales(redes) {
  if (!Array.isArray(redes) || redes.length === 0) return '—';

  // Aseguramos que la estructura sea [{url, tipo, id?}] o strings
  const items = redes.map(r => typeof r === 'string' ? { url: r } : r);

  // Generamos pequeños badges (limitamos a 6 y mostramos "+N" si hay más)
  const maxShow = 6;
  const visibles = items.slice(0, maxShow);
  const extra = items.length - visibles.length;

  const parts = visibles.map(it => {
    const url = normalizarUrl(it.url);
    const tipo = it.tipo || detectarRedSocialPorTipo(url);
    // Escapamos texto de hostname para label (no el URL)
    let label;
    try {
      label = new URL(url).hostname;
    } catch (e) {
      label = url;
    }

    // Si está Tabler disponible usamos data-tabler-icon; si no fallback a SVG
    if (window.tablerIcons && typeof window.tablerIcons.createIcons === 'function') {
      const ti = getTablerIconName(tipo);
      // el <i> se convertirá en SVG cuando llames tablerIcons.createIcons()
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="d-inline-flex align-items-center gap-1 px-2 py-1 me-1 mb-1 rounded border text-decoration-none" title="${label}"><i data-tabler-icon="${ti}" style="width:18px;height:18px"></i><span class="small">${label}</span></a>`;
    } else {
      // fallback con svg inline
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="d-inline-flex align-items-center gap-1 px-2 py-1 me-1 mb-1 rounded border text-decoration-none" title="${label}">${obtenerIconoPorTipo(tipo)}<span class="small ms-1">${label}</span></a>`;
    }
  });

  if (extra > 0) parts.push(`<span class="badge bg-light text-muted">+${extra}</span>`);

  return parts.join('');
}

