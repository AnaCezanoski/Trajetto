package com.trajetto.backend.rating.controller;

import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.service.RatingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @Getter
    @Setter
    public static class RatingRequest {

        @NotBlank(message = "O local avaliado é obrigatório")
        private String placeId;

        private String userName;

        @NotNull(message = "O usuário é obrigatório")
        private Long userId;

        @Min(value = 1, message = "A nota deve estar entre 1 e 5")
        @Max(value = 5, message = "A nota deve estar entre 1 e 5")
        private int rating;

        @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres")
        private String comment;
    }

    @GetMapping("/spot")
    public ResponseEntity<List<RatingModel>> getRatingsBySpot(
            @RequestParam @NotBlank(message = "O identificador do local é obrigatório") String xid
    ) {
        List<RatingModel> ratings = ratingService.getRatingsBySpot(xid);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/spot/average")
    public ResponseEntity<Double> getAverageRating(
            @RequestParam @NotBlank(message = "O identificador do local é obrigatório") String xid
    ) {
        double avg = ratingService.getAverageRating(xid);
        return ResponseEntity.ok(avg);
    }

    @PostMapping
    public ResponseEntity<RatingModel> createRating(@Valid @RequestBody RatingRequest request) {
        RatingModel created = ratingService.createRating(
                request.getPlaceId(),
                request.getUserId(),
                request.getUserName(),
                request.getRating(),
                request.getComment()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingModel> updateRating(
            @PathVariable Long id,
            @RequestParam @NotNull(message = "O usuário é obrigatório") Long userId,
            @RequestParam
            @Min(value = 1, message = "A nota deve estar entre 1 e 5")
            @Max(value = 5, message = "A nota deve estar entre 1 e 5") int rating,
            @RequestParam(required = false)
            @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres") String comment
    ) {
        RatingModel updated = ratingService.updateRating(id, userId, rating, comment);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long id,
            @RequestParam @NotNull(message = "O usuário é obrigatório") Long userId
    ) {
        ratingService.deleteRating(id, userId);
        return ResponseEntity.noContent().build();
    }
}
