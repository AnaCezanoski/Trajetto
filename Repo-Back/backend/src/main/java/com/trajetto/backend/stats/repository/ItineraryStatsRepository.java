package com.trajetto.backend.stats.repository;

import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

/**
 * Indicadores de roteiros do painel gerencial.
 *
 * <p>Os cartoes do topo deste bloco -- total, duracao media, nota media,
 * avaliados e nao avaliados -- ficam em {@link ItineraryOverviewStatsRepository},
 * que chama a stored procedure {@code sp_stats_itinerary_overview}. Aqui fica
 * o grafico mensal.</p>
 */
public interface ItineraryStatsRepository extends Repository<ItineraryModel, Long> {

    /**
     * Roteiros criados por mes, em ordem cronologica.
     *
     * <p>O agrupamento por ano e mes e feito pelo banco; a aplicacao so
     * traduz o par (ano, mes) para o rotulo em portugues que o grafico
     * exibe.</p>
     */
    @Query("""
            SELECT new com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO(
                       YEAR(i.startDate), MONTH(i.startDate), COUNT(i))
            FROM ItineraryModel i
            WHERE i.startDate IS NOT NULL
            GROUP BY YEAR(i.startDate), MONTH(i.startDate)
            ORDER BY YEAR(i.startDate) ASC, MONTH(i.startDate) ASC
            """)
    List<ItinerariesPerMonthRowDTO> countPerMonth();
}
