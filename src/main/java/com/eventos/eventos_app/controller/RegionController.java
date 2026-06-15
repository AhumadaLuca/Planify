package com.eventos.eventos_app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventos.eventos_app.dto.RegionResponseDTO;
import com.eventos.eventos_app.repository.RegionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/regiones")
public class RegionController {
	
	@Autowired
	private RegionRepository regionRepository;
	
	
	@GetMapping
	public List<RegionResponseDTO> obtenerTodasLasRegiones() {

	    ObjectMapper mapper = new ObjectMapper(); // ✔ crear una sola vez

	    return regionRepository.findAll().stream().map(r -> {
	        RegionResponseDTO dto = new RegionResponseDTO();

	        dto.id = r.getId();
	        dto.provincia = r.getProvincia();
	        dto.departamento = r.getDepartamento();

	        try {
	            if (r.getGeoJson() != null) {

	                JsonNode geo = mapper.readTree(r.getGeoJson());

	                // 👇 puede ser Feature o Geometry
	                if (geo.has("geometry")) {
	                    dto.geometry = geo.get("geometry");
	                } else {
	                    dto.geometry = geo;
	                }
	            }
	        } catch (Exception e) {
	            e.printStackTrace(); // podés mejorar esto después
	        }

	        return dto;
	    }).toList();
	}

}
