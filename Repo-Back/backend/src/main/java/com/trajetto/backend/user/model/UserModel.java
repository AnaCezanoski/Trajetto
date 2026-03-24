package com.trajetto.backend.user.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code", unique = true, nullable = false)
    @JsonProperty("id")
    private Long id;

    @JsonProperty("first_name")
    @Column(name = "first_name")
    private String firstName;

    @Getter
    @JsonProperty("last_name")
    @Column(name = "last_name")
    private String lastName;

    @JsonProperty("isAdmin")
    @Column(name = "isAdmin")
    private Boolean isAdmin;

    @Column(name = "birthDate")
    private LocalDate birthDate;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "country")
    private String country;

    @JsonIgnore
    @Column(name = "password")
    private String password;

//    @Column(name = "cpf", nullable = false, unique = true)
//    private String cpf;
//
//    @Column(name = "profile_picture_url", length = 512)
//    private String profilePictureUrl;
}