package com.eventos.eventos_app.dto;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

public class OrganizadorDTO {

    private String nombre;
    private String apellido;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String nombreOrganizacion;
    private String direccionOrganizacion;

    private MultipartFile imagen;

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

	public MultipartFile getImagen() {
		return imagen;
	}

	public void setImagen(MultipartFile imagen) {
		this.imagen = imagen;
	}

    
}
