package com.trajetto.backend.touristSpots.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TouristSpotDTO(
        String xid,
        String name,
        String kinds,
        Point point
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Point(double lat, double lon) {}
}