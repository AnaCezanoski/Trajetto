package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.dto.DateRequestDTO;
import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.PlaceRequestDTO;
import com.trajetto.backend.itinerary.dto.RatingRequestDTO;
import com.trajetto.backend.itinerary.service.ItineraryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de roteiro.
 * <p>
 * As falhas (roteiro inexistente, roteiro de outro usuário, dados inválidos) são lançadas pelo
 * service e traduzidas para o contrato JSON padrão pelo {@code GlobalExceptionHandler}.
 */
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
        return ResponseEntity.ok(itineraryService.getActiveItinerary(userId));
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<ItineraryResponseDTO> getActive(@PathVariable Long userId) {
        ItineraryResponseDTO itinerary = itineraryService.getActiveItinerary(userId);
        if (itinerary == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(itinerary);
    }

    @PostMapping("/generate")
    public ResponseEntity<ItineraryResponseDTO> generate(@Valid @RequestBody GenerateItineraryRequestDTO req) {
        return ResponseEntity.ok(itineraryService.generateItinerary(req));
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<List<ItineraryResponseDTO>> getAll(@PathVariable Long userId) {
        return ResponseEntity.ok(itineraryService.getAllItineraries(userId));
    }

    @PatchMapping("/{itineraryId}/activate/{userId}")
    public ResponseEntity<ItineraryResponseDTO> activate(@PathVariable Long itineraryId, @PathVariable Long userId) {
        return ResponseEntity.ok(itineraryService.activateItinerary(itineraryId, userId));
    }

    @PatchMapping("/{itineraryId}/rating")
    public ResponseEntity<ItineraryResponseDTO> updateRating(
            @PathVariable Long itineraryId,
            @Valid @RequestBody RatingRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateRating(itineraryId, req));
    }

    @PatchMapping("/{itineraryId}/date")
    public ResponseEntity<ItineraryResponseDTO> updateDate(
            @PathVariable Long itineraryId,
            @Valid @RequestBody DateRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateDate(itineraryId, req));
    }

    @PatchMapping("/{itineraryId}/place/{orderIndex}")
    public ResponseEntity<ItineraryResponseDTO> replacePlace(
            @PathVariable Long itineraryId,
            @PathVariable Integer orderIndex,
            @Valid @RequestBody PlaceRequestDTO req) {
        return ResponseEntity.ok(itineraryService.replacePlace(itineraryId, orderIndex, req));
    }

    @DeleteMapping("/{itineraryId}/user/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Long itineraryId, @PathVariable Long userId) {
        itineraryService.deleteItinerary(itineraryId, userId);
        return ResponseEntity.noContent().build();
    }
}
