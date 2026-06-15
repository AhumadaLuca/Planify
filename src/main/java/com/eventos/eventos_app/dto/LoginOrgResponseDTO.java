package com.eventos.eventos_app.dto;

import lombok.Data;

@Data
public class LoginOrgResponseDTO {
	
	public Long id;
	public String token;
    public String nombre;
    public String rol;
    public Long regionId;
    public String provincia;
    public String departamento;
    

	public LoginOrgResponseDTO(Long id, String token, String nombre, String rol, Long regionId, String provincia,
			String departamento) {
		this.id = id;
		this.token = token;
		this.nombre = nombre;
		this.rol = rol;
		this.regionId = regionId;
		this.provincia = provincia;
		this.departamento = departamento;
	}

    

}
