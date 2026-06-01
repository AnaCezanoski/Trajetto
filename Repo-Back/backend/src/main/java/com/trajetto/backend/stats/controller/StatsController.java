package com.trajetto.backend.stats.controller;

import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        long totalUsers   = userRepository.count();
        long totalAdmins  = userRepository.countByIsAdmin(true);
        long totalClients = userRepository.countByIsAdmin(false);
        long totalItineraries = itineraryRepository.count();

        // Usuários verificados
        List<UserModel> allUsers = userRepository.findAll();
        long verified   = allUsers.stream().filter(UserModel::isVerified).count();
        long unverified = totalUsers - verified;

        // Média de idade
        OptionalDouble avgAge = allUsers.stream()
                .filter(u -> u.getBirthDate() != null)
                .mapToInt(u -> LocalDate.now().getYear() - u.getBirthDate().getYear())
                .average();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalUsers",      totalUsers);
        result.put("totalAdmins",     totalAdmins);
        result.put("totalClients",    totalClients);
        result.put("totalItineraries", totalItineraries);
        result.put("verifiedUsers",   verified);
        result.put("unverifiedUsers", unverified);
        result.put("avgAge",          avgAge.isPresent() ? Math.round(avgAge.getAsDouble()) : null);

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
        groups.put("< 18",    0L);
        groups.put("18-24",   0L);
        groups.put("25-34",   0L);
        groups.put("35-44",   0L);
        groups.put("45-54",   0L);
        groups.put("55+",     0L);
        groups.put("N/A",     0L);

        for (UserModel u : users) {
            if (u.getBirthDate() == null) {
                groups.merge("N/A", 1L, Long::sum);
                continue;
            }
            int age = currentYear - u.getBirthDate().getYear();
            if      (age < 18)  groups.merge("< 18",  1L, Long::sum);
            else if (age <= 24)  groups.merge("18-24", 1L, Long::sum);
            else if (age <= 34)  groups.merge("25-34", 1L, Long::sum);
            else if (age <= 44)  groups.merge("35-44", 1L, Long::sum);
            else if (age <= 54)  groups.merge("45-54", 1L, Long::sum);
            else                 groups.merge("55+",   1L, Long::sum);
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
}