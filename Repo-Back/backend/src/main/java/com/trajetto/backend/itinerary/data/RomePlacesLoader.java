package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class RomePlacesLoader {

    public record RomePlace(
            String name,
            String address,
            double latitude,
            double longitude,
            List<String> profiles
    ) {}

    @Autowired
    private ObjectMapper objectMapper;

    private List<RomePlace> places;

    @PostConstruct
    private void load() {
        List<RomePlace> loaded = new ArrayList<>();
        try (InputStream stream = getClass().getResourceAsStream("/data/rome_curated.geojson")) {
            if (stream == null) {
                throw new IllegalStateException("rome_curated.geojson not found in classpath");
            }
            JsonNode root = objectMapper.readTree(stream);
            JsonNode features = root.get("features");
            for (JsonNode feature : features) {
                JsonNode props = feature.get("properties");
                String name = props.path("name").asText("");
                String address = props.path("address").asText("");
                double lat = props.path("latitude").asDouble();
                double lon = props.path("longitude").asDouble();
                List<String> profiles = props.has("profiles")
                        ? objectMapper.convertValue(props.get("profiles"), new TypeReference<>() {})
                        : List.of();
                if (!name.isBlank() && lat != 0.0 && lon != 0.0) {
                    loaded.add(new RomePlace(name, address, lat, lon, profiles));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load rome_curated.geojson", e);
        }
        this.places = Collections.unmodifiableList(loaded);
    }

    public List<RomePlace> getPlaces() {
        return places;
    }
}
