package com.eventos.eventos_app.config;

import com.eventos.eventos_app.models.Region;
import com.eventos.eventos_app.repository.RegionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
@RequiredArgsConstructor
public class GeoDataLoader {

    private final RegionRepository regionRepository;

    @Bean
    CommandLineRunner cargarRegiones() {
        return args -> {

            if (regionRepository.count() > 0) {
                System.out.println("⚠️ Regiones ya cargadas");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            
            
            

            InputStream input = Thread.currentThread()
            	    .getContextClassLoader()
            	    .getResourceAsStream("geo/departamentos-mendoza.json");
            

            JsonNode root = mapper.readTree(input);
            JsonNode features = root.get("features");

            for (JsonNode feature : features) {

                JsonNode props = feature.get("properties");

                String provincia = capitalizar(props.get("provincia").asText());
                String departamento = capitalizar(props.get("departamento").asText());

                JsonNode geometry = feature.get("geometry");

                Region region = new Region();
                region.setProvincia(provincia);
                region.setDepartamento(departamento);
                region.setGeoJson(geometry.toString());

                regionRepository.save(region);
            }

            System.out.println("✅ Regiones cargadas correctamente");
        };
    }

    private String capitalizar(String texto) {
        if (texto == null) return null;
        texto = texto.toLowerCase();
        return texto.substring(0, 1).toUpperCase() + texto.substring(1);
    }
}
