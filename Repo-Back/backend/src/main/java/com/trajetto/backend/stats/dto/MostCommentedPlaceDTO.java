package com.trajetto.backend.stats.dto;

/** Lugares que mais receberam comentario junto da avaliacao. */
public record MostCommentedPlaceDTO(String name, String xid, long commentCount) {}
