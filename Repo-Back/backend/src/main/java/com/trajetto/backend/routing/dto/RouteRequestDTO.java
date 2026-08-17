package com.trajetto.backend.routing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class RouteRequestDTO {

    @Valid
    @NotNull(message = "A origem da rota é obrigatória")
    public CoordinateDTO origin;

    @Valid
    @NotNull(message = "O destino da rota é obrigatório")
    public CoordinateDTO destination;

    @Valid
    public List<CoordinateDTO> waypoints;
}
