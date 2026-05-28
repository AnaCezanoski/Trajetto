package com.trajetto.backend.itinerary.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "places")
public class PlaceModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "xid")
    private String xid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "estimated_visit_time")
    private LocalTime estimatedVisitTime;

    @Column(name = "order_index")
    private Integer OrderIndex;

    @Column(name = "opening_hours", length = 256)
    private String openingHours;

    @Column(name = "category")
    private String category;

    @Column(name = "fee")
    private String fee;

    @ManyToOne
    @JoinColumn(name = "itinerary_id")
    private ItineraryModel itinerary;
}