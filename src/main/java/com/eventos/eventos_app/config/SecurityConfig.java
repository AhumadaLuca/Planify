package com.eventos.eventos_app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
	
	@Autowired
	private JwtFilter jwtFilter;

	@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/images/**","/uploads/**","/assets/**").permitAll()
                .requestMatchers("/api/auth/**","/api/eventos","/api/eventos/{id}","/issuer/**","/api/organizadores/**").permitAll() // registro / login libres / mostrar eventos
                .requestMatchers("/api/eventos/**").hasAnyRole("ORGANIZADOR","ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
	
	@Bean
	public PasswordEncoder passwordEncoder() {
	    return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
	}
}