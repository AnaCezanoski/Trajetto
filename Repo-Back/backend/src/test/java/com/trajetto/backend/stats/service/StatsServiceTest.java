package com.trajetto.backend.stats.service;

import com.trajetto.backend.stats.dto.AgeGroupBreakdownDTO;
import com.trajetto.backend.stats.dto.AgeGroupCountDTO;
import com.trajetto.backend.stats.dto.CategoryCountDTO;
import com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO;
import com.trajetto.backend.stats.dto.ItineraryOverviewDTO;
import com.trajetto.backend.stats.dto.MonthCountDTO;
import com.trajetto.backend.stats.dto.MostCommentedPlaceDTO;
import com.trajetto.backend.stats.dto.ProfileCountDTO;
import com.trajetto.backend.stats.dto.TopRatedPlaceDTO;
import com.trajetto.backend.stats.repository.ItineraryStatsRepository;
import com.trajetto.backend.stats.repository.PlaceStatsRepository;
import com.trajetto.backend.stats.repository.RatingStatsRepository;
import com.trajetto.backend.stats.repository.UserOverviewStatsRepository;
import com.trajetto.backend.stats.repository.UserStatsRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

/**
 * BE02.1 — depois que agrupar e contar passaram a ser trabalho do banco, o que
 * sobrou no {@code StatsService} é a tradução entre o resultado da consulta e o
 * contrato que o painel consome. É isso que este teste cobre: nenhuma conta é
 * refeita aqui, os repositórios são dublês devolvendo linhas prontas.
 *
 * <p>As linhas usam os mesmos tipos que o driver do MySQL entrega de verdade —
 * {@code BigDecimal} para {@code AVG} e {@code SUM}, {@code Long} para
 * {@code COUNT} —, porque essa mistura é fonte fácil de erro ao ler agregados.</p>
 */
