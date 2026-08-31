package com.trajetto.backend.stats.dto;

/** Lugares por categoria; sem categoria entra como "Outros". */
public record CategoryCountDTO(String category, long count) {}
