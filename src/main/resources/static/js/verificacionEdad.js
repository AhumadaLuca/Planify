const EDAD_LLAVE = "edad_verificada";

export function hasEdad() {
  return localStorage.getItem(EDAD_LLAVE) === "true";
}

export function setEdad() {
  localStorage.setItem(EDAD_LLAVE, "true");
}

export function clearEdad() {
  localStorage.removeItem(EDAD_LLAVE);
}