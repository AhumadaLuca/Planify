package com.eventos.eventos_app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import org.springframework.core.io.ClassPathResource;

@Service
public class EmailServicio {
	
	@Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void enviarCorreoRecuperacion(String email, String token){

        try{

            String link = frontendUrl + "/reset-password.html?token=" + token;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            String html = """
            		<!DOCTYPE html>
            		<html>
            		<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

            		<div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:8px;border:1px solid #e5e5e5;overflow:hidden;">

            		    <!-- Header -->
            		    <div style="text-align:center;padding:25px 20px;border-bottom:1px solid #eee;">
            		        <img src="cid:logoPlanify" style="max-width:140px;">
            		    </div>

            		    <!-- Content -->
            		    <div style="padding:30px 25px;color:#333;font-size:15px;line-height:1.6;">

            		        <h2 style="margin-top:0;color:#2c3e50;text-align:center;">
            		            Restablecer contraseña
            		        </h2>

            		        <p>
            		            Recibimos una solicitud para cambiar la contraseña de tu cuenta en <strong>Planify</strong>.
            		        </p>

            		        <p>
            		            Haz clic en el botón para crear una nueva contraseña:
            		        </p>

            		        <div style="text-align:center;margin:30px 0;">
            		            <a href="%s"
            		               style="background:#0d6efd;color:#ffffff;padding:12px 22px;
            		               text-decoration:none;border-radius:6px;font-weight:bold;
            		               display:inline-block;">
            		               Restablecer contraseña
            		            </a>
            		        </div>

            		        <p style="font-size:13px;color:#666;">
            		            Si el botón no funciona, copia y pega este enlace en tu navegador:
            		        </p>

            		        <p style="font-size:12px;color:#888;word-break:break-all;">
            		            %s
            		        </p>

            		        <p style="font-size:13px;color:#666;">
            		            Este enlace expirará en <strong>1 hora</strong> por motivos de seguridad.
            		        </p>

            		        <p style="font-size:13px;color:#666;">
            		            Si no solicitaste este cambio, puedes ignorar este correo.
            		        </p>

            		    </div>

            		    <!-- Footer -->
            		    <div style="text-align:center;font-size:12px;color:#999;padding:20px;border-top:1px solid #eee;">
            		        © 2026 Planify — Plataforma de gestión y difusión de eventos
            		    </div>

            		</div>

            		</body>
            		</html>
            		""".formatted(link, link);

            helper.setTo(email);
            helper.setSubject("Recuperar contraseña");
            helper.setText(html, true);
            
            helper.addInline(
            	    "logoPlanify",
            	    new ClassPathResource("static/assets/icons/planify_circulo_marcado.svg")
            	);

            mailSender.send(message);

        }catch(Exception e){
            e.printStackTrace();
        }
    }

}
