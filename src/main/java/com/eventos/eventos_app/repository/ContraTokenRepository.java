package com.eventos.eventos_app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventos.eventos_app.models.ContraToken;
import com.eventos.eventos_app.models.Organizador;

@Repository
public interface ContraTokenRepository extends JpaRepository<ContraToken, Long> {

		Optional<ContraToken> findByToken(String token);
		void deleteByOrganizador(Organizador org);
		Optional<ContraToken> findByOrganizador(Organizador org);
		
}
