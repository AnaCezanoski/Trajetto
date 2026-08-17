package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PlaceRequestDTO {

    @NotBlank(message = "O nome do local é obrigatório")
    private String name;

    private String address;

    @NotNull(message = "A latitude do local é obrigatória")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    private Double latitude;

    @NotNull(message = "A longitude do local é obrigatória")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    private Double longitude;

    @Pattern(regexp = "([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?", message = "O horário deve estar no formato HH:mm")
    private String estimatedVisitTime;

    private String openingHours;
    private String category;
    private String fee;
}
