import { t } from "./i18n.js";

export function recuperarContra() {

	document.getElementById("recuperarPassword")
		.addEventListener("submit", async (e) => {

			e.preventDefault();

			const email = document.getElementById("forgotEmail").value;

			const btn = document.getElementById("btnRecuperar");
			const spinner = document.getElementById("btnRecuperarSpinner");
			const texto = document.getElementById("btnRecuperarTexto");

			const msg = document.getElementById("forgotMsg");

			btn.disabled = true;
			spinner.classList.remove("d-none");
			texto.innerText = "Enviando...";

			try {

				const res = await fetch("/api/auth/forgot-password", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ email })
				});

				msg.classList.remove("d-none", "alert-danger", "alert-success");

				if (res.ok) {

					msg.classList.add("alert-success");
					msg.innerText = t("correoInstrucciones");

				} else {

					const error = await res.text();

					msg.classList.add("alert-danger");
					msg.innerText = error;

				}

			} catch (err) {

				msg.classList.remove("d-none");
				msg.classList.add("alert-danger");
				msg.innerText = t("errorSolicitud");

			} finally {

				btn.disabled = false;
				spinner.classList.add("d-none");
				texto.innerText = t("enviar");

			}
		});

	const modal = document.getElementById("recuperarPassword");

	modal.addEventListener("hidden.bs.modal", () => {

		document.getElementById("forgotEmail").value = "";

		msg.classList.add("d-none");
		msg.classList.remove("alert-success", "alert-danger");
		msg.innerText = "";

	});

}