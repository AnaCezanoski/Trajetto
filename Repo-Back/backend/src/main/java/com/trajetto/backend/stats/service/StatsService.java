package com.trajetto.backend.stats.service;

import com.trajetto.backend.stats.dto.*;
import com.trajetto.backend.stats.repository.ItineraryStatsRepository;
import com.trajetto.backend.stats.repository.PlaceStatsRepository;
import com.trajetto.backend.stats.repository.RatingStatsRepository;
import com.trajetto.backend.stats.repository.UserOverviewStatsRepository;
import com.trajetto.backend.stats.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Fonte dos indicadores do painel gerencial.
 *
 * <p>A regra desta camada e simples: agrupar, contar e ordenar sao trabalho
 * do banco; o que sobra aqui e apresentacao -- traduzir mes para portugues,
 * montar a lista fixa de faixas etarias, arredondar media para uma casa. Em
 * nenhum ponto uma tabela inteira e carregada para ser percorrida em
 * memoria, que era como o painel funcionava antes.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    /** Quantos lugares os rankings do painel exibem. */
    private static final int TAMANHO_DO_RANKING = 10;

    private static final String[] MESES_ABREVIADOS =
            {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};

    private final UserOverviewStatsRepository userOverviewStatsRepository;
    private final UserStatsRepository userStatsRepository;
    private final ItineraryStatsRepository itineraryStatsRepository;
    private final PlaceStatsRepository placeStatsRepository;
    private final RatingStatsRepository ratingStatsRepository;

    // ─── Usuários ──────────────────────────────────────────────────────────

    /**
     * Cartões do topo, calculados pela stored procedure.
     *
     * <p>Sem {@code readOnly}, ao contrário do resto da classe: o MySQL
     * recusa {@code CALL} em conexão marcada como somente leitura. Quem
     * garante que a rotina só lê é a própria procedure, declarada
     * {@code READS SQL DATA}.</p>
     */
    @Transactional
    public UserOverviewDTO getUserOverview() {
        return userOverviewStatsRepository.fetchOverview();
    }

    public List<CountryCountDTO> getUsersByCountry() {
        return userStatsRepository.countByCountry();
    }

    public List<ProfileCountDTO> getUsersByTravelerProfile() {
        return userStatsRepository.countByTravelerProfile().stream()
                .map(linha -> new ProfileCountDTO((String) linha[0], asLong(linha[1])))
                .toList();
    }

    public List<ItinerariesPerUserDTO> getItinerariesPerUser() {
        return userStatsRepository.countItinerariesPerUser();
    }

    /**
     * Monta as sete faixas etárias na ordem fixa do painel a partir da linha
     * única devolvida pelo banco, incluindo as faixas zeradas — que um
     * {@code GROUP BY} não teria como produzir.
     */
    public List<AgeGroupCountDTO> getUsersByAgeGroup() {
        AgeGroupBreakdownDTO faixas = userStatsRepository.countByAgeGroup();

        return List.of(
                new AgeGroupCountDTO("< 18",  faixas.under18()),
                new AgeGroupCountDTO("18-24", faixas.from18to24()),
                new AgeGroupCountDTO("25-34", faixas.from25to34()),
                new AgeGroupCountDTO("35-44", faixas.from35to44()),
                new AgeGroupCountDTO("45-54", faixas.from45to54()),
                new AgeGroupCountDTO("55+",   faixas.from55plus()),
                new AgeGroupCountDTO("N/A",   faixas.unknownBirthDate()));
    }

    // ─── Roteiros ──────────────────────────────────────────────────────────

    public ItineraryOverviewDTO getItineraryOverview() {
        List<Object[]> linhas = itineraryStatsRepository.overviewRow();
        if (linhas.isEmpty()) {
            return new ItineraryOverviewDTO(0, null, null, 0, 0);
        }

        Object[] linha = linhas.get(0);
        long total      = asLong(linha[0]);
        long avaliados  = asLong(linha[3]);

        return new ItineraryOverviewDTO(
                total,
                arredondaUmaCasa(linha[1]),
                arredondaUmaCasa(linha[2]),
                avaliados,
                total - avaliados);
    }

    public List<MonthCountDTO> getItinerariesPerMonth() {
        return itineraryStatsRepository.countPerMonth().stream()
                .map(linha -> new MonthCountDTO(rotuloDoMes(linha.year(), linha.month()), linha.count()))
                .toList();
    }

    // ─── Lugares ───────────────────────────────────────────────────────────

    public List<CategoryCountDTO> getPlacesByCategory() {
        return placeStatsRepository.countByCategory().stream()
                .map(linha -> new CategoryCountDTO((String) linha[0], asLong(linha[1])))
                .toList();
    }

    public List<MostVisitedPlaceDTO> getMostVisitedPlaces() {
        return placeStatsRepository.findMostVisited(PageRequest.of(0, TAMANHO_DO_RANKING));
    }

    // ─── Avaliações ────────────────────────────────────────────────────────

    public List<TopRatedPlaceDTO> getTopRatedPlaces() {
        return ratingStatsRepository.findTopRated().stream()
                .map(linha -> new TopRatedPlaceDTO(
                        (String) linha[0],
                        (String) linha[1],
                        asDouble(linha[2]),
                        asLong(linha[3])))
                .toList();
    }

    public List<MostCommentedPlaceDTO> getMostCommentedPlaces() {
        return ratingStatsRepository.findMostCommented().stream()
                .map(linha -> new MostCommentedPlaceDTO(
                        (String) linha[0],
                        (String) linha[1],
                        asLong(linha[2])))
                .toList();
    }

    // ─── Apoio ─────────────────────────────────────────────────────────────

    /**
     * Rótulo do gráfico mensal: "Ago/25". O ano vem com dois dígitos, como o
     * painel já exibia.
     */
    static String rotuloDoMes(int ano, int mes) {
        return MESES_ABREVIADOS[mes - 1] + "/" + String.format("%02d", ano % 100);
    }

    /**
     * O MySQL devolve COUNT como BIGINT e SUM como DECIMAL, e o driver
     * traduz ora para Long, ora para BigDecimal. Ler como {@link Number}
     * evita depender de qual dos dois chegou.
     */
    static long asLong(Object valor) {
        return valor == null ? 0L : ((Number) valor).longValue();
    }

    static double asDouble(Object valor) {
        return valor == null ? 0d : ((Number) valor).doubleValue();
    }

    /**
     * Médias do painel são exibidas com uma casa decimal. Nulo é resposta
     * legítima: significa que não havia nenhum roteiro com data completa ou
     * com nota para entrar na média.
     */
    static Double arredondaUmaCasa(Object valor) {
        if (valor == null) {
            return null;
        }
        return Math.round(((Number) valor).doubleValue() * 10.0) / 10.0;
    }
}
