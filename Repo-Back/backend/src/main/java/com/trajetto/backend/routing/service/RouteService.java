package com.trajetto.backend.routing.service;

import com.trajetto.backend.routing.dto.CoordinateDTO;
import com.trajetto.backend.routing.dto.RouteRequestDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RouteService {

    @Value("${ors.api.key}")
    private String apiKey;


    public Map<String, Object> getRoute(RouteRequestDTO request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.openrouteservice.org/v2/directions/driving-car";

        List<List<Double>> coordinates =  new ArrayList<>();

        coordinates.add(List.of(request.origin.lng, request.origin.lat));

        if (request.waypoints != null) {
            for (CoordinateDTO wp : request.waypoints) {
                coordinates.add(List.of(wp.lng, wp.lat));
            }
        }

        coordinates.add(List.of(request.destination.lng, request.destination.lat));

        Map<String, Object> body = new HashMap<>();
        System.out.println("BODY: " + body);

        body.put("coordinates", coordinates);
        System.out.println("ANTES DO ORS");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        System.out.println("DEPOIS DO ORS");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
        );

        Map route = (Map) ((List) response.getBody().get("routes")).get(0);
        Map summary = (Map) route.get("summary");

        Map<String, Object> result = new HashMap<>();
        result.put("geometry", route.get("geometry"));
        result.put("distance", summary.get("distance"));
        result.put("duration", summary.get("duration"));

        return result;
    }
}