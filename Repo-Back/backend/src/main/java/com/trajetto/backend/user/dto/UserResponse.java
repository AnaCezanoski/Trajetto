package com.trajetto.backend.user.dto;

import com.trajetto.backend.user.model.UserModel;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String travelerProfile,
        boolean isAdmin
//        String profilePicture
) {
    public UserResponse(UserModel user) {
        this(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getTravelerProfile(),
                user.getIsAdmin()
//                user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty() ?
//                        "data:image/jpeg;base64," + user.getProfilePictureUrl() : null
        );
    }
}