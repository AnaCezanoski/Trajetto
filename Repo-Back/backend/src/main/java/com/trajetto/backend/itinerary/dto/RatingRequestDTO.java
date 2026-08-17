package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RatingRequestDTO {

    // Nulo é permitido: representa a remoção da avaliação feita pelo usuário.
    @Min(value = 1, message = "A nota deve estar entre 1 e 5")
    @Max(value = 5, message = "A nota deve estar entre 1 e 5")
    private Integer rating;

    @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres")
    private String ratingDescription;
}
