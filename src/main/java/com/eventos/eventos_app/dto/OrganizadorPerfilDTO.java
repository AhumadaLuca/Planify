package com.eventos.eventos_app.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eventos.eventos_app.models.Rol;

public class OrganizadorPerfilDTO {

    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String nombreOrganizacion;
    private String direccionOrganizacion;
    private String fotoPerfil;
    private Rol rol;
    private LocalDate fechaRegistro;
    private boolean verificado;
    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getNombre() {
		return nombre;
	}
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
	public String getApellido() {
		return apellido;
	}
	public void setApellido(String apellido) {
		this.apellido = apellido;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getTelefono() {
		return telefono;
	}
	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}
	public LocalDate getFechaNacimiento() {
		return fechaNacimiento;
	}
	public void setFechaNacimiento(LocalDate fechaNacimiento) {
		this.fechaNacimiento = fechaNacimiento;
	}
	public String getNombreOrganizacion() {
		return nombreOrganizacion;
	}
	public void setNombreOrganizacion(String nombreOrganizacion) {
		this.nombreOrganizacion = nombreOrganizacion;
	}
	public String getDireccionOrganizacion() {
		return direccionOrganizacion;
	}
	public void setDireccionOrganizacion(String direccionOrganizacion) {
		this.direccionOrganizacion = direccionOrganizacion;
	}
	public String getFotoPerfil() {
		return fotoPerfil;
	}
	public void setFotoPerfil(String fotoPerfil) {
		this.fotoPerfil = fotoPerfil;
	}
	public Rol getRol() {
		return rol;
	}
	public void setRol(Rol rol2) {
		this.rol = rol2;
	}
	public LocalDate getFechaRegistro() {
		return fechaRegistro;
	}
	public void setFechaRegistro(LocalDate localDate) {
		this.fechaRegistro = localDate;
	}
	public boolean isVerificado() {
		return verificado;
	}
	public void setVerificado(boolean verificado) {
		this.verificado = verificado;
	}
    
    

}
