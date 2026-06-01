package com.trajetto.backend.itinerary.repository;

import com.trajetto.backend.itinerary.model.PlaceModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaceRepository extends JpaRepository<PlaceModel, Long> {

    java.util.Optional<PlaceModel> findFirstByXid(String xid);
}
