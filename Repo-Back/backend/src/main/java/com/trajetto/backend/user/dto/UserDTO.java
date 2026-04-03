package com.trajetto.backend.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String travelerProfile;
    private LocalDate birthDate;
    private String telephone;
    private String email;
    private String country;
    private String password;
    private boolean isAdmin;
//    private String profilePicture;

    public boolean getIsAdmin() {
        return this.isAdmin;
    }
}