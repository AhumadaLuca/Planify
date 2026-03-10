export function mostrarModalConfirmacion({
    titulo = "Confirmar acción",
    mensaje = "¿Estás seguro?",
    tipo = "primary", // primary | danger | warning | success
    textoBoton = "Aceptar",
    onConfirm = () => {},
    onCancel = () => {}
}) {
    const modalEl = document.getElementById("modalConfirmacion");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    // Elementos del modal
    const header = document.getElementById("modalConfirmacionHeader");
    const titleEl = document.getElementById("modalConfirmacionLabel");
    const msgEl = document.getElementById("modalConfirmacionMensaje");
    const btnConfirm = document.getElementById("modalConfirmacionBtn");

    // Aplicar contenido
    titleEl.textContent = titulo;
    msgEl.textContent = mensaje;

    // Estilo del header según tipo
    header.className = "modal-header text-white bg-" + tipo;

    // Texto del botón
    btnConfirm.textContent = textoBoton;
    btnConfirm.className = "btn btn-" + tipo;

    // Quitar listeners anteriores
    const newBtn = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

    let confirmado = false;

    newBtn.addEventListener("click", async () => {
        confirmado = true;
        await onConfirm();
        modal.hide();
    });
    
    // Escuchar cierre
    modalEl.addEventListener("hidden.bs.modal", () => {
        if (!confirmado) {
            onCancel();
        }
    }, { once: true });

    // Mostrar modal
    modal.show();
}