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
            @RequestParam(required = false) String category
    ) {
        return romePlacesLoader.getPlaces().stream()
                .filter(p -> search == null || search.isBlank() ||
                        p.name().toLowerCase().contains(search.toLowerCase()) ||
                        p.address().toLowerCase().contains(search.toLowerCase()))
                .filter(p -> category == null || category.isBlank() ||
                        p.category().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return romePlacesLoader.getPlaces().stream()
                .map(RomePlace::category)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}