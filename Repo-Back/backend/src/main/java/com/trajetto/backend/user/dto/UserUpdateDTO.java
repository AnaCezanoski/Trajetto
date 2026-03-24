package com.trajetto.backend.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonInclude;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserUpdateDTO {
    private String firstName;
    private String lastName;
    private String telephone;
    private String country;
    private String email;
    private LocalDate birthDate;
//    private String profilePicture;
}