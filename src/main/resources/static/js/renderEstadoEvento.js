import { t } from "./i18n.js";

export function renderEstadoEvento(estado) {
  switch (estado) {
    case "ACEPTADO":
      return `<span class="badge bg-success">${t("estadoEventoAceptado")}</span>`;
    case "RECHAZADO":
      return `<span class="badge bg-danger">${t("estadoEventoRechazado")}</span>`;
    case "PENDIENTE":
    default:
      return `<span class="badge bg-warning text-dark">${t("estadoEventoPendiente")}</span>`;
  }
}

export function renderEstadoEventoAdmin(ev) {
  switch (ev.estado) {

    case "PENDIENTE":
      return `
        <button class="btn btn-sm btn-outline-success fw-bold btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="ACEPTADO">
          ${t("eventoAceptar")}
        </button>
        <button class="btn btn-sm btn-outline-warning fw-bold btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="RECHAZADO">
          ${t("eventoRechazar")}
        </button>
      `;

    case "ACEPTADO":
      return `
        <button class="btn btn-sm btn-outline-warning fw-bold btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="RECHAZADO">
          ${t("eventoRechazar")}
        </button>
      `;

    case "RECHAZADO":
      return `
        <button class="btn btn-sm btn-outline-success fw-bold btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="ACEPTADO">
          ${t("eventoAceptar")}
        </button>
      `;

    default:
      return '';
  }
}