package com.trajetto.backend.stats.dto;

/**
 * Usuarios por perfil de viajante. Quem nao respondeu o teste entra como
 * "Sem perfil", rotulo resolvido na propria consulta.
 */
public record ProfileCountDTO(String profile, long count) {}
