package com.trajetto.backend.stats.dto;

/**
 * Linha unica com a contagem de cada faixa etaria, do jeito que sai do banco.
 *
 * <p>Um GROUP BY comum so devolveria as faixas que tem gente, e o painel
 * precisa das sete sempre, inclusive as zeradas. Por isso a consulta soma uma
 * coluna por faixa e o {@code StatsService} monta a lista final na ordem
 * fixa.</p>
 */
public record AgeGroupBreakdownDTO(
        long under18,
        long from18to24,
        long from25to34,
        long from35to44,
        long from45to54,
        long from55plus,
        long unknownBirthDate
) {}
