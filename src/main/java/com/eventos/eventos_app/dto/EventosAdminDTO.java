package com.eventos.eventos_app.dto;

import com.eventos.eventos_app.models.EstadoEvento;

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
	private String fechaInicio; 
	private String fechaFin; 
	private EstadoEvento estado;

}
