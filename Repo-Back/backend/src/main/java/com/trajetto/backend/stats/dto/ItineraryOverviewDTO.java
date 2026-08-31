package com.trajetto.backend.stats.dto;

/** Cartoes do topo do painel de roteiros. */
public record ItineraryOverviewDTO(
        long totalItineraries,
        Double avgDurationDays,
        Double avgRating,
        long ratedCount,
        long unratedCount
) {}
