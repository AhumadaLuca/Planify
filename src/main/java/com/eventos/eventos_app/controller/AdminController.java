package com.eventos.eventos_app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.eventos.eventos_app.dto.OrganizadorAdminDTO;
import com.eventos.eventos_app.models.EstadoEvento;
import com.eventos.eventos_app.services.AdminServicio;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	@Autowired
	private AdminServicio adminServicio;
	

	@GetMapping("/organizadoresYeventos")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<OrganizadorAdminDTO>> obtenerEventosYOrganizador() {
		List<OrganizadorAdminDTO> lista = adminServicio.obtenerOrganizadoresConEventos();
		return ResponseEntity.ok(lista);
	}

	// Validar evento
	@PutMapping("/eventos/cambiarEstado/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> cambiarEstadoEvento(@PathVariable Long id, @RequestParam("estado") String estado) {
		try {
			
			EstadoEvento estadoEvento = EstadoEvento.valueOf(estado);
			
			adminServicio.cambiarEstadoEvento(id, estadoEvento);
			return ResponseEntity.ok("Cambio de estado correctamente");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}
	
	// Ver organizador
		@GetMapping("/organizadores/ver/{id}")
		@PreAuthorize("hasRole('ADMIN')")
		public ResponseEntity<?> verOrganizador(@PathVariable Long id) {
			try {
				return ResponseEntity.ok(adminServicio.verOrganizador(id));
			} catch (RuntimeException e) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
			}
		}

	// Verificar organizador
	@PutMapping("/organizadores/verificar/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> verificarOrganizador(@PathVariable Long id) {
		try {
			adminServicio.verificarOrganizador(id);
			return ResponseEntity.ok("Organizador verificado correctamente");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}
	
	// Eliminar organizador y todos sus eventos
	@DeleteMapping("/organizadores/eliminar/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> eliminarOrganizador(@PathVariable Long id) {
	    try {
	        adminServicio.eliminarOrganizadorConEventos(id);
	        return ResponseEntity.ok("✅ Organizador y sus eventos eliminados correctamente");
	    } catch (RuntimeException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ " + e.getMessage());
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("⚠️ Error al eliminar el organizador");
	    }
	}

}
