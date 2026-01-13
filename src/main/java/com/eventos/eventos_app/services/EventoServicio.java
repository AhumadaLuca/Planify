package com.eventos.eventos_app.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.eventos.eventos_app.dto.EventoRequestDTO;
import com.eventos.eventos_app.dto.EventoResponseDTO;
import com.eventos.eventos_app.dto.RedSocialLinkDTO;
import com.eventos.eventos_app.models.Categoria;
import com.eventos.eventos_app.models.Evento;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.models.Rol;
import com.eventos.eventos_app.models.RedSocialLink;
import com.eventos.eventos_app.models.RedSocialLinkTipo;
import com.eventos.eventos_app.repository.CategoriaRepository;
import com.eventos.eventos_app.repository.EventoRepository;

@Service
public class EventoServicio {

	@Autowired
	private EventoRepository eventoRepository;

	@Autowired
	private CategoriaRepository categoriaRepository;

	// Crear evento
	public EventoResponseDTO crearEvento(EventoRequestDTO dto, MultipartFile imagen, Organizador org)
			throws IOException {
		Evento e = new Evento();
		e.setValidado(false);
		e.setOrganizador(org);

		mapearDatosEvento(e, dto, imagen); // <-- acá llenás los campos de la entidad
		eventoRepository.save(e);

		return mapToDTO(e); // <-- acá devolvés el DTO al frontend
	}

	public EventoResponseDTO actualizarEvento(Long id, EventoRequestDTO dto, MultipartFile imagen, Organizador org)
			throws IOException {
		Evento e = eventoRepository.findById(id).orElseThrow(() -> new RuntimeException("Evento no encontrado"));

		boolean esAdmin = org.getRol() == Rol.ADMIN;

		if (!esAdmin && !e.getOrganizador().getId().equals(org.getId())) {
			throw new RuntimeException("No tiene permisos para editar este evento");
		}

		mapearDatosEvento(e, dto, imagen);
		eventoRepository.save(e);

		return mapToDTO(e);
	}

	// READ: Obtener todos los eventos
	public List<Evento> obtenerTodos() {
		return eventoRepository.findAll();
	}

	public List<Evento> obtenerEventosPorOrganizador(Long organizadorId) {
		return eventoRepository.findByOrganizadorId(organizadorId);
	}

	// READ: por ID
	public EventoResponseDTO obtenerPorId(Long id) {
		Evento evento = eventoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Evento no encontrado con id: " + id));
		return mapToDTO(evento);
	}

	public void eliminarEvento(Long id, Organizador organizador) {
		Evento evento = eventoRepository.findById(id).orElseThrow(() -> new RuntimeException("Evento no encontrado"));

		boolean esAdmin = organizador.getRol() == Rol.ADMIN;

		if (!esAdmin && !evento.getOrganizador().getId().equals(organizador.getId())) {
			throw new RuntimeException("No puedes eliminar eventos de otro organizador");
		}

		eventoRepository.delete(evento);
	}

	private EventoResponseDTO mapToDTO(Evento e) {
		EventoResponseDTO dto = new EventoResponseDTO();

		dto.id = e.getId();
		dto.titulo = e.getTitulo();
		dto.descripcion = e.getDescripcion();
		dto.fechaInicio = e.getFechaInicio();
		dto.fechaFin = e.getFechaFin();
		dto.ubicacion = e.getUbicacion();
		dto.latitud = e.getLatitud();
		dto.longitud = e.getLongitud();
		dto.precio = e.getPrecio();
		dto.urlVentaExterna = e.getUrlVentaExterna();
		dto.requiereVerificarEdad = e.getRequiereVerificarEdad();
		dto.imagenUrl = e.getImagenUrl();
		dto.fechaCreacion = e.getFechaCreacion();
		dto.validado = e.getValidado();

		// Relaciones
		if (e.getCategoria() != null) {
			dto.categoriaId = e.getCategoria().getId();
			dto.categoriaNombre = e.getCategoria().getNombre();
		}

		if (e.getOrganizador() != null) {
			dto.organizadorId = e.getOrganizador().getId();
			dto.nombreOrganizador = e.getOrganizador().getNombre() + " " + e.getOrganizador().getApellido();
			dto.fotoOrganizador = e.getOrganizador().getFotoPerfil();
		}

		if (e.getRedesSociales() != null && !e.getRedesSociales().isEmpty()) {
			dto.redesSociales = e.getRedesSociales().stream().map(rs -> {
				RedSocialLinkDTO rsl = new RedSocialLinkDTO();
				rsl.id = rs.getId();
				rsl.tipo = rs.getTipo() != null ? rs.getTipo().name() : "OTHER";
				rsl.url = rs.getUrl();
				return rsl;
			}).collect(Collectors.toList());
		} else {
			dto.redesSociales = Collections.emptyList();
		}

		return dto;
	}

	private void mapearDatosEvento(Evento e, EventoRequestDTO dto, MultipartFile imagen) throws IOException {
		e.setTitulo(dto.titulo);
		e.setDescripcion(dto.descripcion);
		e.setFechaInicio(dto.fechaInicio);
		e.setFechaFin(dto.fechaFin);
		e.setUbicacion(dto.ubicacion);
		e.setLatitud(dto.latitud);
		e.setLongitud(dto.longitud);
		e.setPrecio(dto.precio);
		e.setUrlVentaExterna(dto.urlVentaExterna);
		e.setRequiereVerificarEdad(dto.requiereVerificarEdad);

		Categoria cat = categoriaRepository.findById(dto.categoriaId)
				.orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
		e.setCategoria(cat);

		if (imagen != null && !imagen.isEmpty()) {
			String nombre = UUID.randomUUID() + "_" + imagen.getOriginalFilename();
			Path ruta = Paths.get("uploads/" + nombre);
			Files.copy(imagen.getInputStream(), ruta);
			e.setImagenUrl("/uploads/" + nombre);
		}

		e.getRedesSociales().clear();
		if (dto.redesSociales != null) {
			for (RedSocialLinkDTO rsl : dto.redesSociales) {
				RedSocialLink rs = new RedSocialLink();
				if (rsl.tipo != null) {
					try {
						rs.setTipo(RedSocialLinkTipo.valueOf(rsl.tipo));
					} catch (IllegalArgumentException ex) {
						rs.setTipo(RedSocialLinkTipo.OTHER);
					}
				} else {
					rs.setTipo(RedSocialLinkTipo.OTHER);
				}
				rs.setUrl(rsl.url);
				rs.setEvento(e); // importante
				e.getRedesSociales().add(rs);

			}
		}
	}
}