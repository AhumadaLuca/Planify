import { formatearFecha } from "./utils.js";
import { dibujarEventosEnMapa, enfocarEventoEnMapa, eventosCache, obtenerIconoCategoria } from './eventos.js';
import { hasEdad } from './verificacionEdad.js';

function filtrarEventosVisibles(eventos) {
  return eventos.filter(e => {
    if (!e.requiereVerificarEdad) return true;
    return hasEdad();
  });
}

export function initBuscadorEventos() {
	const input = document.getElementById("pac-input");
	const panel = document.getElementById("search-results-panel");
	const list = document.getElementById("search-results-list");
	const btnAbrir = document.getElementById("btn-abrir-search");

	let timer;
	let searchWasEmpty = true;

	input.addEventListener("input", () => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			const q = input.value.trim().toLowerCase();

			if (!q) {
				panel.classList.add("d-none");
				dibujarEventosEnMapa(eventosCache);
				searchWasEmpty = true; // 👈 reset cuando vuelve a vacío
				return;
			}
			
			const eventosVisibles = filtrarEventosVisibles(eventosCache);

			const resultados = eventosVisibles.filter(e =>
				e.titulo?.toLowerCase().includes(q) ||
				e.ubicacion?.toLowerCase().includes(q)
			);
			
			

			dibujarEventosEnMapa(resultados);
			renderResultados(resultados);
		}, 250);
	});

	function renderResultados(eventos) {
		list.innerHTML = '';

		if (eventos.length === 0) {
			list.innerHTML = `<li class="text-muted">${t("sinResultados")}</li>`;
			panel.classList.remove("d-none");
			return;
		}

		eventos.forEach(ev => {
			console.log(ev);
			const li = document.createElement("li");
			li.innerHTML = `
        <h6 style="margin:0; font-weight:600; font-size:16px;">${ev.titulo}</h6>
        <p style="margin:0; margin-top:5px;"> ${ev.ubicacion || ''}</p>
        <p style="margin:5px;" font-size:12px;>
          <b>${obtenerIconoCategoria(ev.categoriaNombre)}</b> ${ev.categoriaNombre}
          </p>
        <p style="margin:5px; font-size:16px;">
            <b>📅</b> ${formatearFecha(ev.fechaInicio)}
          </p>
          
      `;

			li.addEventListener("click", () => {
				enfocarEventoEnMapa(ev);
				panel.classList.remove("open");
				
				btnAbrir.classList.add("visible");
				
			});

			list.appendChild(li);
		});

		panel.classList.remove("d-none");
		panel.classList.add("open");

		if (searchWasEmpty) {
			panel.classList.add("first-open");

			panel.addEventListener("animationend", () => {
				panel.classList.remove("first-open");
			}, { once: true });

			searchWasEmpty = false;
		}

	}
}