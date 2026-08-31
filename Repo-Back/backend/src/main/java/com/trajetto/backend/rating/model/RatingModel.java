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

    @Column(nullable = false)
    private String touristSpotXid;

    /**
     * Autor da avaliacao. Guardado como identificador solto, sem associacao
     * mapeada -- por isso o Hibernate nunca criou a chave estrangeira, que a
     * migracao V6 passou a declarar diretamente no esquema.
     */
    @Column(nullable = false)
    private Long userId;

    private int rating;

    private String comment;

    private LocalDateTime createdAt;
}
