export function actualizarMenuUsuario() {
	
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");
    const rol = localStorage.getItem("rol");

    const menu = document.getElementById("usuarioMenu");

    menu.innerHTML = ""; // limpiamos el menu

    if (!token) {
        // Usuario NO logueado
        menu.innerHTML = `
            <a href="#" id="linkLogin" data-bs-toggle="modal" data-bs-target="#loginModal" class="menu-item"><i class="ti ti-user-up me-1 fs-5" aria-hidden="true"></i> Iniciar Sesión</a>
            <a href="#" id="linkRegistro" data-bs-toggle="modal" data-bs-target="#registroModal" class="menu-item"><i class="ti ti-user-plus me-1 fs-5" aria-hidden="true"></i> Registrarse</a>
        `;
        return;
    }

    // Usuario logueado
    menu.innerHTML = `
        <span class="d-flex justify-content-center align-items-center text-white fw-semibold mb-2 mt-2" style="margin-right:25px;"><i class="ti ti-mood-happy-filled me-1 fs-3" aria-hidden="true"></i> Hola, ${nombre}</span>
        <a href="#" id="linkPerfil" class="menu-item"><i class="ti ti-user-edit me-1 fs-5" aria-hidden="true"></i> Mi Perfil</a>
        ${rol === "ADMIN" ? `<a href="#" id="linkAdminPanel" data-bs-toggle="modal" data-bs-target="#adminPanelModal" class="menu-item d-flex justify-content-start align-items-start w-100 text-decoration-none gap-2">
			<i class="ti ti-settings me-1 fs-5" aria-hidden="true"></i> Panel Admin</a>` : ""}
			
        ${rol === "ORGANIZADOR" ? `<a href="#" id="linkEventosOrganizador" data-bs-toggle="modal" data-bs-target="#modalAdministrarEventosOrganizador" class="menu-item d-flex justify-content-start align-items-center w-100 text-decoration-none gap-2">
			<i class="ti ti-list-details me-1 fs-5" aria-hidden="true"></i> Mis Eventos</a>` : ""}
			
		${rol === "ORGANIZADOR" ? `<a href="#" id="linkNuevoEvento" data-bs-toggle="modal" data-bs-target="#nuevoEventoModal" class="menu-item d-flex justify-content-start align-items-center w-100 text-decoration-none gap-2">
			<i class="ti ti-circle-plus me-1 fs-5" aria-hidden="true"></i> Agregar Evento</a>` : ""}
        
       <a href="#" id="btnLogout" class="menu-item"><i class="ti ti-user-down me-1 fs-5" aria-hidden="true"></i> Cerrar sesión</a>
    `;

    // Acción logout
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("nombre");
        actualizarMenuUsuario(); 
    });
}