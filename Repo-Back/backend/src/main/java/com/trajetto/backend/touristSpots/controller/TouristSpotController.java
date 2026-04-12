package com.trajetto.backend.touristSpots.controller;


import com.trajetto.backend.touristSpots.dto.TouristSpotDTO;
import com.trajetto.backend.touristSpots.service.OverpassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<?> getByCity(
            @RequestParam String city,
            @RequestParam(defaultValue = "10000") int radius
    ) {
        try {
            List<TouristSpotDTO> spots = overpassService.searchByCity(city, radius);
            return ResponseEntity.ok(spots);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erro ao buscar pontos turísticos: " + e.getMessage());
        }
    }
}