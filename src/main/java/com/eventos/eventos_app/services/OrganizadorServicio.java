package com.eventos.eventos_app.services;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.nio.file.Files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.eventos.eventos_app.dto.OrganizadorDTO;
import com.eventos.eventos_app.dto.OrganizadorPerfilDTO;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.repository.OrganizadorRepository;

import io.github.bucket4j.Bucket;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrganizadorServicio {
	
	 @Autowired
	    private OrganizadorRepository organizadorRepository;
	 
		@Autowired
		private RateLimit rateLimitServicio;
	
	 public OrganizadorPerfilDTO verOrganizador(Long id){

		    Organizador o = organizadorRepository.findById(id)
		        .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ECONTRADO"));

		    OrganizadorPerfilDTO dto = new OrganizadorPerfilDTO();

		    dto.setId(o.getId());
		    dto.setNombre(o.getNombre());
		    dto.setApellido(o.getApellido());
		    dto.setEmail(o.getEmail());
		    dto.setTelefono(o.getTelefono());
		    dto.setFechaNacimiento(o.getFechaNacimiento());
		    dto.setNombreOrganizacion(o.getNombreOrganizacion());
		    dto.setDireccionOrganizacion(o.getDireccionOrganizacion());
		    dto.setFotoPerfil(o.getFotoPerfil());
		    dto.setRol(o.getRol());
		    dto.setFechaRegistro(o.getFechaRegistro());
		    dto.setVerificado(o.getVerificado());

		    return dto;
		}
	
    public Organizador editarOrganizador(Long id, OrganizadorDTO dto) throws java.io.IOException {

        Organizador org = organizadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ECONTRADO"));
        
        String key = "EDITAR_PERFIL_" + org.getId();

        Bucket bucket = rateLimitServicio.resolveBucket(key, 1, 1);

		if (!bucket.tryConsume(1)) {
		    throw new RuntimeException("EDICION_RAPIDA_ORGANIZADOR");
		}

        // actualizar campos
        org.setNombre(dto.getNombre());
        org.setApellido(dto.getApellido());
        org.setTelefono(dto.getTelefono());
        org.setFechaNacimiento(dto.getFechaNacimiento());
        org.setNombreOrganizacion(dto.getNombreOrganizacion());
        org.setDireccionOrganizacion(dto.getDireccionOrganizacion());

        MultipartFile imagen = dto.getImagen();
        
        if (org.getFotoPerfil() != null) {

            String rutaVieja = "src/main/resources/static" + org.getFotoPerfil();

            try {
                Files.deleteIfExists(Paths.get(rutaVieja));
            } catch (IOException ignored) {}
        }

        if (imagen != null && !imagen.isEmpty()) {

    			String extension = imagen.getOriginalFilename()
    				    .substring(imagen.getOriginalFilename().lastIndexOf("."))
    				    .toLowerCase();

    				if (!extension.equals(".jpg") && !extension.equals(".png") && !extension.equals(".jpeg")) {
    				    throw new RuntimeException("IMAGEN_INVALIDO");
    				}
    				if (imagen.getSize() > 2 * 1024 * 1024) { // 2MB
    				    throw new RuntimeException("IMAGEN_GRANDE");
    				}

    				String nombreArchivo = UUID.randomUUID() + extension;

                Path ruta = Paths.get("uploads/" + nombreArchivo);

                Files.copy(imagen.getInputStream(), ruta);

                org.setFotoPerfil("/uploads/" + nombreArchivo);
        }

        return organizadorRepository.save(org);
    }

}

