export function renderEstadoEvento(estado) {
  switch (estado) {
    case "ACEPTADO":
      return `<span class="badge bg-success">ACEPTADO</span>`;
    case "RECHAZADO":
      return `<span class="badge bg-danger">RECHAZADO</span>`;
    case "PENDIENTE":
    default:
      return `<span class="badge bg-warning text-dark">PENDIENTE</span>`;
  }
}

export function renderEstadoEventoAdmin(ev) {
  switch (ev.estado) {

    case "PENDIENTE":
      return `
        <button class="btn btn-sm btn-success btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="ACEPTADO">
          Aceptar
        </button>
        <button class="btn btn-sm btn-warning btn-cambiar-estado-evento ms-1"
          data-id="${ev.id}"
          data-estado="RECHAZADO">
          Rechazar
        </button>
      `;

    case "ACEPTADO":
      return `
        <button class="btn btn-sm btn-warning btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="RECHAZADO">
          Rechazar
        </button>
      `;

    case "RECHAZADO":
      return `
        <button class="btn btn-sm btn-success btn-cambiar-estado-evento"
          data-id="${ev.id}"
          data-estado="ACEPTADO">
          Aceptar
        </button>
      `;

    default:
      return '';
  }
}