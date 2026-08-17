package com.trajetto.backend.user.controller;

import com.trajetto.backend.user.dto.MessageResponse;
import com.trajetto.backend.user.service.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotRequest request) {
        passwordResetService.sendResetCode(request.email());
        return ResponseEntity.ok(new MessageResponse("Código de redefinição enviado para o e-mail informado."));
    }

    @PostMapping("/reset")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetRequest request) {
        passwordResetService.resetPassword(
                request.email(),
                request.code(),
                request.newPassword()
        );
        return ResponseEntity.ok(new MessageResponse("Senha redefinida com sucesso."));
    }

    record ForgotRequest(
            @NotBlank(message = "O e-mail é obrigatório")
            @Email(message = "Informe um e-mail válido")
            String email
    ) {}

    record ResetRequest(
            @NotBlank(message = "O e-mail é obrigatório")
            @Email(message = "Informe um e-mail válido")
            String email,

            @NotBlank(message = "O código de verificação é obrigatório")
            String code,

            @NotBlank(message = "A nova senha é obrigatória")
            @Size(min = 8, max = 100, message = "A senha deve ter no mínimo 8 caracteres")
            String newPassword
    ) {}
}
