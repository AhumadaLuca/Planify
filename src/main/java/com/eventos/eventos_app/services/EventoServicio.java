package com.eventos.eventos_app.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.eventos.eventos_app.dto.EventoRequestDTO;
import com.eventos.eventos_app.dto.EventoResponseDTO;
import com.eventos.eventos_app.dto.HorarioEventoDTO;
import com.eventos.eventos_app.dto.RedSocialLinkDTO;
import com.eventos.eventos_app.models.Categoria;
import com.eventos.eventos_app.models.EstadoEvento;
import com.eventos.eventos_app.models.Evento;
import com.eventos.eventos_app.models.HorarioEvento;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.models.Rol;
import com.eventos.eventos_app.models.TipoEvento;
import com.eventos.eventos_app.models.RedSocialLink;
import com.eventos.eventos_app.models.RedSocialLinkTipo;
import com.eventos.eventos_app.repository.CategoriaRepository;
import com.eventos.eventos_app.repository.EventoRepository;

import io.github.bucket4j.Bucket;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

@Service
public class EventoServicio {

	@Autowired
	private EventoRepository eventoRepository;

	@Autowired
	private CategoriaRepository categoriaRepository;
	
	@Autowired
	private RateLimit rateLimitServicio;

	// Crear evento
	public EventoResponseDTO crearEvento(EventoRequestDTO dto, MultipartFile imagen, Organizador org)
			throws IOException {
		Evento e = new Evento();
		e.setEstado(EstadoEvento.PENDIENTE);
		e.setOrganizador(org);
		
		String key = "CREAR_EVENTO_" + org.getId();

		Bucket bucket = rateLimitServicio.resolveBucket(key, 10, 1);

		if (!bucket.tryConsume(1)) {
		    throw new RuntimeException("CREACION_RAPIDA_EVENTOS");
		}

		mapearDatosEvento(e, dto, imagen); // <-- acá llenás los campos de la entidad
		eventoRepository.save(e);

		return mapToDTO(e); // <-- acá devolvés el DTO al frontend
	}

	public EventoResponseDTO actualizarEvento(Long id, EventoRequestDTO dto, MultipartFile imagen, Organizador org)
			throws IOException {
		Evento e = eventoRepository.findById(id).orElseThrow(() -> new RuntimeException("EVENTO_NO_ENCONTRADO"));
		
		String key = "EDITAR_EVENTO_" + org.getId();

		Bucket bucket = rateLimitServicio.resolveBucket(key, 10, 1);

		if (!bucket.tryConsume(1)) {
		    throw new RuntimeException("EDICION_RAPIDA_EVENTOS");
		}

		boolean esAdmin = org.getRol() == Rol.ADMIN;

		if (!esAdmin && !e.getOrganizador().getId().equals(org.getId())) {
			throw new RuntimeException("NO_PERMISOS_EDITAR");
		}

		mapearDatosEvento(e, dto, imagen);
		eventoRepository.save(e);

		return mapToDTO(e);
	}

	// READ: Obtener todos los eventos
	public List<EventoResponseDTO> obtenerTodos() {
	    return eventoRepository.findAllWithRelations()
	            .stream()
	            .map(this::mapToDTO)
	            .toList();
	}

	public List<Evento> obtenerEventosPorOrganizador(Long organizadorId) {
		return eventoRepository.findByOrganizadorId(organizadorId);
	}

	// READ: por ID
	public EventoResponseDTO obtenerPorId(Long id) {
		Evento evento = eventoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("EVENTO_NO_ENCONTRADO_ID" + id));
		return mapToDTO(evento);
	}

	public void eliminarEvento(Long id, Organizador organizador) {
		Evento evento = eventoRepository.findById(id).orElseThrow(() -> new RuntimeException("EVENTO_NO_ENCONTRADO"));

		boolean esAdmin = organizador.getRol() == Rol.ADMIN;

		if (!esAdmin && !evento.getOrganizador().getId().equals(organizador.getId())) {
			throw new RuntimeException("NO_ELIMINAR_EVENTOS");
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
		dto.estado = e.getEstado();

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
		dto.tipo = e.getTipo();

		if (e.getHorarios() != null && !e.getHorarios().isEmpty()) {
		    dto.horarios = e.getHorarios().stream().map(h -> {
		        HorarioEventoDTO hdto = new HorarioEventoDTO();
		        hdto.dia = h.getDia().name();
		        hdto.horaApertura = h.getHoraApertura();
		        hdto.horaCierre = h.getHoraCierre();
		        return hdto;
		    }).toList();
		} else {
		    dto.horarios = Collections.emptyList();
		}

		return dto;
	}

	private void mapearDatosEvento(Evento e, EventoRequestDTO dto, MultipartFile imagen) throws IOException {
		e.setTitulo(limpiar(dto.titulo));
		e.setDescripcion(limpiar(dto.descripcion));
		e.setFechaInicio(dto.fechaInicio);
		e.setTipo(dto.tipo);
		e.setFechaFin(dto.fechaFin);
		e.setUbicacion(limpiar(dto.ubicacion));
		e.setLatitud(dto.latitud);
		e.setLongitud(dto.longitud);
		e.setPrecio(dto.precio);
		e.setUrlVentaExterna(limpiar(dto.urlVentaExterna));
		e.setRequiereVerificarEdad(dto.requiereVerificarEdad);

		Categoria cat = categoriaRepository.findById(dto.categoriaId)
				.orElseThrow(() -> new RuntimeException("NO_CATEGORIA"));
		e.setCategoria(cat);

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

				String nombre = UUID.randomUUID() + extension;
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
				rs.setUrl(limpiar(rsl.url));
				rs.setEvento(e); // importante
				e.getRedesSociales().add(rs);

			}
		}
		e.getHorarios().clear();

		if (dto.tipo == TipoEvento.RECURRENTE && dto.horarios != null) {
		    for (HorarioEventoDTO h : dto.horarios) {

		        HorarioEvento horario = new HorarioEvento();
		        horario.setDia(DayOfWeek.valueOf(h.dia));
		        horario.setHoraApertura(h.horaApertura);
		        horario.setHoraCierre(h.horaCierre);
		        horario.setEvento(e);

		        e.getHorarios().add(horario);
		    }
		}
		
		if (dto.tipo == TipoEvento.PUNTUAL) {

			    if (dto.fechaInicio == null || dto.fechaFin == null) {
			        throw new RuntimeException("FECHAS_OBLIGATORIAS");
			    }

			    if (dto.fechaInicio.isAfter(dto.fechaFin)) {
			        throw new RuntimeException("FECHA_INICIO_FIN");
			    }
		    // limpiar horarios por las dudas
		    e.getHorarios().clear();
		}

		if (dto.tipo == TipoEvento.RECURRENTE) {
		    if (dto.horarios == null || dto.horarios.isEmpty()) {
		        throw new RuntimeException("EVENTRO_RECURRENTE_HORARIO");
		    }

		    // opcional: limpiar fechas
		    e.setFechaInicio(null);
		    e.setFechaFin(null);
		}
		
	}
	
	private String limpiar(String input) {
	    if (input == null) return null;

	    String limpio = Jsoup.clean(input, Safelist.none()).trim();
	    return limpio.isEmpty() ? null : limpio;
	}
	
}

