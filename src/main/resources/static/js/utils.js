// utils.js
export function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}
export function formatearHora(horaStr) {
	if (!horaStr) return "-";
	return horaStr.slice(0, 5); // "17:49"
}