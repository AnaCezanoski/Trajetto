package com.trajetto.backend.stats.repository;

import com.trajetto.backend.stats.dto.UserOverviewDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Cartoes de usuarios do painel, vindos da stored procedure
 * {@code sp_stats_user_overview} (migracao V3).
 *
 * <p>Sao sete indicadores que antes exigiam quatro consultas de contagem mais
 * um {@code findAll()} da tabela de usuarios -- este ultimo apenas para
 * contar verificados e calcular a idade media em Java. A procedure faz tudo
 * em uma passada e devolve uma linha.</p>
 *
 * <p>A chamada usa {@link StoredProcedureQuery}, a forma padrao do JPA para
 * invocar rotina de banco: e ela que lida com o protocolo de resultado do
 * MySQL para procedures.</p>
 */
@Repository
public class UserOverviewStatsRepository {

    static final String PROCEDURE_NAME = "sp_stats_user_overview";

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Deliberadamente sem {@code readOnly = true}: uma conexao marcada como
     * somente leitura faz o MySQL recusar {@code CALL}, porque o servidor nao
     * tem como garantir sozinho que a rotina chamada nao grava. Quem garante
     * que esta so le e a propria procedure, declarada {@code READS SQL DATA}
     * na migracao V3.
     */
    @Transactional
    public UserOverviewDTO fetchOverview() {
        StoredProcedureQuery procedure = entityManager.createStoredProcedureQuery(PROCEDURE_NAME);
        procedure.execute();
        return toDTO(procedure.getResultList());
    }

    /**
     * Leitura da linha devolvida pela procedure, separada da chamada para
     * poder ser verificada sem um banco por perto.
     */
    static UserOverviewDTO toDTO(List<?> rows) {
        if (rows.isEmpty()) {
            return new UserOverviewDTO(0, 0, 0, 0, 0, 0, null);
        }

        Object[] row = (Object[]) rows.get(0);
        return new UserOverviewDTO(
                asLong(row[0]),
                asLong(row[1]),
                asLong(row[2]),
                asLong(row[6]),   // totalItineraries e a ultima coluna da procedure
                asLong(row[3]),
                asLong(row[4]),
                asNullableLong(row[5]));
    }

    /**
     * O MySQL devolve COUNT como BIGINT e SUM como DECIMAL; o driver traduz
     * isso ora para Long, ora para BigDecimal. Ler como {@link Number} evita
     * depender de qual dos dois chegou.
     */
    private static long asLong(Object value) {
        return value == null ? 0L : ((Number) value).longValue();
    }

    /** Idade media e nula quando nenhum usuario tem data de nascimento. */
    private static Long asNullableLong(Object value) {
        return value == null ? null : ((Number) value).longValue();
    }
}
