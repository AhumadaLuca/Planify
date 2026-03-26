package com.eventos.eventos_app.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ContraToken {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @Column(nullable = false, unique = true)
	    private String token;

	    @Column(nullable = false)
	    private LocalDateTime expiryDate;

	    @ManyToOne
	    @JoinColumn(name = "org_id", nullable = false)
	    @JsonIgnore
	    private Organizador organizador;

		public String getToken() {
			return token;
		}

		public void setToken(String token) {
			this.token = token;
		}

		public LocalDateTime getExpiryDate() {
			return expiryDate;
		}

		public void setExpiryDate(LocalDateTime expiryDate) {
			this.expiryDate = expiryDate;
		}

		public Organizador getOrganizador() {
			return organizador;
		}

		public void setOrganizador(Organizador organizador) {
			this.organizador = organizador;
		}

		public Long getId() {
			return id;
		}

	   
	

}
