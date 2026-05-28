package com.trajetto.backend.rating.controller;

import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.service.RatingService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @Getter
    @Setter
    public static class RatingRequest {
        private String placeId;
        private String userName;
        private Long userId;
        private int rating;
        private String comment;
    }

    @GetMapping("/spot")
    public ResponseEntity<List<RatingModel>> getRatingsBySpot(
            @RequestParam String xid
    ) {
        List<RatingModel> ratings = ratingService.getRatingsBySpot(xid);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/spot/average")
    public ResponseEntity<Double> getAverageRating(
            @RequestParam String xid
    ) {
        double avg = ratingService.getAverageRating(xid);
        return ResponseEntity.ok(avg);
    }

    @PostMapping
    public ResponseEntity<RatingModel> createRating(@RequestBody RatingRequest request) {
        RatingModel created = ratingService.createRating(
                request.getPlaceId(),
                request.getUserId(),
                request.getUserName(),
                request.getRating(),
                request.getComment()
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingModel> updateRating(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam int rating,
            @RequestParam(required = false) String comment
    ) {
        RatingModel updated = ratingService.updateRating(id, userId, rating, comment);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        ratingService.deleteRating(id, userId);
        return ResponseEntity.noContent().build();
    }
}