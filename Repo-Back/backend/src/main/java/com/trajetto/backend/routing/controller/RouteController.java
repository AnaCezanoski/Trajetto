package com.trajetto.backend.routing.controller;


import com.trajetto.backend.routing.dto.RouteRequestDTO;
import com.trajetto.backend.routing.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/route")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    public ResponseEntity<?> getRoute(@Valid @RequestBody RouteRequestDTO request) {
        return ResponseEntity.ok(routeService.getRoute(request));
    }
}
