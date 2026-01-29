package com.eventos.eventos_app.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eventos.eventos_app.dto.EventosAdminDTO;
import com.eventos.eventos_app.dto.OrganizadorAdminDTO;
import com.eventos.eventos_app.models.EstadoEvento;
import com.eventos.eventos_app.models.Evento;
import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.repository.EventoRepository;
import com.eventos.eventos_app.repository.OrganizadorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServicio {

	@Autowired
    private EventoRepository eventoRepository;
    
    @Autowired
    private OrganizadorRepository organizadorRepository;

    public List<OrganizadorAdminDTO> obtenerOrganizadoresConEventos() {
    	List<Organizador> organizadores = organizadorRepository.findAll();
    	
    	return organizadores.stream().map(org -> {

    	 List<EventosAdminDTO> eventosDTO = org.getEventos().stream().map(e ->
         new EventosAdminDTO(
             e.getId(),
             e.getTitulo(),
             e.getDescripcion(),
             e.getCategoria() != null ? e.getCategoria().getNombre() : null,
             e.getFechaInicio() != null ? e.getFechaInicio().toString() : null,
             e.getFechaFin() != null ? e.getFechaFin().toString() : null,
             e.getEstado()
         )
     ).toList();
    	 
    	 return new OrganizadorAdminDTO(
                 org.getId(),
                 org.getNombre() + " " + org.getApellido(),
                 org.getEmail(),
                 Boolean.TRUE.equals(org.getVerificado()),
                 eventosDTO
         );
     }).toList();
    	
    }
    
    public void cambiarEstadoEvento(Long idEvento, EstadoEvento estadoEvento) {
    	
        Evento evento = eventoRepository.findById(idEvento)
            .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        evento.setEstado(estadoEvento);
        
        eventoRepository.save(evento);
    }
    
    public Organizador verOrganizador(Long id){
    	return organizadorRepository.findById(id)
    			.orElseThrow(() -> new RuntimeException("Organizador no encontrado"));
    	
    }
    
    public void verificarOrganizador(Long idOrganizador) {
        Organizador org = organizadorRepository.findById(idOrganizador)
            .orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

        if(org.getVerificado()) {
        	org.setVerificado(false);
        }else {
        	org.setVerificado(true);
        }
        
        organizadorRepository.save(org);
    }
    
    public void eliminarOrganizadorConEventos(Long id) {
        Organizador organizador = organizadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

        // Gracias a CascadeType.ALL y orphanRemoval, esto elimina también sus eventos
        organizadorRepository.delete(organizador);
    }
    
}
