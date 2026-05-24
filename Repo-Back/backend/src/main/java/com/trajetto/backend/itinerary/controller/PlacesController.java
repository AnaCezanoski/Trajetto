package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.data.RomePlacesLoader;
import com.trajetto.backend.itinerary.data.RomePlacesLoader.RomePlace;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
public class PlacesController {

    private final RomePlacesLoader romePlacesLoader;

    @GetMapping
    public List<RomePlace> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String fee,        // "yes" ou "no"
            @RequestParam(required = false) Boolean hasHours,  // true = só com horário
            @RequestParam(required = false) String profile,    // ex: "cultural"
            @RequestParam(required = false) Double lat,        // para distância
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double maxDistance // em metros
    ) {
        return romePlacesLoader.getPlaces().stream()
                .filter(p -> search == null || search.isBlank() ||
                        p.name().toLowerCase().contains(search.toLowerCase()) ||
                        p.address().toLowerCase().contains(search.toLowerCase()))
                .filter(p -> category == null || category.isBlank() ||
                        p.category().equalsIgnoreCase(category))
                .filter(p -> fee == null || fee.isBlank() ||
                        p.fee().equalsIgnoreCase(fee))
                .filter(p -> hasHours == null || !hasHours ||
                        (p.openingHours() != null && !p.openingHours().isBlank()))
                .filter(p -> profile == null || profile.isBlank() ||
                        p.profiles().stream().anyMatch(pr -> pr.equalsIgnoreCase(profile)))
                .filter(p -> {
                    if (lat == null || lng == null || maxDistance == null) return true;
                    double dist = haversine(lat, lng, p.latitude(), p.longitude());
                    return dist <= maxDistance;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return romePlacesLoader.getPlaces().stream()
                .map(RomePlace::category)
                .filter(c -> c != null && !c.isBlank())
                .distinct().sorted()
                .collect(Collectors.toList());
    }

    @GetMapping("/profiles")
    public List<String> getProfiles() {
        return romePlacesLoader.getPlaces().stream()
                .flatMap(p -> p.profiles().stream())
                .filter(p -> p != null && !p.isBlank())
                .distinct().sorted()
                .collect(Collectors.toList());
    }

    // Haversine — distância em metros entre dois pontos
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}