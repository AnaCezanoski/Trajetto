package com.trajetto.backend.stats.dto;

/** Quantos roteiros cada cliente criou, contados por um GROUP BY unico. */
public record ItinerariesPerUserDTO(String user, String email, long count) {}
