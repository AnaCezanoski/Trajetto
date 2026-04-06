package com.trajetto.backend.touristSpots.service;

import com.trajetto.backend.touristSpots.dto.TouristSpotDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class OverpassService {

    private static final String OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public OverpassService(RestClient.Builder builder, ObjectMapper objectMapper) {
        this.restClient = builder.build();
        this.objectMapper = objectMapper;
    }

    // Passo 1: Converte nome da cidade em lat/lon via Nominatim (OpenStreetMap)
    public double[] getCityCoordinates(String cityName) throws Exception {
        String url = "https://nominatim.openstreetmap.org/search?q="
                + cityName.replace(" ", "+")
                + "&format=json&limit=1";

        String response = restClient.get()
                .uri(url)
                .header("User-Agent", "Trajetto/1.0")
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(response);

        if (root.isEmpty()) {
            throw new RuntimeException("Cidade não encontrada: " + cityName);
        }

        double lat = root.get(0).get("lat").asDouble();
        double lon = root.get(0).get("lon").asDouble();
        return new double[]{lat, lon};
    }

    // Passo 2: Busca pontos turísticos via Overpass API (sem API key)
    public List<TouristSpotDTO> getTouristSpots(double lat, double lon, int radius) throws Exception {
        // Locale.US garante ponto decimal (ex: -25.4284) em vez de vírgula (-25,4284)
        // A vírgula causa erro 400 no Overpass API
        String query = String.format(Locale.US,
                "[out:json][timeout:25];\n" +
                        "(\n" +
                        "  node[\"tourism\"~\"attraction|museum|viewpoint|artwork|gallery\"](around:%d,%f,%f);\n" +
                        "  node[\"historic\"~\"monument|castle|ruins|memorial\"](around:%d,%f,%f);\n" +
                        ");\n" +
                        "out body 20;\n",
                radius, lat, lon, radius, lat, lon
        );

        String response = restClient.post()
                .uri(OVERPASS_URL)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .body("data=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8))
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(response);
        JsonNode elements = root.get("elements");

        List<TouristSpotDTO> spots = new ArrayList<>();

        for (JsonNode el : elements) {
            String xid   = "osm_" + el.get("id").asText();
            String name  = el.has("tags") && el.get("tags").has("name")
                    ? el.get("tags").get("name").asText()
                    : "Sem nome";
            String kinds = el.has("tags") && el.get("tags").has("tourism")
                    ? el.get("tags").get("tourism").asText()
                    : el.has("tags") && el.get("tags").has("historic")
                    ? el.get("tags").get("historic").asText()
                    : "interesting_places";

            double spotLat = el.get("lat").asDouble();
            double spotLon = el.get("lon").asDouble();

            spots.add(new TouristSpotDTO(xid, name, kinds, new TouristSpotDTO.Point(spotLat, spotLon)));
        }

        return spots;
    }

    // Função principal: busca por cidade
    public List<TouristSpotDTO> searchByCity(String cityName, int radius) throws Exception {
        double[] coords = getCityCoordinates(cityName);
        return getTouristSpots(coords[0], coords[1], radius);
    }
}