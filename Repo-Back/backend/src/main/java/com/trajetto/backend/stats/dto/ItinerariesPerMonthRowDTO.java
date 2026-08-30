package com.trajetto.backend.stats.dto;

/**
 * Linha crua do agrupamento mensal de roteiros, como o banco devolve.
 *
 * <p>O rotulo em portugues ("Ago/25") e montado pelo {@code StatsService}:
 * agrupar e contar e trabalho do banco, nomear mes em portugues e
 * apresentacao.</p>
 */
public record ItinerariesPerMonthRowDTO(Integer year, Integer month, long count) {}
