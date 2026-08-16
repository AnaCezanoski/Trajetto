package com.trajetto.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Dados de cadastro de usuário.
 * <p>
 * As restrições abaixo são aplicadas no POST /user/create (anotado com {@code @Valid}); as
 * violações são devolvidas no contrato de erro padrão, com a lista de campos em {@code details}.
 */
@Getter
@Setter
@NoArgsConstructor
public class UserDTO {
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    private String firstName;

    @NotBlank(message = "O sobrenome é obrigatório")
    @Size(min = 2, max = 50, message = "O sobrenome deve ter entre 2 e 50 caracteres")
    private String lastName;

    private String travelerProfile;

    @NotNull(message = "A data de nascimento é obrigatória")
    @Past(message = "A data de nascimento deve ser anterior à data atual")
    private LocalDate birthDate;

    @NotBlank(message = "O telefone é obrigatório")
    @Size(min = 8, max = 20, message = "O telefone deve ter entre 8 e 20 caracteres")
    private String telephone;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    private String email;

    @NotBlank(message = "O país é obrigatório")
    private String country;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, max = 100, message = "A senha deve ter no mínimo 8 caracteres")
    private String password;

    private boolean isAdmin;
//    private String profilePicture;

    public boolean getIsAdmin() {
        return this.isAdmin;
    }
}
