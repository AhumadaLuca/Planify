package com.eventos.eventos_app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.eventos.eventos_app.dto.OrganizadorAdminDTO;
import com.eventos.eventos_app.models.EstadoEvento;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.repository.OrganizadorRepository;
import com.eventos.eventos_app.services.AdminServicio;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	@Autowired
	private AdminServicio adminServicio;
	
	@Autowired
	private OrganizadorRepository organizadorRepository;
	

	@GetMapping("/organizadoresYeventos")
	@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
	public ResponseEntity<List<OrganizadorAdminDTO>> obtenerEventosYOrganizador(Authentication authentication) {

	    String email = authentication.getName();

	    Organizador admin = organizadorRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("ADMIN_NO_ENCONTRADO"));

	    List<OrganizadorAdminDTO> lista = adminServicio.obtenerOrganizadoresConEventos(admin);

	    return ResponseEntity.ok(lista);
	}

	// Validar evento
	@PutMapping("/eventos/cambiarEstado/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
	public ResponseEntity<?> cambiarEstadoEvento(@PathVariable Long id, @RequestParam("estado") String estado, Authentication authentication) {
		try {
			
			String email = authentication.getName();

			Organizador admin = organizadorRepository.findByEmail(email)
			        .orElseThrow(() -> new RuntimeException("ADMIN_NO_ENCONTRADO"));
			
			EstadoEvento estadoEvento = EstadoEvento.valueOf(estado);
			
			adminServicio.cambiarEstadoEvento(id, estadoEvento, admin);
			return ResponseEntity.ok("CAMBIO_ESTADO_CORRECTO");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}
	
	// Ver organizador
	@GetMapping("/organizadores/ver/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
	public ResponseEntity<?> verOrganizador(
	        @PathVariable Long id,
	        Authentication authentication) {

	    try {

	        String email = authentication.getName();

	        Organizador admin = organizadorRepository.findByEmail(email)
	                .orElseThrow(() -> new RuntimeException("ADMIN_NO_ENCONTRADO"));

	        return ResponseEntity.ok(adminServicio.verOrganizador(id, admin));

	    } catch (RuntimeException e) {

	        if ("NO_PERMISOS_REGION".equals(e.getMessage())) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
	        }

	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	    }
	}

	// Verificar organizador
	@PutMapping("/organizadores/verificar/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
	public ResponseEntity<?> verificarOrganizador(@PathVariable Long id, Organizador admin) {
		try {
			adminServicio.verificarOrganizador(id, admin);
			return ResponseEntity.ok("ORGANIZADOR_VERIFICACION_CORRECTO");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}
	
	// Eliminar organizador y todos sus eventos
	@DeleteMapping("/organizadores/eliminar/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
	public ResponseEntity<?> eliminarOrganizador(@PathVariable Long id, Organizador admin) {
	    try {
	        adminServicio.eliminarOrganizadorConEventos(id, admin);
	        return ResponseEntity.ok("ELIMINAR_ORGANIZADOR_Y_EVENTOS_CORRECTO");
	    } catch (RuntimeException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ " + e.getMessage());
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("⚠️ "+"ERROR_ELIMINAR_ORGANIZADOR");
	    }
	}

}
