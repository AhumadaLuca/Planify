package com.eventos.eventos_app.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.eventos.eventos_app.models.TipoEvento;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class EventoRequestDTO {

    @NotBlank(message = "TITULO_OBLIGATORIO")
    @Size(min = 3, max = 50, message = "TITULO_INVALIDO")
    public String titulo;

    @NotBlank(message = "DESCRIPCION_OBLIGATORIA")
    @Size(min = 10, max = 500, message = "DESCRIPCION_INVALIDA")
    public String descripcion;

    public LocalDateTime fechaInicio;
    public LocalDateTime fechaFin;

    @NotNull(message = "TIPO_OBLIGATORIO")
    public TipoEvento tipo;

    public List<HorarioEventoDTO> horarios;

    @Size(max = 200, message = "UBICACION_INVALIDA")
    public String ubicacion;

    @NotNull(message = "LATITUD_OBLIGATORIA")
    @DecimalMin(value = "-90.0", message = "LATITUD_INVALIDA")
    @DecimalMax(value = "90.0", message = "LATITUD_INVALIDA")
    public Double latitud;

    @NotNull(message = "LONGITUD_OBLIGATORIA")
    @DecimalMin(value = "-180.0", message = "LONGITUD_INVALIDA")
    @DecimalMax(value = "180.0", message = "LONGITUD_INVALIDA")
    public Double longitud;

    @DecimalMin(value = "0.0", message = "PRECIO_INVALIDO")
    public Double precio;

    @Size(max = 255, message = "URL_INVALIDA")
    public String urlVentaExterna;

    @NotNull(message = "VERIFICAR_EDAD_OBLIGATORIO")
    public Boolean requiereVerificarEdad;

    @NotNull(message = "CATEGORIA_OBLIGATORIA")
    public Long categoriaId;

    public String imagenUrl;

    public List<RedSocialLinkDTO> redesSociales;
}