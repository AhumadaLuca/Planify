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
             e.getFechaInicio(),
             e.getFechaFin(),
             e.getEstado(),
             e.getTipo(),
             e.getHorarios()
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
            .orElseThrow(() -> new RuntimeException("EVENTO_NO_ENCONTRADO"));

        evento.setEstado(estadoEvento);
        
        eventoRepository.save(evento);
    }
    
    public Organizador verOrganizador(Long id){
    	return organizadorRepository.findById(id)
    			.orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ECONTRADO"));
    	
    }
    
    public void verificarOrganizador(Long idOrganizador) {
        Organizador org = organizadorRepository.findById(idOrganizador)
            .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ECONTRADO"));

        if(org.getVerificado()) {
        	org.setVerificado(false);
        }else {
        	org.setVerificado(true);
        }
        
        organizadorRepository.save(org);
    }
    
    public void eliminarOrganizadorConEventos(Long id) {
        Organizador organizador = organizadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ECONTRADO"));

        // Gracias a CascadeType.ALL y orphanRemoval, esto elimina también sus eventos
        organizadorRepository.delete(organizador);
    }
    
}
