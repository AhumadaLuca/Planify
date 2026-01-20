const panel = document.getElementById("search-results-panel");
const btnMinimizar = document.getElementById("btn-minimizar-search");
const btnAbrir = document.getElementById("btn-abrir-search");

btnMinimizar.addEventListener("click", () => {
	panel.classList.remove("open");
	btnAbrir.classList.add("visible");
});

btnAbrir.addEventListener("click", () => {
	panel.classList.add("open");
	btnAbrir.classList.remove("visible");
});