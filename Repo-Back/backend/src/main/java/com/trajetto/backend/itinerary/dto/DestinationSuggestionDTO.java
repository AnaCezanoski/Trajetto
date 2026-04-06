package com.trajetto.backend.itinerary.dto;

import lombok.Data;

@Data
public class DestinationSuggestionDTO {

    private Long id;
    private String cityName;
    private String country;
    private String description;

    public DestinationSuggestionDTO(Long id, String cityName, String country, String description) {
        this.id = id;
        this.cityName = cityName;
        this.country = country;
        this.description = description;
    }
}
