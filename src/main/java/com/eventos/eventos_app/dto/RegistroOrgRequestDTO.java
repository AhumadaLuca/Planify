package com.eventos.eventos_app.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class RegistroOrgRequestDTO {
	
    @NotBlank @Size(min = 2, max = 30)
    public String nombre;

    @NotBlank @Size(min = 2, max = 30)
    public String apellido;

    @Email @NotBlank
    public String email;

    @NotBlank
    @Size(min = 8, max = 100)
    public String password;

    @NotNull
    public LocalDate fechaNacimiento;

    @NotBlank
    @Pattern(regexp = "^[0-9+\\- ]{8,15}$", message = "Teléfono inválido")
    public String telefono;

    @NotBlank @Size(max = 100)
    public String nombreOrganizacion;

    @NotBlank @Size(max = 150)
    public String direccionOrganizacion;
    
    
    public String fotoPerfil;
    
    
    public Boolean verificado;
    
    
    
}