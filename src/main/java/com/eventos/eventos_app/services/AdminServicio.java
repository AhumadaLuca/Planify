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
import com.eventos.eventos_app.models.Rol;
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

    public List<OrganizadorAdminDTO> obtenerOrganizadoresConEventos(Organizador admin) {

        boolean esSuperAdmin = admin.getRol() == Rol.SUPER_ADMIN;

        final Long regionAdminId = esSuperAdmin
                ? null
                : admin.getRegion().getId();

        return organizadorRepository.findAll()
                .stream()

                // FILTRAR ORGANIZADORES POR MISMA REGION
                .filter(org -> {

                    if (esSuperAdmin) {
                        return true;
                    }

                    return org.getRegion() != null
                            && org.getRegion().getId()
                                    .equals(regionAdminId);
                })

                .map(org -> {

                    List<EventosAdminDTO> eventosDTO = org.getEventos()
                            .stream()

                            // FILTRAR EVENTOS POR MISMA REGION
                            .filter(e -> {

                                if (esSuperAdmin) {
                                    return true;
                                }

                                return e.getRegion() != null
                                        && e.getRegion().getId()
                                                .equals(regionAdminId);
                            })

                            .map(e -> new EventosAdminDTO(
                                    e.getId(),
                                    e.getTitulo(),
                                    e.getDescripcion(),
                                    e.getCategoria() != null
                                            ? e.getCategoria().getNombre()
                                            : null,
                                    e.getFechaInicio(),
                                    e.getFechaFin(),
                                    e.getEstado(),
                                    e.getTipo(),
                                    e.getHorarios()
                            ))
                            .toList();

                    return new OrganizadorAdminDTO(
                            org.getId(),
                            org.getNombre() + " " + org.getApellido(),
                            org.getEmail(),
                            Boolean.TRUE.equals(org.getVerificado()),
                            eventosDTO
                    );
                })

                .toList();
    }
    
  
    
    public void cambiarEstadoEvento(Long idEvento, EstadoEvento estadoEvento, Organizador admin) {
    	
        Evento evento = eventoRepository.findById(idEvento)
            .orElseThrow(() -> new RuntimeException("EVENTO_NO_ENCONTRADO"));
        
        String provinciaAdmin = admin.getRegion().getProvincia();
        String provinciaEvento = evento.getRegion().getProvincia();
        
        if (!provinciaAdmin.equals(provinciaEvento)) {
            throw new RuntimeException("NO_PERMISOS_REGION");
        }

        evento.setEstado(estadoEvento);
        
        eventoRepository.save(evento);
    }
    
    public Organizador verOrganizador(Long id, Organizador admin){

        Organizador org = organizadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ENCONTRADO"));

        boolean esSuperAdmin = admin.getRol() == Rol.SUPER_ADMIN;

        if (!esSuperAdmin) {

            if (admin.getRegion() == null ||
                org.getRegion() == null ||
                !admin.getRegion().getProvincia()
                    .equals(org.getRegion().getProvincia())) {

                throw new RuntimeException("NO_PERMISOS_REGION");
            }
        }

        return org;
    }
    
    public void verificarOrganizador(Long idOrganizador, Organizador admin) {

        Organizador org = organizadorRepository.findById(idOrganizador)
                .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ENCONTRADO"));

        validarPermisoRegion(admin, org);

        org.setVerificado(!Boolean.TRUE.equals(org.getVerificado()));

        organizadorRepository.save(org);
    }
    
    public void eliminarOrganizadorConEventos(Long id, Organizador admin) {

        Organizador org = organizadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ORGANIZADOR_NO_ENCONTRADO"));

        validarPermisoRegion(admin, org);

        organizadorRepository.delete(org);
    }
    
    private void validarPermisoRegion(Organizador admin, Organizador org) {

        boolean esSuperAdmin = admin.getRol() == Rol.SUPER_ADMIN;
        
        System.out.println("ADMIN REGION: " + admin.getRegion().getProvincia());
        System.out.println("ORG REGION: " + org.getRegion().getProvincia());

        if (esSuperAdmin) {
            return;
        }

        if (admin.getRegion() == null ||
            org.getRegion() == null ||
            !admin.getRegion().getProvincia()
                .equals(org.getRegion().getProvincia())) {

            throw new RuntimeException("NO_PERMISOS_REGION");
        }
    }
    
}
