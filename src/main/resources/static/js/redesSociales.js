export function detectarRedSocialPorTipo(url) {
	if (!url) return 'OTHER';
	try {
		// aseguramos esquema para parsing
		const u = new URL(url.startsWith('http') ? url : 'https://' + url);
		const host = u.hostname.toLowerCase();
		if (host.includes('facebook.com')) return 'FACEBOOK';
		if (host.includes('instagram.com')) return 'INSTAGRAM';
		if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YOUTUBE';
		if (host.includes('twitter.com') || host.includes('x.com')) return 'TWITTER';
		if (host.includes('tiktok.com')) return 'TIKTOK';
		if (host.includes('wa.me') || host.includes('whatsapp.com')) return 'WHATSAPP';
		// si es dominio genérico con www o sin subdominio
		if (host.match(/\.[a-z]{2,}$/)) return 'WEBSITE';
	} catch (e) {
		return 'OTHER';
	}
	return 'OTHER';
}

export function obtenerIconoPorTipo(type) {
	// retorna un string con SVG (icons minimalistas)
	switch (type) {
		case 'FACEBOOK': return `<i class="ti ti-brand-facebook"></i>`;
		case 'INSTAGRAM': return `<i class="ti ti-brand-instagram"></i>`;
		case 'YOUTUBE': return `<i class="ti ti-brand-youtube"></i>`;
		case 'TWITTER': return `<i class="ti ti-brand-x"></i>`;
		case 'TIKTOK': return `<i class="ti ti-brand-facebook"></i>`;
		case 'WHATSAPP': return `<i class="ti ti-brand-tiktok"></i>`;
		default:
			return `<i class="ti ti-link"></i>`;
	}
}

// Normalizar: si no tiene esquema, le agregamos https://
export function normalizarUrl(url) {
	if (!url) return url;
	if (!/^https?:\/\//i.test(url)) {
		return 'https://' + url;
	}
	return url;
}

export function validarUrl(url) {
	if (!url) return false;
	try {
		new URL(normalizarUrl(url));
		return true;
	} catch (e) {
		return false;
	}
}
