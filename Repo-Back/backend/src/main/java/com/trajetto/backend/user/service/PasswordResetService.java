package com.trajetto.backend.user.service;

import com.trajetto.backend.exception.BusinessRuleException;
import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.user.model.PasswordResetToken;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.PasswordResetTokenRepository;
import com.trajetto.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    public void sendResetCode(String email) {
        UserModel user = userRepository.findByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException("Nenhuma conta encontrada para o e-mail informado.");
        }

        String code = String.valueOf((int)(Math.random() * 900000) + 100000);

        PasswordResetToken reset = new PasswordResetToken();
        reset.setCode(code);
        reset.setUser(user);
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        reset.setUsed(false);

        tokenRepository.save(reset);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("🗺️ Trajetto — Código para Redefinição de Senha");
        message.setText(
                "Olá!\n\n" +
                        "Recebemos uma solicitação para redefinir a senha da sua conta Trajetto.\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━\n" +
                        " CÓDIGO DE VERIFICAÇÃO: " + code + "\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                        "Este código é válido pelos próximos 10 minutos.\n\n" +
                        "Se você não solicitou isso, não se preocupe — pode ignorar este e-mail sem problemas.\n\n" +
                        "Stay safe,\n" +
                        "Trajetto Team ✈️"
        );

        mailSender.send(message);
    }

    public void resetPassword(String email, String code, String newPassword) {
        PasswordResetToken reset = tokenRepository
                .findTopByUserEmailAndCodeOrderByExpiresAtDesc(email, code)
                .orElseThrow(() -> new InvalidRequestException("Código de redefinição inválido."));

        if (reset.isUsed()) {
            throw new BusinessRuleException("Este código já foi utilizado. Solicite um novo.");
        }

        if (reset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Este código expirou. Solicite um novo.");
        }

        UserModel user = reset.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        reset.setUsed(true);
        tokenRepository.save(reset);
    }
}