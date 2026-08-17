package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DateRequestDTO {

    // Nulo é permitido: representa a remoção da data escolhida para o roteiro.
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "A data deve estar no formato AAAA-MM-DD")
    private String date;
}
