package com.trajetto.backend.stats.repository;

import com.trajetto.backend.stats.dto.ItineraryOverviewDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Cartoes de roteiros do painel, vindos da stored procedure
 * {@code sp_stats_itinerary_overview} (migracao V5).
 *
 * <p>Contraparte de {@link UserOverviewStatsRepository} para o bloco de
 * roteiros. Sao cinco indicadores em uma linha so: total, duracao media,
 * nota media, avaliados e nao avaliados. A media ja chega arredondada e o
 * total de nao avaliados ja chega contado -- as duas contas que a aplicacao
 * ainda refazia depois de receber o agregado.</p>
 */
@Repository
public class ItineraryOverviewStatsRepository {

    static final String PROCEDURE_NAME = "sp_stats_itinerary_overview";

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Deliberadamente sem {@code readOnly = true}, pelo mesmo motivo da
     * procedure de usuarios: em conexao marcada como somente leitura o MySQL
     * recusa {@code CALL}, porque o servidor nao tem como garantir sozinho
     * que a rotina chamada nao grava. Quem garante que esta so le e a propria
     * procedure, declarada {@code READS SQL DATA} na migracao V5.
     */
    @Transactional
    public ItineraryOverviewDTO fetchOverview() {
        StoredProcedureQuery procedure = entityManager.createStoredProcedureQuery(PROCEDURE_NAME);
        procedure.execute();
        return toDTO(procedure.getResultList());
    }

    /**
     * Leitura da linha devolvida pela procedure, separada da chamada para
     * poder ser verificada sem um banco por perto.
     */
    static ItineraryOverviewDTO toDTO(List<?> rows) {
        if (rows.isEmpty()) {
            return new ItineraryOverviewDTO(0, null, null, 0, 0);
        }

        Object[] row = (Object[]) rows.get(0);
        return new ItineraryOverviewDTO(
                asLong(row[0]),
                asNullableDouble(row[1]),
                asNullableDouble(row[2]),
                asLong(row[3]),
                asLong(row[4]));
    }

    /**
     * O MySQL devolve COUNT como BIGINT e SUM como DECIMAL; o driver traduz
     * isso ora para Long, ora para BigDecimal. Ler como {@link Number} evita
     * depender de qual dos dois chegou.
     */
    private static long asLong(Object value) {
        return value == null ? 0L : ((Number) value).longValue();
    }

    /**
     * Media nula e resposta legitima, nao zero: significa que nenhum roteiro
     * tinha as duas datas preenchidas, ou que nenhum foi avaliado ainda.
     */
    private static Double asNullableDouble(Object value) {
        return value == null ? null : ((Number) value).doubleValue();
    }
}
