package com.trajetto.backend.rating.repository;

import com.trajetto.backend.rating.model.RatingModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<RatingModel, Long> {

    List<RatingModel> findByTouristSpotXid(String touristSpotXid);

    Optional<RatingModel> findByTouristSpotXidAndUserId(String touristSpotXid, Long userId);
}
