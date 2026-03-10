import { mostrarToast } from "./toastsGenerico.js";
import { t } from "./i18n.js";

let marcadorUsuario = null;
let circuloPrecision = null;
let watchId = null;
let primeraUbicacionBuena = false;

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

function manejarError(error) {
	console.warn("Error GPS:", error.message);
}