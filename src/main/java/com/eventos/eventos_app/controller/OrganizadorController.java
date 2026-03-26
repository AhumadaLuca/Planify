package com.eventos.eventos_app.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventos.eventos_app.dto.OrganizadorDTO;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.services.AuthServicio;
import com.eventos.eventos_app.services.OrganizadorServicio;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/organizadores")
public class OrganizadorController {

	@Autowired
	private OrganizadorServicio organizadorServicio;

	// Ver organizador
	@GetMapping("/ver/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZADOR')")
	public ResponseEntity<?> verOrganizador(@PathVariable Long id) {
		try {
			return ResponseEntity.ok(organizadorServicio.verOrganizador(id));
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}

	@PutMapping("/editar/{id}")
	public ResponseEntity<?> editarOrganizador(@Valid @PathVariable Long id, @ModelAttribute OrganizadorDTO dto) throws IOException {

		organizadorServicio.editarOrganizador(id, dto);

		return ResponseEntity.ok("PERFIL_ACTUALIZADO");
	}

}
