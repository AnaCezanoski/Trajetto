package com.trajetto.backend.stats.dto;

/** Uma faixa etaria do painel, no formato que o aplicativo espera. */
public record AgeGroupCountDTO(String group, long count) {}
