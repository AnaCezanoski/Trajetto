package com.trajetto.backend.user.service;

import com.trajetto.backend.user.dto.LoginResponse;
import com.trajetto.backend.user.model.UserModel;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<UserModel> getAllUsers();

    //List<UserModel> getUserById(Long id);

    Optional<UserModel> getUserById(Long id);

    List<UserModel> createUser(UserModel userModel);

    UserModel updateUser(UserModel target);

    void deleteUser(Long id);

    LoginResponse login(String username, String password);

    void updateUserRole(Long id, boolean isAdmin);

    //boolean existsByCPF(String cpf);

    boolean existsByEmail(String email);

    //UserModel updateProfilePicture(Long id, String imageUrl);
}