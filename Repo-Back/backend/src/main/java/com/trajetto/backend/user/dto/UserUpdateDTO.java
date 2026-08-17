package com.trajetto.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Atualização parcial do próprio perfil: todos os campos são opcionais e apenas os enviados
 * são validados — o valor nulo significa "não alterar".
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserUpdateDTO {

    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    private String firstName;

    @Size(min = 2, max = 50, message = "O sobrenome deve ter entre 2 e 50 caracteres")
    private String lastName;

    private String travelerProfile;

    @Size(min = 8, max = 20, message = "O telefone deve ter entre 8 e 20 caracteres")
    private String telephone;

    @Size(min = 2, max = 60, message = "O país deve ter entre 2 e 60 caracteres")
    private String country;

    @Email(message = "Informe um e-mail válido")
    private String email;

    @Past(message = "A data de nascimento deve ser anterior à data atual")
    private LocalDate birthDate;
//    private String profilePicture;
}
