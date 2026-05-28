package com.trajetto.backend.rating.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class RatingModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name")
    private String userName;

    private String touristSpotXid;

    private Long userId;

    private int rating;

    private String comment;

    private LocalDateTime createdAt;
}
