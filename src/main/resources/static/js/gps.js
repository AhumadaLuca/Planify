import { mostrarToast } from "./toastsGenerico.js";
import { t } from "./i18n.js";

let marcadorUsuario = null;
let circuloPrecision = null;
let watchId = null;
let primeraUbicacionBuena = false;
let ultimoUpdate = Date.now();
let intervaloChequeo = null;
let gpsPerdidoMostrado = false;

export function estaGPSActivo() {
	return watchId !== null;
}


export function initGPS(map) {

	if (!navigator.geolocation) {
		mostrarToast(t("geolocalizacionNoSoportada"), "warning");
		return;
	}

	watchId = navigator.geolocation.watchPosition(
		(position) => actualizarPosicion(position, map),
		manejarError,
		{
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0
		}
	);

	iniciarDetectorGPS(); // 👈 NUEVO
}

export function centrarEnUsuario(map) {
	if (marcadorUsuario) {
		const latLng = marcadorUsuario.getLatLng();
		map.setView(latLng, 16, {
			animate: true,
			duration: 0.5
		});
	}
}

function actualizarPosicion(position, map) {

	ultimoUpdate = Date.now(); // 👈 NUEVO
	gpsPerdidoMostrado = false; // 👈 NUEVO

	const lat = position.coords.latitude;
	const lon = position.coords.longitude;
	const precision = position.coords.accuracy;

	// Limitar radio visual (máx 50m para que no sea enorme)
	const radioVisual = Math.max(Math.min(precision, 50), 15);

	// Solo centrar mapa la primera vez Y si la precisión es aceptable
	if (!primeraUbicacionBuena && precision < 150) {
		map.setView([lat, lon], 16);
		primeraUbicacionBuena = true;
	}

	// Crear marcador si no existe
	if (!marcadorUsuario) {
		marcadorUsuario = L.circleMarker([lat, lon], {
			radius: 8,
			color: '#ffffff',
			weight: 3,
			fillColor: '#1E90FF',
			fillOpacity: 1
		}).addTo(map);

		circuloPrecision = L.circle([lat, lon], {
			radius: radioVisual,
			color: '#1E90FF',
			fillColor: '#1E90FF',
			fillOpacity: 0.12
		}).addTo(map);
	} else {
		// Solo actualizar posición (más eficiente)
		marcadorUsuario.setLatLng([lat, lon]);
		circuloPrecision.setLatLng([lat, lon]);
		circuloPrecision.setRadius(radioVisual);
	}
	if (precision < 15) {
		circuloPrecision.setStyle({ opacity: 0, fillOpacity: 0 });
	} else {
		circuloPrecision.setStyle({ opacity: 1, fillOpacity: 0.2 });
	}
}

function iniciarDetectorGPS() {
	intervaloChequeo = setInterval(() => {
		const ahora = Date.now();

		if (ahora - ultimoUpdate > 15000 && !gpsPerdidoMostrado) {
			mostrarToast(t("gpsPerdido"), "warning");
			gpsPerdidoMostrado = true;
		}
	}, 5000);
}

export function detenerGPS() {

	if (watchId !== null) {
		navigator.geolocation.clearWatch(watchId);
		watchId = null;
	}

	if (intervaloChequeo) {
		clearInterval(intervaloChequeo);
		intervaloChequeo = null;
	}
}

function manejarError(error) {
	console.warn("Error GPS:", error.message);


	switch (error.code) {
		case error.PERMISSION_DENIED:
			mostrarToast(t("gpsPermisoDenegado"), "danger");
			break;

		case error.POSITION_UNAVAILABLE:
			mostrarToast(t("gpsNoDisponible"), "warning");
			break;

		case error.TIMEOUT:
			mostrarToast(t("gpsTimeout"), "warning");
			break;

		default:
			mostrarToast(t("gpsErrorGeneral"), "danger");
	}
}