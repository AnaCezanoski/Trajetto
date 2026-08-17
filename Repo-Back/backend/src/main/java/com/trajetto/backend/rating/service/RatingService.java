package com.trajetto.backend.rating.service;

import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.exception.ResourceConflictException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;

    public List<RatingModel> getRatingsBySpot(String touristSpotXid) {
        return ratingRepository.findByTouristSpotXid(touristSpotXid);
    }

    public double getAverageRating(String touristSpotXid) {
        List<RatingModel> ratings = ratingRepository.findByTouristSpotXid(touristSpotXid);

        return ratings.stream()
                .mapToInt(RatingModel::getRating)
                .average()
                .orElse(0.0);
    }

    public RatingModel createRating(String touristSpotXid, Long userId, String userName, int ratingValue, String comment) {

        ratingRepository.findByTouristSpotXidAndUserId(touristSpotXid, userId)
                .ifPresent(existing -> {
                    throw new ResourceConflictException("Este usuário já avaliou este local.");
                });

        RatingModel rating = new RatingModel();
        rating.setTouristSpotXid(touristSpotXid);
        rating.setUserName(userName);
        rating.setUserId(userId);
        rating.setRating(ratingValue);
        rating.setComment(comment);
        rating.setCreatedAt(LocalDateTime.now());

        return ratingRepository.save(rating);
    }

    public RatingModel updateRating(Long ratingId,
                               Long userId,
                               int newRating,
                               String newComment) {

        RatingModel rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação", ratingId));

        if (!rating.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Esta avaliação pertence a outro usuário.");
        }

        rating.setRating(newRating);
        rating.setComment(newComment);

        return ratingRepository.save(rating);
    }

    public void deleteRating(Long ratingId, Long userId) {

        RatingModel rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação", ratingId));

        if (!rating.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Esta avaliação pertence a outro usuário.");
        }

        ratingRepository.delete(rating);
    }
}
