package com.trajetto.backend.user.facade;

import com.trajetto.backend.user.dto.UserDTO;
import com.trajetto.backend.user.dto.UserResponseDTO;
import com.trajetto.backend.user.dto.UserUpdateDTO;
import com.trajetto.backend.user.model.UserModel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserFacade {

    UserModel fromDto(UserDTO dto);

    UserModel populateUserModel(UserDTO dto);

    UserResponseDTO populateUserResponseDTO(UserModel source);

    void deleteUser(Long id);

    List<UserResponseDTO> createUser(UserModel userModel) throws Exception;

    List<UserResponseDTO> getAllUsers() throws Exception;

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUserProfile(Long userId, UserUpdateDTO dto);

    UserResponseDTO updateUserRole(Long id);

    //UserResponseDTO updateProfilePicture(Long userId, MultipartFile file);
}
