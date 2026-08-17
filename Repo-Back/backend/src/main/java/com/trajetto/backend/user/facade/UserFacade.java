package com.trajetto.backend.user.facade;

import com.trajetto.backend.user.dto.UserDTO;
import com.trajetto.backend.user.dto.UserResponseDTO;
import com.trajetto.backend.user.dto.UserUpdateDTO;
import com.trajetto.backend.user.model.UserModel;
import java.util.List;

public interface UserFacade {

    UserModel fromDto(UserDTO dto);

    UserModel populateUserModel(UserDTO dto);

    UserResponseDTO populateUserResponseDTO(UserModel source);

    void deleteUser(Long id);

    List<UserResponseDTO> createUser(UserModel userModel);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUserProfile(Long userId, UserUpdateDTO dto);

    UserResponseDTO updateUserRole(Long id);

    //UserResponseDTO updateProfilePicture(Long userId, MultipartFile file);
}
