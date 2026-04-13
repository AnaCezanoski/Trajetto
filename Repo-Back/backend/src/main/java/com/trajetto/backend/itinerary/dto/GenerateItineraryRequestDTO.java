package com.trajetto.backend.itinerary.dto;

import lombok.Data;

@Data
public class GenerateItineraryRequestDTO {
    private Long userId;
    private double startLatitude;
    private double startLongitude;
}
