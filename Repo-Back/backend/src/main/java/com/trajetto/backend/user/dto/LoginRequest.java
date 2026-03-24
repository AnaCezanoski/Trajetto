package com.trajetto.backend.user.dto;

public record LoginRequest(
        String email,
        String password
) { }