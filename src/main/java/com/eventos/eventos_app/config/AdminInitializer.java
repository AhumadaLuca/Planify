package com.eventos.eventos_app.config;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.eventos.eventos_app.models.Organizador;
import com.eventos.eventos_app.models.Rol;
import com.eventos.eventos_app.repository.OrganizadorRepository;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner crearAdminPorDefecto(OrganizadorRepository organizadorRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            // Evitar duplicados
            if (organizadorRepository.findByEmail("admin@eventos.com").isEmpty()) {
                Organizador admin = new Organizador();
                admin.setNombre("Administrador");
                admin.setApellido("Principal");
                admin.setEmail("admin@eventos.com");
                admin.setClave(passwordEncoder.encode("admin123"));
                admin.setFechaNacimiento(LocalDate.of(1990, 1, 1));
                admin.setTelefono("1111111111");
                admin.setNombreOrganizacion("Sistema de Eventos");
                admin.setFotoPerfil("/uploads/default-admin.png"); // puedes usar una imagen default
                admin.setDireccionOrganizacion("Oficina Central");
                admin.setVerificado(true);
                admin.setRol(Rol.SUPER_ADMIN);
                admin.setFechaRegistro(LocalDate.now());

                organizadorRepository.save(admin);

                System.out.println("✅ Administrador creado");
            } else {
                System.out.println("ℹ️ Administrador ya existente, no se creó uno nuevo.");
            }
        };
    }
}
