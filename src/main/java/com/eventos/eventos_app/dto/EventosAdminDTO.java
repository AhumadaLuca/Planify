package com.eventos.eventos_app.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.eventos.eventos_app.models.EstadoEvento;
import com.eventos.eventos_app.models.HorarioEvento;
import com.eventos.eventos_app.models.TipoEvento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventosAdminDTO {
	
	private Long id; 
	private String titulo; 
	private String descripcion; 
	private String categoria; 
    public LocalDateTime fechaInicio;
    public LocalDateTime fechaFin;
	private EstadoEvento estado;
	private TipoEvento tipo;
	private List<HorarioEvento> horarios;

}
