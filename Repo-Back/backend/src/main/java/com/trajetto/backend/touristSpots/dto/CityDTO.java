package com.trajetto.backend.touristSpots.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CityDTO(
        double lat,
        double lon,
        String name,
        String country
) {}