package com.eventos.eventos_app.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organizadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Organizador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="nombre", length=20, nullable = false)
	private String nombre;
	
	@Column(name="apellido", length=20, nullable = false)
	private String apellido;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name="clave", nullable = false)
    private String clave;
    
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;
    
    @Column(name="telefono_Organizador", nullable = false)
    private String telefono;
    
    @Column(name="nombre_organizacion", nullable = false)
    private String nombreOrganizacion;
    
    @Column(name="foto_perfil", nullable = false)
    private String fotoPerfil;
    
    @Column(name="direccion_organizacion", nullable = false)
    private String direccionOrganizacion;

    @Column(name="verificado", nullable = false)
    private Boolean verificado = false;
    
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDate fechaRegistro = LocalDate.now();
    
    @OneToMany(mappedBy = "organizador", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Evento> eventos = new ArrayList<>();
    
    @OneToMany(mappedBy = "organizador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContraToken> tokens;

    @Enumerated(EnumType.STRING)
    private Rol rol;

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

	public String getClave() {
		return clave;
	}

	public void setClave(String clave) {
		this.clave = clave;
	}

	public String getTelefono() {
		return telefono;
	}

	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}

	public String getNombreOrganizacion() {
		return nombreOrganizacion;
	}

	public void setNombreOrganizacion(String nombreOrganizacion) {
		this.nombreOrganizacion = nombreOrganizacion;
	}

	public String getFotoPerfil() {
		return fotoPerfil;
	}

	public void setFotoPerfil(String fotoPerfil) {
		this.fotoPerfil = fotoPerfil;
	}

	public String getDireccionOrganizacion() {
		return direccionOrganizacion;
	}

	public void setDireccionOrganizacion(String direccionOrganizacion) {
		this.direccionOrganizacion = direccionOrganizacion;
	}

	public Boolean getVerificado() {
		return verificado;
	}

	public void setVerificado(Boolean verificado) {
		this.verificado = verificado;
	}

	public Rol getRol() {
		return rol;
	}

	public void setRol(Rol rol) {
		this.rol = rol;
	}

	public Long getId() {
		return id;
	}

	public LocalDate getFechaNacimiento() {
		return fechaNacimiento;
	}

	public LocalDate getFechaRegistro() {
		return fechaRegistro;
	}

	public void setFechaNacimiento(LocalDate fechaNacimiento) {
		this.fechaNacimiento = fechaNacimiento;
	}

    
}
