package com.trajetto.backend.stats.repository;

import com.trajetto.backend.user.repository.UserRepository;
import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.user.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatsUserRepository extends UserRepository {

    @Query("SELECT u.country, COUNT(u) FROM UserModel u WHERE u.country IS NOT NULL GROUP BY u.country ORDER BY COUNT(u) DESC")
    List<Object[]> countByCountry();

    @Query("SELECT u.travelerProfile, COUNT(u) FROM UserModel u WHERE u.travelerProfile IS NOT NULL GROUP BY u.travelerProfile ORDER BY COUNT(u) DESC")
    List<Object[]> countByTravelerProfile();

    @Query("SELECT YEAR(u.birthDate), COUNT(u) FROM UserModel u WHERE u.birthDate IS NOT NULL GROUP BY YEAR(u.birthDate) ORDER BY YEAR(u.birthDate)")
    List<Object[]> countByBirthYear();
}