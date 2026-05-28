package com.trajetto.backend.itinerary.dto;

import lombok.Data;

@Data
public class PlaceRequestDTO {
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String estimatedVisitTime;
    private String openingHours;
    private String category;
    private String fee;
}
