package com.trajetto.backend.stats.service;

import com.trajetto.backend.stats.dto.AgeGroupBreakdownDTO;
import com.trajetto.backend.stats.dto.AgeGroupCountDTO;
import com.trajetto.backend.stats.dto.CategoryCountDTO;
import com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO;
import com.trajetto.backend.stats.dto.ItinerariesPerUserDTO;
import com.trajetto.backend.stats.dto.ItinerariesPerUserPanelDTO;
import com.trajetto.backend.stats.dto.ItineraryOverviewDTO;
import com.trajetto.backend.stats.dto.MonthCountDTO;
import com.trajetto.backend.stats.dto.MostCommentedPlaceDTO;
import com.trajetto.backend.stats.dto.ProfileCountDTO;
import com.trajetto.backend.stats.dto.TopRatedPlaceDTO;
import com.trajetto.backend.stats.repository.ItineraryOverviewStatsRepository;
import com.trajetto.backend.stats.repository.ItineraryStatsRepository;
import com.trajetto.backend.stats.repository.PlaceStatsRepository;
import com.trajetto.backend.stats.repository.RatingStatsRepository;
import com.trajetto.backend.stats.repository.UserOverviewStatsRepository;
import com.trajetto.backend.stats.repository.UserStatsRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Pageable;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Depois que agrupar, contar, ordenar e recortar passaram a ser trabalho do
 * banco, o que sobrou no {@code StatsService} é a tradução entre o resultado
 * da consulta e o contrato que o painel consome. É isso que este teste cobre:
 * nenhuma conta é refeita aqui, os repositórios são dublês devolvendo linhas
 * prontas.
 *
 * <p>As linhas usam os mesmos tipos que o driver do MySQL entrega de verdade —
 * {@code BigDecimal} para {@code AVG} e {@code SUM}, {@code Long} para
 * {@code COUNT} —, porque essa mistura é fonte fácil de erro ao ler agregados.</p>
 */
@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock private UserOverviewStatsRepository userOverviewStatsRepository;
    @Mock private UserStatsRepository userStatsRepository;
    @Mock private ItineraryOverviewStatsRepository itineraryOverviewStatsRepository;
    @Mock private ItineraryStatsRepository itineraryStatsRepository;
    @Mock private PlaceStatsRepository placeStatsRepository;
    @Mock private RatingStatsRepository ratingStatsRepository;

    private StatsService service() {
        return new StatsService(userOverviewStatsRepository, userStatsRepository,
                itineraryOverviewStatsRepository, itineraryStatsRepository,
                placeStatsRepository, ratingStatsRepository);
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
    @DisplayName("Cartões de roteiros são repassados como a procedure os entregou")
    void cartoesDeRoteirosVemProntos() {
        ItineraryOverviewDTO daProcedure = new ItineraryOverviewDTO(10, 4.8, 3.7, 6, 4);
        when(itineraryOverviewStatsRepository.fetchOverview()).thenReturn(daProcedure);

        assertSame(daProcedure, service().getItineraryOverview());
    }

    @Test
    @DisplayName("O bloco de roteiros por cliente junta o ranking cortado no banco com as duas contagens")
    void roteirosPorCliente() {
        when(userStatsRepository.findTopClientsByItineraryCount(any())).thenReturn(List.of(
                new ItinerariesPerUserDTO("Ana Souza", "ana@trajetto.com", 5),
                new ItinerariesPerUserDTO("Bruno Lima", "bruno@trajetto.com", 2)));
        when(userStatsRepository.countClientItineraryCoverage()).thenReturn(List.<Object[]>of(
                new Object[]{new BigDecimal("2"), new BigDecimal("7")}));

        ItinerariesPerUserPanelDTO bloco = service().getItinerariesPerUser();

        assertEquals(2, bloco.topClients().size());
        assertEquals("Ana Souza", bloco.topClients().get(0).user());
        assertEquals(2, bloco.clientsWithItinerary());
        assertEquals(7, bloco.clientsWithoutItinerary());
    }

    @Test
    @DisplayName("O ranking pede ao banco só as dez linhas que o painel exibe")
    void rankingPedeApenasDezLinhas() {
        when(userStatsRepository.findTopClientsByItineraryCount(any())).thenReturn(List.of());
        when(userStatsRepository.countClientItineraryCoverage()).thenReturn(List.<Object[]>of());

        service().getItinerariesPerUser();

        ArgumentCaptor<Pageable> recorte = ArgumentCaptor.forClass(Pageable.class);
        verify(userStatsRepository).findTopClientsByItineraryCount(recorte.capture());
        assertEquals(10, recorte.getValue().getPageSize());
        assertEquals(0, recorte.getValue().getPageNumber());
    }

    @Test
    @DisplayName("Base sem nenhum cliente não quebra o bloco de roteiros por cliente")
    void semClienteNenhum() {
        when(userStatsRepository.findTopClientsByItineraryCount(any())).thenReturn(List.of());
        when(userStatsRepository.countClientItineraryCoverage()).thenReturn(List.<Object[]>of());

        ItinerariesPerUserPanelDTO bloco = service().getItinerariesPerUser();

        assertEquals(List.of(), bloco.topClients());
        assertEquals(0, bloco.clientsWithItinerary());
        assertEquals(0, bloco.clientsWithoutItinerary());
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
