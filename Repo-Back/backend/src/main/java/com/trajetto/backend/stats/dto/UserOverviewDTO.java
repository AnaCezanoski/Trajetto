package com.trajetto.backend.stats.dto;

/**
 * Cartoes do topo do painel gerencial. Vem prontos da stored procedure
 * {@code sp_stats_user_overview}: uma linha, sete numeros, nenhuma lista de
 * usuarios trafegada.
 *
 * <p>A ordem dos componentes e a ordem das chaves no JSON, e ela reproduz o
 * contrato que o aplicativo ja consumia.</p>
 */
public record UserOverviewDTO(
        long totalUsers,
        long totalAdmins,
        long totalClients,
        long totalItineraries,
        long verifiedUsers,
        long unverifiedUsers,
        Long avgAge
) {}
