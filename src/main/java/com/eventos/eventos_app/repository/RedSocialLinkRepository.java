package com.eventos.eventos_app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventos.eventos_app.models.RedSocialLink;

public interface RedSocialLinkRepository extends JpaRepository<RedSocialLink, Long> {
    List<RedSocialLink> findByEventoId(Long eventoId);
}