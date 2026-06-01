package com.trajetto.backend.stats.controller;

import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.itinerary.repository.PlaceRepository;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@SecurityRequirement(name = "AuthServer")
@PreAuthorize("hasRole('ADMIN')")
public class StatsController {

    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;
    private final PlaceRepository placeRepository;
    private final RatingRepository ratingRepository;

    // ─── Endpoints de usuários (existentes) ───────────────────────────────────

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        long totalUsers   = userRepository.count();
        long totalAdmins  = userRepository.countByIsAdmin(true);
        long totalClients = userRepository.countByIsAdmin(false);
        long totalItineraries = itineraryRepository.count();

        List<UserModel> allUsers = userRepository.findAll();
        long verified   = allUsers.stream().filter(UserModel::isVerified).count();
        long unverified = totalUsers - verified;

        OptionalDouble avgAge = allUsers.stream()
                .filter(u -> u.getBirthDate() != null)
                .mapToInt(u -> LocalDate.now().getYear() - u.getBirthDate().getYear())
                .average();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalUsers",       totalUsers);
        result.put("totalAdmins",      totalAdmins);
        result.put("totalClients",     totalClients);
        result.put("totalItineraries", totalItineraries);
        result.put("verifiedUsers",    verified);
        result.put("unverifiedUsers",  unverified);
        result.put("avgAge",           avgAge.isPresent() ? Math.round(avgAge.getAsDouble()) : null);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/countries")
    public ResponseEntity<?> getByCountry() {
        List<UserModel> users = userRepository.findAll();
        Map<String, Long> counts = users.stream()
                .filter(u -> u.getCountry() != null && !u.getCountry().isBlank())
                .collect(Collectors.groupingBy(UserModel::getCountry, Collectors.counting()));

        List<Map<String, Object>> result = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("country", e.getKey());
                    m.put("count",   e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/traveler-profiles")
    public ResponseEntity<?> getTravelerProfiles() {
        List<UserModel> users = userRepository.findAll();
        Map<String, Long> counts = users.stream()
                .filter(u -> u.getTravelerProfile() != null && !u.getTravelerProfile().isBlank())
                .collect(Collectors.groupingBy(UserModel::getTravelerProfile, Collectors.counting()));

        long withoutProfile = users.stream()
                .filter(u -> u.getTravelerProfile() == null || u.getTravelerProfile().isBlank())
                .count();

        List<Map<String, Object>> result = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("profile", e.getKey());
                    m.put("count",   e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        if (withoutProfile > 0) {
            Map<String, Object> none = new LinkedHashMap<>();
            none.put("profile", "Sem perfil");
            none.put("count",   withoutProfile);
            result.add(none);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/itineraries-per-user")
    public ResponseEntity<?> getItinerariesPerUser() {
        List<UserModel> users = userRepository.findByIsAdmin(false);
        List<Map<String, Object>> result = users.stream()
                .map(u -> {
                    long count = itineraryRepository.findByUserOrderByStartDateDesc(u).size();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("user",  u.getFirstName() + " " + u.getLastName());
                    m.put("email", u.getEmail());
                    m.put("count", count);
                    return m;
                })
                .sorted((a, b) -> Long.compare((long) b.get("count"), (long) a.get("count")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/age-groups")
    public ResponseEntity<?> getAgeGroups() {
        List<UserModel> users = userRepository.findAll();
        int currentYear = LocalDate.now().getYear();

        Map<String, Long> groups = new LinkedHashMap<>();
        groups.put("< 18",  0L);
        groups.put("18-24", 0L);
        groups.put("25-34", 0L);
        groups.put("35-44", 0L);
        groups.put("45-54", 0L);
        groups.put("55+",   0L);
        groups.put("N/A",   0L);

        for (UserModel u : users) {
            if (u.getBirthDate() == null) { groups.merge("N/A", 1L, Long::sum); continue; }
            int age = currentYear - u.getBirthDate().getYear();
            if      (age < 18)  groups.merge("< 18",  1L, Long::sum);
            else if (age <= 24) groups.merge("18-24", 1L, Long::sum);
            else if (age <= 34) groups.merge("25-34", 1L, Long::sum);
            else if (age <= 44) groups.merge("35-44", 1L, Long::sum);
            else if (age <= 54) groups.merge("45-54", 1L, Long::sum);
            else                groups.merge("55+",   1L, Long::sum);
        }

        List<Map<String, Object>> result = groups.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("group", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ─── Endpoints de roteiros ─────────────────────────────────────────────────

    @GetMapping("/itinerary-overview")
    public ResponseEntity<?> getItineraryOverview() {
        List<ItineraryModel> all = itineraryRepository.findAll();
        long total = all.size();

        OptionalDouble avgDuration = all.stream()
                .filter(i -> i.getStartDate() != null && i.getEndDate() != null)
                .mapToLong(i -> ChronoUnit.DAYS.between(i.getStartDate(), i.getEndDate()))
                .average();

        OptionalDouble avgRating = all.stream()
                .filter(i -> i.getRating() != null)
                .mapToInt(ItineraryModel::getRating)
                .average();

        long ratedCount   = all.stream().filter(i -> i.getRating() != null).count();
        long unratedCount = total - ratedCount;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalItineraries", total);
        result.put("avgDurationDays",  avgDuration.isPresent() ? Math.round(avgDuration.getAsDouble() * 10.0) / 10.0 : null);
        result.put("avgRating",        avgRating.isPresent()   ? Math.round(avgRating.getAsDouble()   * 10.0) / 10.0 : null);
        result.put("ratedCount",       ratedCount);
        result.put("unratedCount",     unratedCount);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/itineraries-per-month")
    public ResponseEntity<?> getItinerariesPerMonth() {
        List<ItineraryModel> all = itineraryRepository.findAll();

        // TreeMap keyed by "YYYY-MM" preserves chronological order
        Map<String, Long> counts = new TreeMap<>();
        all.stream()
                .filter(i -> i.getStartDate() != null)
                .forEach(i -> {
                    String key = String.format("%d-%02d",
                            i.getStartDate().getYear(),
                            i.getStartDate().getMonthValue());
                    counts.merge(key, 1L, Long::sum);
                });

        String[] ptMonths = {"Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"};

        List<Map<String, Object>> result = counts.entrySet().stream()
                .map(e -> {
                    String[] parts = e.getKey().split("-");
                    int month = Integer.parseInt(parts[1]);
                    String year = parts[0].substring(2);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("month", ptMonths[month - 1] + "/" + year);
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/places-by-category")
    public ResponseEntity<?> getPlacesByCategory() {
        List<PlaceModel> places = placeRepository.findAll();

        Map<String, Long> counts = places.stream()
                .filter(p -> p.getCategory() != null && !p.getCategory().isBlank())
                .collect(Collectors.groupingBy(PlaceModel::getCategory, Collectors.counting()));

        long noCategory = places.stream()
                .filter(p -> p.getCategory() == null || p.getCategory().isBlank())
                .count();

        List<Map<String, Object>> result = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("category", e.getKey());
                    m.put("count",    e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        if (noCategory > 0) {
            Map<String, Object> none = new LinkedHashMap<>();
            none.put("category", "Outros");
            none.put("count",    noCategory);
            result.add(none);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-rated-places")
    public ResponseEntity<?> getTopRatedPlaces() {
        List<RatingModel> ratings = ratingRepository.findAll();
        if (ratings.isEmpty()) return ResponseEntity.ok(List.of());

        Map<String, DoubleSummaryStatistics> statsByXid = ratings.stream()
                .collect(Collectors.groupingBy(
                        RatingModel::getTouristSpotXid,
                        Collectors.summarizingDouble(r -> (double) r.getRating())));

        List<Map<String, Object>> result = statsByXid.entrySet().stream()
                .map(e -> {
                    String xid  = e.getKey();
                    DoubleSummaryStatistics stats = e.getValue();
                    String name = placeRepository.findFirstByXid(xid)
                            .map(PlaceModel::getName)
                            .orElse(xid);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name",         name);
                    m.put("xid",          xid);
                    m.put("avgRating",    Math.round(stats.getAverage() * 10.0) / 10.0);
                    m.put("totalRatings", stats.getCount());
                    return m;
                })
                .sorted((a, b) -> Double.compare((double) b.get("avgRating"), (double) a.get("avgRating")))
                .limit(10)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/most-commented-places")
    public ResponseEntity<?> getMostCommentedPlaces() {
        List<RatingModel> ratings = ratingRepository.findAll();
        if (ratings.isEmpty()) return ResponseEntity.ok(List.of());

        Map<String, Long> countsByXid = ratings.stream()
                .filter(r -> r.getComment() != null && !r.getComment().isBlank())
                .collect(Collectors.groupingBy(RatingModel::getTouristSpotXid, Collectors.counting()));

        List<Map<String, Object>> result = countsByXid.entrySet().stream()
                .map(e -> {
                    String xid  = e.getKey();
                    String name = placeRepository.findFirstByXid(xid)
                            .map(PlaceModel::getName)
                            .orElse(xid);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name",         name);
                    m.put("xid",          xid);
                    m.put("commentCount", e.getValue());
                    return m;
                })
                .sorted((a, b) -> Long.compare((long) b.get("commentCount"), (long) a.get("commentCount")))
                .limit(10)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/most-visited-places")
    public ResponseEntity<?> getMostVisitedPlaces() {
        List<PlaceModel> places = placeRepository.findAll();

        Map<String, Long> counts = places.stream()
                .filter(p -> p.getName() != null && !p.getName().isBlank())
                .collect(Collectors.groupingBy(PlaceModel::getName, Collectors.counting()));

        List<Map<String, Object>> result = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name",  e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
