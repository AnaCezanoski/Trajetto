package com.trajetto.backend.stats.controller;

import com.trajetto.backend.stats.dto.*;
import com.trajetto.backend.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Indicadores do painel gerencial.
 *
 * <p>O controlador só expõe os endpoints: quem agrupa, conta, ordena e
 * recorta é o banco, pelas consultas do {@code StatsService}. Cada endpoint
 * devolve o que o painel exibe, e não a coleção de onde o número saiu.</p>
 *
 * <p>Um único contrato JSON mudou desde então: {@code /itineraries-per-user}
 * devolvia a lista de todos os clientes, que o painel recortava e contava na
 * tela; agora devolve o ranking já cortado em dez mais os dois totais de
 * clientes com e sem roteiro, ambos contados pelo banco.</p>
 */
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@SecurityRequirement(name = "AuthServer")
@PreAuthorize("hasRole('ADMIN')")
public class StatsController {

    private final StatsService statsService;

    // ─── Usuários ──────────────────────────────────────────────────────────

    @Operation(summary = "Cartões de usuários do painel (stored procedure sp_stats_user_overview)")
    @GetMapping("/overview")
    public ResponseEntity<UserOverviewDTO> getOverview() {
        return ResponseEntity.ok(statsService.getUserOverview());
    }

    @Operation(summary = "Usuários agrupados por país")
    @GetMapping("/countries")
    public ResponseEntity<List<CountryCountDTO>> getByCountry() {
        return ResponseEntity.ok(statsService.getUsersByCountry());
    }

    @Operation(summary = "Usuários agrupados por perfil de viajante")
    @GetMapping("/traveler-profiles")
    public ResponseEntity<List<ProfileCountDTO>> getTravelerProfiles() {
        return ResponseEntity.ok(statsService.getUsersByTravelerProfile());
    }

    @Operation(summary = "Ranking de roteiros por cliente, com o total de clientes com e sem roteiro")
    @GetMapping("/itineraries-per-user")
    public ResponseEntity<ItinerariesPerUserPanelDTO> getItinerariesPerUser() {
        return ResponseEntity.ok(statsService.getItinerariesPerUser());
    }

    @Operation(summary = "Usuários agrupados por faixa etária")
    @GetMapping("/age-groups")
    public ResponseEntity<List<AgeGroupCountDTO>> getAgeGroups() {
        return ResponseEntity.ok(statsService.getUsersByAgeGroup());
    }

    // ─── Roteiros ──────────────────────────────────────────────────────────

    @Operation(summary = "Cartões de roteiros do painel (stored procedure sp_stats_itinerary_overview)")
    @GetMapping("/itinerary-overview")
    public ResponseEntity<ItineraryOverviewDTO> getItineraryOverview() {
        return ResponseEntity.ok(statsService.getItineraryOverview());
    }

    @Operation(summary = "Roteiros criados por mês")
    @GetMapping("/itineraries-per-month")
    public ResponseEntity<List<MonthCountDTO>> getItinerariesPerMonth() {
        return ResponseEntity.ok(statsService.getItinerariesPerMonth());
    }

    // ─── Lugares ───────────────────────────────────────────────────────────

    @Operation(summary = "Lugares agrupados por categoria")
    @GetMapping("/places-by-category")
    public ResponseEntity<List<CategoryCountDTO>> getPlacesByCategory() {
        return ResponseEntity.ok(statsService.getPlacesByCategory());
    }

    @Operation(summary = "Dez lugares com melhor média de avaliação")
    @GetMapping("/top-rated-places")
    public ResponseEntity<List<TopRatedPlaceDTO>> getTopRatedPlaces() {
        return ResponseEntity.ok(statsService.getTopRatedPlaces());
    }

    @Operation(summary = "Dez lugares com mais comentários")
    @GetMapping("/most-commented-places")
    public ResponseEntity<List<MostCommentedPlaceDTO>> getMostCommentedPlaces() {
        return ResponseEntity.ok(statsService.getMostCommentedPlaces());
    }

    @Operation(summary = "Dez lugares que mais aparecem em roteiros")
    @GetMapping("/most-visited-places")
    public ResponseEntity<List<MostVisitedPlaceDTO>> getMostVisitedPlaces() {
        return ResponseEntity.ok(statsService.getMostVisitedPlaces());
    }
}
