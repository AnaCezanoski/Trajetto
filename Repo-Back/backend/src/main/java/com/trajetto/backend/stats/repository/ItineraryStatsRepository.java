package com.trajetto.backend.stats.repository;

import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

/**
 * Indicadores de roteiros do painel gerencial.
 *
 * <p>Os dois indicadores desta tela vinham de {@code findAll()} sobre a
 * tabela de roteiros: media de duracao, media de nota e distribuicao mensal
 * eram calculadas em memoria a partir da colecao inteira. Aqui a media e a
 * contagem saem prontas do banco.</p>
 */
public interface ItineraryStatsRepository extends Repository<ItineraryModel, Long> {

    /**
     * Total de roteiros, duracao media em dias, nota media e quantos foram
     * avaliados -- tudo em uma linha.
     *
     * <p>Consulta nativa por causa do {@code DATEDIFF}, que calcula a
     * duracao dentro do banco; em JPQL a diferenca entre duas datas exige
     * contorno. O {@code CASE} deixa fora da media os roteiros sem data
     * completa, do mesmo jeito que o filtro em Java fazia.</p>
     *
     * <p>Colunas, na ordem: total, duracao media, nota media, avaliados.</p>
     */
    @Query(value = """
            SELECT COUNT(*)                                                   AS totalItineraries,
                   AVG(CASE WHEN i.start_date IS NOT NULL AND i.end_date IS NOT NULL
                            THEN DATEDIFF(i.end_date, i.start_date) END)      AS avgDurationDays,
                   AVG(i.rating)                                              AS avgRating,
                   COALESCE(SUM(i.rating IS NOT NULL), 0)                     AS ratedCount
            FROM itineraries i
            """, nativeQuery = true)
    List<Object[]> overviewRow();

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
