package com.trajetto.backend.routing.dto;

import java.util.List;

public class RouteRequestDTO {
    public CoordinateDTO origin;
    public CoordinateDTO destination;
    public List<CoordinateDTO> waypoints;
}
