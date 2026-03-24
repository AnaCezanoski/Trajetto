package com.trajetto.backend.user.dto;

public record LoginResponse(
        String token,
        UserResponseDTO user
) { }