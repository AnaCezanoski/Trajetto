package com.trajetto.backend.itinerary.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class PlaceResponseDTO {

    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalTime estimatedVisitTime;
    private Integer orderIndex;
}