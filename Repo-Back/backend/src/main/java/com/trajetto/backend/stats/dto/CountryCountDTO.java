package com.trajetto.backend.stats.dto;

/** Usuarios por pais, ja contados e ordenados pelo banco. */
public record CountryCountDTO(String country, long count) {}
