package com.eventos.eventos_app.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.eventos.eventos_app.config.JwtConfig;
import com.eventos.eventos_app.dto.LoginOrgRequestDTO;
import com.eventos.eventos_app.dto.LoginOrgResponseDTO;
import com.eventos.eventos_app.dto.RegistroOrgRequestDTO;
import com.eventos.eventos_app.dto.RegistroOrgResponseDTO;
import com.eventos.eventos_app.models.ContraToken;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.models.Rol;
import com.eventos.eventos_app.repository.ContraTokenRepository;
import com.eventos.eventos_app.repository.OrganizadorRepository;

import io.github.bucket4j.Bucket;

@Service
public class AuthServicio {

	@Autowired
	private OrganizadorRepository orgRepository;

	@Autowired
	private JwtConfig jwt;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private ContraTokenRepository ctRepository;
	
	@Autowired
	private EmailServicio emailServicio;
	
	@Autowired
	private RateLimit rateLimitServicio;

	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	public RegistroOrgResponseDTO registrar(RegistroOrgRequestDTO dto, MultipartFile imagen, String ip) throws IOException {
		
		String key = "REGISTRO_" + ip;

		Bucket bucket = rateLimitServicio.resolveBucket(key, 3, 1);

		if (!bucket.tryConsume(1)) {
		    throw new RuntimeException("DEMASIADOS_INTENTOS_REGISTROS");
		}

	    String email = dto.email.trim().toLowerCase();

	    if (orgRepository.existsByEmail(email)) {
	        throw new RuntimeException("EMAIL_EXISTE");
	    }

		Organizador o = new Organizador();
		o.setNombre(limpiar(dto.nombre));
		o.setApellido(limpiar(dto.apellido));
		o.setTelefono(limpiar(dto.telefono));
		o.setNombreOrganizacion(limpiar(dto.nombreOrganizacion));
		o.setDireccionOrganizacion(limpiar(dto.direccionOrganizacion));
		o.setEmail(dto.email);
		o.setClave(encoder.encode(dto.password));
		o.setFechaNacimiento(dto.fechaNacimiento);
		o.setFotoPerfil(dto.fotoPerfil);
		o.setVerificado(false);
		o.setRol(Rol.ORGANIZADOR);

	    // 📸 Manejo seguro de imagen
	    if (imagen != null && !imagen.isEmpty()) {

	        // Validar tamaño (2MB)
	        if (imagen.getSize() > 2 * 1024 * 1024) {
	            throw new RuntimeException("IMAGEN_MUY_GRANDE");
	        }

	        // Obtener extensión segura
	        String original = imagen.getOriginalFilename();
	        String extension = original.substring(original.lastIndexOf(".")).toLowerCase();

	        if (!extension.equals(".jpg") && !extension.equals(".jpeg") && !extension.equals(".png")) {
	            throw new RuntimeException("FORMATO_INVALIDO");
	        }

	        // Nombre seguro
	        String nombreArchivo = UUID.randomUUID() + extension;

	        // Ruta externa (IMPORTANTE)
	        Path ruta = Paths.get("uploads/" + nombreArchivo);

	        Files.createDirectories(ruta.getParent()); // crea carpeta si no existe
	        Files.copy(imagen.getInputStream(), ruta);

	        o.setFotoPerfil("/uploads/" + nombreArchivo);
	    }

	    Organizador saved = orgRepository.save(o);

	    return new RegistroOrgResponseDTO(
	            saved.getId(),
	            saved.getNombre(),
	            saved.getApellido(),
	            saved.getEmail(),
	            saved.getTelefono(),
	            saved.getFechaNacimiento(),
	            saved.getNombreOrganizacion(),
	            saved.getDireccionOrganizacion(),
	            saved.getFotoPerfil(),
	            saved.getVerificado(),
	            saved.getRol().name()
	    );
	}
	


	public LoginOrgResponseDTO login(LoginOrgRequestDTO dto, String ip) {

	    String key = dto.email + "_" + ip; // combinación segura

	    Bucket bucket = rateLimitServicio.resolveBucket(key, 5, 1);

	    if (!bucket.tryConsume(1)) {
	        throw new RuntimeException("DEMASIADOS_INTENTOS_LOGIN");
	    }

	    String email = dto.email.trim().toLowerCase();

	    Organizador o = orgRepository.findByEmail(email)
	            .orElseThrow(() -> new IllegalArgumentException("USUARIO_CONTRASEÑA_INCORRECTOS"));

	    if (!encoder.matches(dto.password, o.getClave())) {
	        throw new IllegalArgumentException("USUARIO_CONTRASEÑA_INCORRECTOS");
	    }

	    String token = jwt.generarToken(o.getEmail(), o.getRol().name());

	    return new LoginOrgResponseDTO(o.getId(), token, o.getNombre(), o.getRol().name());
	}
	
    public void crearToken(String email) {
    	
    	String key = "RECUPERAR_" + email;

    	Bucket bucket = rateLimitServicio.resolveBucket(key, 1, 1);

    	if (!bucket.tryConsume(1)) {
    	    throw new RuntimeException("DEMASIADOS_INTENTOS_RECUPERAR_CONTRASEÑA");
    	}

        Optional<Organizador> orgOpt = orgRepository.findByEmail(email);

        if(orgOpt.isEmpty()){
            return; // seguridad: no revelar si existe
        }

        Organizador org = orgOpt.get();
        
        Optional<ContraToken> existingToken = ctRepository.findByOrganizador(org);

        if(existingToken.isPresent()) {

            ContraToken tokenDB = existingToken.get();

            // si el token NO expiró todavía
            if(tokenDB.getExpiryDate().isAfter(LocalDateTime.now())) {

                throw new RuntimeException(
                    "SOLICITUD_RECUPERACION_ACTIVA"
                );
            }

            // si expiró lo eliminamos
            ctRepository.delete(tokenDB);
        }
        
        ctRepository.deleteByOrganizador(org);

        String token = UUID.randomUUID().toString();

        ContraToken resetToken = new ContraToken();
        resetToken.setToken(token);
        resetToken.setOrganizador(org);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        

        ctRepository.save(resetToken);

        emailServicio.enviarCorreoRecuperacion(org.getEmail(), token);

    }

    public void resetPassword(String token, String newPassword){

    	ContraToken resetToken =
                ctRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("TOKEN_INVALIDO"));

        if(resetToken.getExpiryDate().isBefore(LocalDateTime.now())){
            throw new RuntimeException("TOKEN_EXPIRADO");
        }

        Organizador org = resetToken.getOrganizador();

        org.setClave(passwordEncoder.encode(newPassword));

        orgRepository.save(org);

        ctRepository.delete(resetToken);

    }
    
    private String limpiar(String input) {
        if (input == null) return null;

        String limpio = Jsoup.clean(input, Safelist.none()).trim();
        return limpio.isEmpty() ? null : limpio;
    }

}
