package com.trajetto.backend.stats.dto;

/** Roteiros criados por mes, ja no rotulo pt-BR usado pelo grafico. */
public record MonthCountDTO(String month, long count) {}
