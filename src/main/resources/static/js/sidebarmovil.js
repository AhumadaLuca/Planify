export function initSidebar() {

  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");

  function cerrarSidebar() {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  document.addEventListener("click", (e) => {

    // Abrir menú
    if (e.target.closest("#mobileMenuBtn")) {
      sidebar?.classList.toggle("open");
      overlay?.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
      return; // IMPORTANTE
    }

    // Cerrar al tocar overlay
    if (e.target.closest(".overlay")) {
      cerrarSidebar();
      return; // IMPORTANTE
    }

    // 🔥 NUEVO: cerrar si se pulsa algo dentro del sidebar (modo móvil)
    if (
      window.matchMedia("(max-width: 768px)").matches &&
       e.target.closest(".sidebar a:not([data-bs-toggle='collapse']), .sidebar button:not(.btn-idioma)")
    ) {
      cerrarSidebar();
    }

  });

}