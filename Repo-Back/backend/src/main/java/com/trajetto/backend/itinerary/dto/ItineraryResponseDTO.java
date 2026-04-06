package com.trajetto.backend.itinerary.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ItineraryResponseDTO {

    private Long id;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
    private List<PlaceResponseDTO> places;
}