@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock private UserOverviewStatsRepository userOverviewStatsRepository;
    @Mock private UserStatsRepository userStatsRepository;
    @Mock private ItineraryStatsRepository itineraryStatsRepository;
    @Mock private PlaceStatsRepository placeStatsRepository;
    @Mock private RatingStatsRepository ratingStatsRepository;

    private StatsService service() {
        return new StatsService(userOverviewStatsRepository, userStatsRepository,
                itineraryStatsRepository, placeStatsRepository, ratingStatsRepository);
    }

    @Test
    @DisplayName("Faixas etárias saem sempre nas sete fatias, inclusive as zeradas")
    void faixasEtariasIncluemAsVazias() {
        when(userStatsRepository.countByAgeGroup())
                .thenReturn(new AgeGroupBreakdownDTO(1, 0, 4, 0, 0, 2, 3));

        List<AgeGroupCountDTO> faixas = service().getUsersByAgeGroup();

        assertEquals(List.of(
                new AgeGroupCountDTO("< 18",  1),
                new AgeGroupCountDTO("18-24", 0),
                new AgeGroupCountDTO("25-34", 4),
                new AgeGroupCountDTO("35-44", 0),
                new AgeGroupCountDTO("45-54", 0),
                new AgeGroupCountDTO("55+",   2),
                new AgeGroupCountDTO("N/A",   3)), faixas);
    }

    @Test
    @DisplayName("Cartões de roteiros arredondam para uma casa e fecham a conta dos não avaliados")
    void cartoesDeRoteiros() {
        // total, duração média, nota média, avaliados — nos tipos que o MySQL devolve
        when(itineraryStatsRepository.overviewRow()).thenReturn(List.<Object[]>of(
                new Object[]{10L, new BigDecimal("4.7500"), new BigDecimal("3.6667"), new BigDecimal("6")}));

        ItineraryOverviewDTO cartoes = service().getItineraryOverview();

        assertEquals(10, cartoes.totalItineraries());
        assertEquals(4.8, cartoes.avgDurationDays());
        assertEquals(3.7, cartoes.avgRating());
        assertEquals(6, cartoes.ratedCount());
        assertEquals(4, cartoes.unratedCount());
    }

    @Test
    @DisplayName("Sem roteiro com data ou nota, a média é nula em vez de zero")
    void mediasNulasQuandoNaoHaOQueMediar() {
        when(itineraryStatsRepository.overviewRow()).thenReturn(List.<Object[]>of(
                new Object[]{0L, null, null, BigDecimal.ZERO}));

        ItineraryOverviewDTO cartoes = service().getItineraryOverview();

        assertEquals(0, cartoes.totalItineraries());
        assertNull(cartoes.avgDurationDays());
        assertNull(cartoes.avgRating());
        assertEquals(0, cartoes.unratedCount());
    }

    @Test
    @DisplayName("Banco de roteiros vazio não quebra os cartões")
    void semLinhaNenhuma() {
        when(itineraryStatsRepository.overviewRow()).thenReturn(List.<Object[]>of());

        ItineraryOverviewDTO cartoes = service().getItineraryOverview();

        assertEquals(0, cartoes.totalItineraries());
        assertNull(cartoes.avgRating());
    }

    @Test
    @DisplayName("O par (ano, mês) vindo do agrupamento vira o rótulo em português do gráfico")
    void rotuloDoGraficoMensal() {
        when(itineraryStatsRepository.countPerMonth()).thenReturn(List.of(
                new ItinerariesPerMonthRowDTO(2025, 8, 3L),
                new ItinerariesPerMonthRowDTO(2026, 1, 5L)));

        List<MonthCountDTO> meses = service().getItinerariesPerMonth();

        assertEquals(List.of(
                new MonthCountDTO("Ago/25", 3),
                new MonthCountDTO("Jan/26", 5)), meses);
    }

    @Test
    @DisplayName("Ano com dois dígitos mantém o zero à esquerda")
    void anoComZeroAEsquerda() {
        assertEquals("Mar/05", StatsService.rotuloDoMes(2005, 3));
        assertEquals("Dez/99", StatsService.rotuloDoMes(1999, 12));
    }

    @Test
    @DisplayName("Perfis e categorias mantêm a ordem que o banco definiu")
    void ordemDefinidaPeloBancoEPreservada() {
        when(userStatsRepository.countByTravelerProfile()).thenReturn(List.<Object[]>of(
                new Object[]{"Cultural", 7L},
                new Object[]{"Sem perfil", 9L}));
        when(placeStatsRepository.countByCategory()).thenReturn(List.<Object[]>of(
                new Object[]{"Museu", 4L},
                new Object[]{"Outros", 8L}));

        StatsService service = service();

        assertEquals(List.of(
                new ProfileCountDTO("Cultural", 7),
                new ProfileCountDTO("Sem perfil", 9)), service.getUsersByTravelerProfile());
        assertEquals(List.of(
                new CategoryCountDTO("Museu", 4),
                new CategoryCountDTO("Outros", 8)), service.getPlacesByCategory());
    }

    @Test
    @DisplayName("Rankings de lugares leem média e contagem sem depender do tipo numérico do driver")
    void rankingsDeLugares() {
        when(ratingStatsRepository.findTopRated()).thenReturn(List.<Object[]>of(
                new Object[]{"Coliseu", "X1", new BigDecimal("4.5"), 12L}));
        when(ratingStatsRepository.findMostCommented()).thenReturn(List.<Object[]>of(
                new Object[]{"Coliseu", "X1", 12L}));

        StatsService service = service();

        assertEquals(List.of(new TopRatedPlaceDTO("Coliseu", "X1", 4.5, 12)), service.getTopRatedPlaces());
        assertEquals(List.of(new MostCommentedPlaceDTO("Coliseu", "X1", 12)), service.getMostCommentedPlaces());
    }

    @Test
    @DisplayName("Lugar sem nome cadastrado cai no xid, como o painel já fazia")
    void lugarSemNomeUsaOXid() {
        when(ratingStatsRepository.findMostCommented()).thenReturn(List.<Object[]>of(
                new Object[]{"X9", "X9", 2L}));

        assertEquals(List.of(new MostCommentedPlaceDTO("X9", "X9", 2)),
                service().getMostCommentedPlaces());
    }
}
