package com.eventos.eventos_app.controller;

import com.eventos.eventos_app.services.EventoServicio;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eventos.eventos_app.dto.EventoRequestDTO;
import com.eventos.eventos_app.dto.EventoResponseDTO;
import com.eventos.eventos_app.models.Evento;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.repository.OrganizadorRepository;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

	@Autowired
	private EventoServicio eventoServicio;

	@Autowired
	private OrganizadorRepository organizadorRepository;

	@PostMapping(value = "/guardar", consumes = { "multipart/form-data" })
	@PreAuthorize("hasRole('ORGANIZADOR')")
	public ResponseEntity<?> crearEvento(@RequestPart("evento") EventoRequestDTO dto,
			@RequestPart(value = "imagenUrl", required = false) MultipartFile imagen, Authentication authentication) {

		try {
			String email = authentication.getName(); // email del organizador logueado
			Organizador organizador = organizadorRepository.findByEmail(email)
					.orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

			EventoResponseDTO nuevo = eventoServicio.crearEvento(dto, imagen, organizador);
			System.out.println(nuevo);
			return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);

		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al crear el evento");
		}
	}

	// READ: Todos los eventos
	@GetMapping
	public ResponseEntity<List<EventoResponseDTO>> listarEventos() {
		List<EventoResponseDTO> eventos = eventoServicio.obtenerTodos();
	    return ResponseEntity
	            .ok()
	            .cacheControl(CacheControl.noCache())
	            .body(eventos);
	}

	@GetMapping("/mis-eventos")
	@PreAuthorize("hasRole('ROLE_ORGANIZADOR')")
	public ResponseEntity<?> obtenerEventosPorOrganizador(Authentication authentication) {
		try {
			String email = (String) authentication.getPrincipal(); // o username
			Organizador organizador = organizadorRepository.findByEmail(email)
					.orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

			List<Evento> eventos = eventoServicio.obtenerEventosPorOrganizador(organizador.getId());

			if (eventos.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No hay eventos registrados.");
			}

			return ResponseEntity.ok(eventos);

		} catch (ClassCastException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("El usuario autenticado no es un organizador.");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al cargar eventos.");
		}
	}

	// READ: Evento por ID
	@GetMapping("/{id}")
	public ResponseEntity<EventoResponseDTO> obtenerEventoPorId(@PathVariable Long id) {
		EventoResponseDTO evento = eventoServicio.obtenerPorId(id);
		return ResponseEntity.ok(evento);
	}

	@PutMapping("/editar/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZADOR')")
	public ResponseEntity<?> actualizarEvento(@PathVariable Long id, @RequestPart("evento") EventoRequestDTO dto,
			@RequestPart(value = "imagenUrl", required = false) MultipartFile imagen, Authentication authentication) {
		try {
			// Obtener organizador autenticado
			String email = authentication.getName();
			Organizador organizador = organizadorRepository.findByEmail(email)
					.orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

			// Actualizar evento
			EventoResponseDTO actualizado = eventoServicio.actualizarEvento(id, dto, imagen, organizador);

			return ResponseEntity.ok(actualizado);

		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al actualizar el evento");
		}

	}
	
	@DeleteMapping("/eliminar/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZADOR')")
	public ResponseEntity<?> eliminarEvento(@PathVariable Long id, Authentication authentication) {
	    try {
	        String email = authentication.getName();
	        Organizador organizador = organizadorRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

	        eventoServicio.eliminarEvento(id, organizador);
	        return ResponseEntity.noContent().build(); // 204

	    } catch (RuntimeException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el evento");
	    }
	}
}