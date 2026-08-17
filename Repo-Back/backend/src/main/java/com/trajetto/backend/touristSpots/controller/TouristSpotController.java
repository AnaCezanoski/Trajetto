package com.trajetto.backend.touristSpots.controller;


import com.trajetto.backend.touristSpots.dto.TouristSpotDTO;
import com.trajetto.backend.touristSpots.service.OverpassService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/tourist-spots")
public class TouristSpotController {

    private final OverpassService overpassService;

    public TouristSpotController(OverpassService overpassService) {
        this.overpassService = overpassService;
    }

    /**
     * GET /api/tourist-spots?city=Curitiba&radius=10000
     */
    @GetMapping
    public ResponseEntity<List<TouristSpotDTO>> getByCity(
            @RequestParam @NotBlank(message = "A cidade é obrigatória") String city,
            @RequestParam(defaultValue = "10000")
            @Min(value = 100, message = "O raio deve estar entre 100 e 50000 metros")
            @Max(value = 50000, message = "O raio deve estar entre 100 e 50000 metros") int radius
    ) {
        return ResponseEntity.ok(overpassService.searchByCity(city, radius));
    }
}
