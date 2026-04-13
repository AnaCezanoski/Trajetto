package com.trajetto.backend.user.controller;

import com.trajetto.backend.user.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotRequest request) {
        try {
            passwordResetService.sendResetCode(request.email());
            return ResponseEntity.ok("Code sent");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetRequest request) {
        try {
            passwordResetService.resetPassword(
                    request.email(),
                    request.code(),
                    request.newPassword()
            );
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    record ForgotRequest(String email) {}
    record ResetRequest(String email, String code, String newPassword) {}
}