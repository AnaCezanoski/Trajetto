package com.trajetto.backend.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String travelerProfile;
    private LocalDate birthDate;
    private String telephone;
    private String email;
    private String country;
    private Boolean isAdmin;
//    private String profilePictureUrl;
}