export let traducciones = {};

export async function cargarIdioma(idioma) {

    const res = await fetch(`/i18n/${idioma}.json`);
    traducciones = await res.json();

    traducirPagina();

    localStorage.setItem("idioma", idioma);
}

export function traducirPagina() {

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (traducciones[key]) {
            el.textContent = traducciones[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (traducciones[key]) {
            el.placeholder = traducciones[key];
        }
    });
}

export function t(key) {
    return traducciones[key] || key;
}