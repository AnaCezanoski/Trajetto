package com.trajetto.backend.stats.dto;

/** Lugares melhor avaliados, com media e volume de avaliacoes. */
public record TopRatedPlaceDTO(String name, String xid, double avgRating, long totalRatings) {}
