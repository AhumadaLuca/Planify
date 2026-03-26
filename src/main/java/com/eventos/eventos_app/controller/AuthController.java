package com.eventos.eventos_app.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eventos.eventos_app.dto.LoginOrgRequestDTO;
import com.eventos.eventos_app.dto.LoginOrgResponseDTO;
import com.eventos.eventos_app.dto.RegistroOrgResponseDTO;
import com.eventos.eventos_app.dto.cambiarContraRequest;
import com.eventos.eventos_app.dto.recuperarContraRequest;
import com.eventos.eventos_app.dto.RegistroOrgRequestDTO;
import com.eventos.eventos_app.services.AuthServicio;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
	private AuthServicio authServicio;

	@PostMapping(value = "/registro", consumes = { "multipart/form-data" })
	public ResponseEntity<?> registrarOrganizador(
			@Valid @RequestPart("organizador") RegistroOrgRequestDTO organizadorDTO,
			@RequestPart(value = "fotoPerfil", required = false) MultipartFile imagen,
			HttpServletRequest request) {
		try {
			
			String ip = request.getRemoteAddr();
			RegistroOrgResponseDTO nuevo = authServicio.registrar(organizadorDTO, imagen, ip);

			return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);

		} catch (RuntimeException e) {
			if (e.getMessage().equals("EMAIL_EXISTE")) {
				return ResponseEntity.status(HttpStatus.CONFLICT).body("CORREO_YA_REGISTRADO");
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ERROR_DATOS");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginOrgRequestDTO dto, HttpServletRequest request) {
		try {
			
			String ip = request.getRemoteAddr();
			LoginOrgResponseDTO resp = authServicio.login(dto, ip);
			
			return ResponseEntity.ok(resp);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
		}
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestBody recuperarContraRequest request) {

		try {

			authServicio.crearToken(request.getEmail());

			return ResponseEntity.ok("SI_CORREO_RECUPERACION");

		} catch (RuntimeException e) {

			return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(e.getMessage());
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody cambiarContraRequest request) {

		authServicio.resetPassword(request.getToken(), request.getPassword());

		return ResponseEntity.ok("CONTRASEÑA_ACTUALIZADA");

	}

}
