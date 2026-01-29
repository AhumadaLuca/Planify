package com.eventos.eventos_app.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.eventos.eventos_app.models.EstadoEvento;

import lombok.Data;

@Data
public class EventoResponseDTO {
	
	public Long id;
	public String titulo;
    public String descripcion;
    public LocalDateTime fechaInicio;
    public LocalDateTime fechaFin;
    public String ubicacion;
    public Double latitud;
    public Double longitud;
    public Double precio;
    public String urlVentaExterna;
    public Boolean requiereVerificarEdad;
    public Long categoriaId;
    public String categoriaNombre; 
    public String imagenUrl;
    public LocalDateTime fechaCreacion;
    public EstadoEvento estado;

    // Mini info del organizador
    public Long organizadorId;
    public String nombreOrganizador;
    public String fotoOrganizador;
    
    public List<RedSocialLinkDTO> redesSociales;

}
