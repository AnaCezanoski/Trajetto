package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class
GenerateItineraryRequestDTO {

    @NotNull(message = "O usuário do roteiro é obrigatório")
    private Long userId;

    @DecimalMin(value = "-90.0", message = "A latitude de origem deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude de origem deve estar entre -90 e 90")
    private double startLatitude;

    @DecimalMin(value = "-180.0", message = "A longitude de origem deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude de origem deve estar entre -180 e 180")
    private double startLongitude;
}
