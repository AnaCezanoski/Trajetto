package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.DestinationSuggestionDTO;
import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.service.ItineraryService;
import com.trajetto.backend.user.repository.UserRepository;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@RestController
@RequestMapping(value={"/itinerary"})
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @GetMapping("/generic")
    public ResponseEntity<ItineraryResponseDTO> getGenericItinerary() {
        ItineraryResponseDTO itinerary = itineraryService.generateGenericItinerary();
        return ResponseEntity.ok(itinerary);
    }

    @PostMapping("/mock/{userId}")
    public ResponseEntity<ItineraryResponseDTO> getItineraries(@PathVariable Long userId) {
        itineraryService.createItineraryMock(userId);

        try {
            ItineraryResponseDTO itinerary = itineraryService.getActiveItinerary(userId);
            if (itinerary == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(itinerary);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<DestinationSuggestionDTO>> getSuggestions() {
        List<DestinationSuggestionDTO> suggestions = itineraryService.getGenericSuggestions();
        return ResponseEntity.ok(suggestions);
    }
}
