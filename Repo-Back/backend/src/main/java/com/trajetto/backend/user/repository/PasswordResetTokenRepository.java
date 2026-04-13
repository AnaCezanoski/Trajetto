package com.trajetto.backend.user.repository;

import com.trajetto.backend.user.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findTopByUserEmailAndCodeOrderByExpiresAtDesc(String email, String code);
}