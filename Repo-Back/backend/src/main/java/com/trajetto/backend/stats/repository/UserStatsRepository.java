package com.trajetto.backend.stats.repository;

import com.trajetto.backend.stats.dto.AgeGroupBreakdownDTO;
import com.trajetto.backend.stats.dto.CountryCountDTO;
import com.trajetto.backend.stats.dto.ItinerariesPerUserDTO;
import com.trajetto.backend.user.model.UserModel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

/**
 * Indicadores de usuarios do painel gerencial, resolvidos por consultas
 * agregadas.
 *
 * <p>Antes o painel carregava a tabela de usuarios inteira com
 * {@code findAll()} e agrupava em memoria com streams: o custo crescia junto
 * com a base e a rede carregava linhas que ninguem ia exibir. Aqui o
 * {@code GROUP BY} acontece no banco e volta apenas o resultado -- uma linha
 * por pais, por perfil, por faixa etaria.</p>
 *
 * <p>Estende {@link Repository}, e nao {@code UserRepository}, de proposito:
 * assim o Spring nao passa a ter dois beans atendendo pelo mesmo tipo na hora
 * de injetar o repositorio de usuarios.</p>
 */
public interface UserStatsRepository extends Repository<UserModel, Long> {

    /**
     * Usuarios por pais, do mais frequente para o menos. Pais em branco fica
     * de fora, como no painel original.
     */
    @Query("""
            SELECT new com.trajetto.backend.stats.dto.CountryCountDTO(u.country, COUNT(u))
            FROM UserModel u
            WHERE u.country IS NOT NULL AND TRIM(u.country) <> ''
            GROUP BY u.country
            ORDER BY COUNT(u) DESC, u.country ASC
            """)
    List<CountryCountDTO> countByCountry();

    /**
     * Usuarios por perfil de viajante. Quem esta sem perfil (nulo ou em
     * branco) e agrupado sob "Sem perfil" pela propria consulta, e essa
     * fatia vai para o fim da lista.
     *
     * <p>Consulta nativa por causa da ordenacao. O MySQL roda com
     * {@code only_full_group_by} e recusa repetir a expressao do
     * agrupamento dentro do ORDER BY -- ele so aceita o apelido da coluna,
     * que e o que a consulta nativa permite escrever. Em JPQL, sem apelido,
     * a alternativa seria ordenar em Java.</p>
     *
     * <p>O apelido termina em {@code _label} para nao coincidir com nenhuma
     * coluna da tabela: quando os nomes batem, o ORDER BY do MySQL passa a
     * olhar a coluna real em vez do resultado agrupado.</p>
     *
     * <p>Colunas, na ordem: perfil, total.</p>
     */
    @Query(value = """
            SELECT COALESCE(NULLIF(TRIM(u.travelerProfile), ''), 'Sem perfil') AS profile_label,
                   COUNT(*)                                                    AS total
            FROM users u
            GROUP BY profile_label
            ORDER BY (profile_label = 'Sem perfil') ASC, total DESC
            """, nativeQuery = true)
    List<Object[]> countByTravelerProfile();

    /**
     * Roteiros por cliente.
     *
     * <p>Este era o pior ponto do painel: para cada usuario a aplicacao
     * disparava uma consulta de roteiros e contava o tamanho da lista em
     * Java (N+1 consultas, e cada roteiro vinha inteiro so para ser
     * contado). Agora e um LEFT JOIN agrupado: uma consulta, uma linha por
     * usuario, so o numero.</p>
     *
     * <p>O LEFT JOIN mantem no resultado o cliente que ainda nao criou
     * nenhum roteiro, com contagem zero.</p>
     */
    @Query("""
            SELECT new com.trajetto.backend.stats.dto.ItinerariesPerUserDTO(
                       CONCAT(u.firstName, ' ', u.lastName), u.email, COUNT(i.id))
            FROM UserModel u
            LEFT JOIN ItineraryModel i ON i.user = u
            WHERE u.isAdmin IS NULL OR u.isAdmin = FALSE
            GROUP BY u.id, u.firstName, u.lastName, u.email
            ORDER BY COUNT(i.id) DESC, u.firstName ASC
            """)
    List<ItinerariesPerUserDTO> countItinerariesPerUser();

    /**
     * Faixas etarias em uma linha so.
     *
     * <p>O painel exibe as sete faixas sempre, inclusive as vazias, e um
     * GROUP BY comum omitiria as vazias. Por isso cada faixa e uma soma
     * condicional: o banco continua fazendo a contagem, e a aplicacao so
     * recebe sete numeros.</p>
     *
     * <p>A idade e a diferenca entre os anos, e nao a idade completa, para
     * manter os mesmos numeros que o painel ja mostrava.</p>
     */
    @Query("""
            SELECT new com.trajetto.backend.stats.dto.AgeGroupBreakdownDTO(
                COALESCE(SUM(CASE WHEN u.birthDate IS NOT NULL
                                   AND (YEAR(CURRENT_DATE) - YEAR(u.birthDate)) < 18
                                  THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN u.birthDate IS NOT NULL
                                   AND (YEAR(CURRENT_DATE) - YEAR(u.birthDate)) BETWEEN 18 AND 24
                                  THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN u.birthDate IS NOT NULL
                                   AND (YEAR(CURRENT_DATE) - YEAR(u.birthDate)) BETWEEN 25 AND 34
                                  THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN u.birthDate IS NOT NULL
                                   AND (YEAR(CURRENT_DATE) - YEAR(u.birthDate)) BETWEEN 35 AND 44
                                  THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN u.birthDate IS NOT NULL
                                   AND (YEAR(CURRENT_DATE) - YEAR(u.birthDate)) BETWEEN 45 AND 54
                                  THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN u.birthDate IS NOT NULL
                                   AND (YEAR(CURRENT_DATE) - YEAR(u.birthDate)) > 54
                                  THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN u.birthDate IS NULL THEN 1 ELSE 0 END), 0))
            FROM UserModel u
            """)
    AgeGroupBreakdownDTO countByAgeGroup();
}
