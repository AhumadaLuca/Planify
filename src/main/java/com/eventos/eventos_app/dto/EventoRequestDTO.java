package com.eventos.eventos_app.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class EventoRequestDTO {
	
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
    public String imagenUrl;
    public List<RedSocialLinkDTO> redesSociales;

}
