package com.trajetto.backend.stats.repository;

import com.trajetto.backend.stats.dto.ItineraryOverviewDTO;
import com.trajetto.backend.stats.dto.UserOverviewDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * BE02.2 — as duas stored procedures do painel devolvem uma linha só, e ler
 * essa linha é a única coisa que a aplicação ainda faz com elas. O teste
 * cobre justamente isso, sem banco: as linhas são montadas nos tipos que o
 * driver do MySQL entrega de verdade — {@code Long} para {@code COUNT},
 * {@code BigDecimal} para {@code SUM} e {@code ROUND(AVG(...))} —, porque
 * essa mistura é fonte fácil de erro ao ler agregado.
 */
class OverviewProcedureRowTest {

    @Test
    @DisplayName("Cartões de roteiros vêm prontos da procedure, sem conta refeita em Java")
    void cartoesDeRoteiros() {
        // total, duração média, nota média, avaliados, não avaliados
        List<Object[]> linha = List.<Object[]>of(new Object[]{
                10L, new BigDecimal("4.8"), new BigDecimal("3.7"), new BigDecimal("6"), new BigDecimal("4")});

        ItineraryOverviewDTO cartoes = ItineraryOverviewStatsRepository.toDTO(linha);

        assertEquals(10, cartoes.totalItineraries());
        assertEquals(4.8, cartoes.avgDurationDays());
        assertEquals(3.7, cartoes.avgRating());
        assertEquals(6, cartoes.ratedCount());
        assertEquals(4, cartoes.unratedCount());
    }

    @Test
    @DisplayName("Sem roteiro com data ou nota, a média é nula em vez de zero")
    void mediasNulasQuandoNaoHaOQueMediar() {
        List<Object[]> linha = List.<Object[]>of(new Object[]{
                3L, null, null, BigDecimal.ZERO, new BigDecimal("3")});

        ItineraryOverviewDTO cartoes = ItineraryOverviewStatsRepository.toDTO(linha);

        assertEquals(3, cartoes.totalItineraries());
        assertNull(cartoes.avgDurationDays());
        assertNull(cartoes.avgRating());
        assertEquals(0, cartoes.ratedCount());
        assertEquals(3, cartoes.unratedCount());
    }

    @Test
    @DisplayName("Banco vazio não quebra nenhum dos dois blocos de cartões")
    void semLinhaNenhuma() {
        ItineraryOverviewDTO roteiros = ItineraryOverviewStatsRepository.toDTO(List.of());
        assertEquals(0, roteiros.totalItineraries());
        assertNull(roteiros.avgRating());

        UserOverviewDTO usuarios = UserOverviewStatsRepository.toDTO(List.of());
        assertEquals(0, usuarios.totalUsers());
        assertNull(usuarios.avgAge());
    }

    @Test
    @DisplayName("Cartões de usuários leem a linha na ordem em que a procedure a declara")
    void cartoesDeUsuarios() {
        // total, admins, clientes, verificados, não verificados, idade média, roteiros
        List<Object[]> linha = List.<Object[]>of(new Object[]{
                20L, new BigDecimal("3"), new BigDecimal("17"),
                new BigDecimal("12"), new BigDecimal("8"), new BigDecimal("31"), 44L});

        UserOverviewDTO cartoes = UserOverviewStatsRepository.toDTO(linha);

        assertEquals(20, cartoes.totalUsers());
        assertEquals(3, cartoes.totalAdmins());
        assertEquals(17, cartoes.totalClients());
        assertEquals(44, cartoes.totalItineraries());
        assertEquals(12, cartoes.verifiedUsers());
        assertEquals(8, cartoes.unverifiedUsers());
        assertEquals(31L, cartoes.avgAge());
    }
}
