package com.trajetto.backend.stats.repository;

import com.trajetto.backend.rating.model.RatingModel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

/**
 * Rankings de lugares por avaliacao.
 *
 * <p>Estes dois indicadores concentravam dois problemas. Primeiro, todas as
 * avaliacoes vinham para a memoria e eram agrupadas por stream. Depois, para
 * cada xid do agrupamento a aplicacao ia ao banco buscar o nome do lugar --
 * um N+1 em cima de um resultado que ja era um agregado.</p>
 *
 * <p>As consultas abaixo resolvem os dois de uma vez. O nome do lugar entra
 * por um LEFT JOIN com uma CTE que usa a window function
 * {@code ROW_NUMBER() OVER (PARTITION BY xid ORDER BY id)}: o mesmo xid pode
 * ter varias linhas em {@code places} (uma por roteiro que o incluiu), e a
 * numeracao por particao permite ficar so com a primeira ocorrencia de cada
 * xid, que era o que {@code findFirstByXid} buscava linha a linha.</p>
 */
public interface RatingStatsRepository extends Repository<RatingModel, Long> {

    /**
     * Dez lugares com melhor media, com a media e o total de avaliacoes.
     *
     * <p>Colunas, na ordem: nome, xid, media, total de avaliacoes.</p>
     */
    @Query(value = """
            WITH primeiro_nome_por_xid AS (
                SELECT p.xid,
                       p.name,
                       ROW_NUMBER() OVER (PARTITION BY p.xid ORDER BY p.id) AS ordem
                FROM places p
                WHERE p.xid IS NOT NULL
            )
            SELECT COALESCE(pn.name, r.touristSpotXid) AS name,
                   r.touristSpotXid                    AS xid,
                   ROUND(AVG(r.rating), 1)             AS avgRating,
                   COUNT(*)                            AS totalRatings
            FROM RatingModel r
            LEFT JOIN primeiro_nome_por_xid pn
                   ON pn.xid = r.touristSpotXid AND pn.ordem = 1
            WHERE r.touristSpotXid IS NOT NULL
            GROUP BY r.touristSpotXid, pn.name
            ORDER BY avgRating DESC, totalRatings DESC, name ASC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findTopRated();

    /**
     * Dez lugares com mais comentarios. Avaliacao sem texto nao conta, como
     * no painel original.
     *
     * <p>Colunas, na ordem: nome, xid, total de comentarios.</p>
     */
    @Query(value = """
            WITH primeiro_nome_por_xid AS (
                SELECT p.xid,
                       p.name,
                       ROW_NUMBER() OVER (PARTITION BY p.xid ORDER BY p.id) AS ordem
                FROM places p
                WHERE p.xid IS NOT NULL
            )
            SELECT COALESCE(pn.name, r.touristSpotXid) AS name,
                   r.touristSpotXid                    AS xid,
                   COUNT(*)                            AS commentCount
            FROM RatingModel r
            LEFT JOIN primeiro_nome_por_xid pn
                   ON pn.xid = r.touristSpotXid AND pn.ordem = 1
            WHERE r.touristSpotXid IS NOT NULL
              AND r.comment IS NOT NULL
              AND TRIM(r.comment) <> ''
            GROUP BY r.touristSpotXid, pn.name
            ORDER BY commentCount DESC, name ASC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findMostCommented();
}
