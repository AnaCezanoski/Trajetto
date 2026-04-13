package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.service.ItineraryService;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Setter
@Getter
@NoArgsConstructor
@RestController
@RequestMapping(value={"/itinerary"})
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;



    @PostMapping("/mock/{userId}")
    public ResponseEntity<ItineraryResponseDTO> createMock(@PathVariable Long userId) {
        itineraryService.createItineraryMock(userId);
        try {
            ItineraryResponseDTO itinerary = itineraryService.getActiveItinerary(userId);
            if (itinerary == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(itinerary);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<ItineraryResponseDTO> getActive(@PathVariable Long userId) {
        try {
            ItineraryResponseDTO itinerary = itineraryService.getActiveItinerary(userId);
            if (itinerary == null) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(itinerary);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<ItineraryResponseDTO> generate(@RequestBody GenerateItineraryRequestDTO req) {
        try {
            ItineraryResponseDTO result = itineraryService.generateItinerary(req);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @DeleteMapping("/{itineraryId}/user/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Long itineraryId, @PathVariable Long userId) {
        try {
            itineraryService.deleteItinerary(itineraryId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Forbidden")) return ResponseEntity.status(403).build();
            return ResponseEntity.notFound().build();
        }
    }
}
