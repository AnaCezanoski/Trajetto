package com.trajetto.backend.user.service.impl;

import com.trajetto.backend.security.Jwt;
import com.trajetto.backend.user.dto.LoginResponse;
import com.trajetto.backend.user.dto.UserResponseDTO;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import com.trajetto.backend.user.service.UserService;
import lombok.AllArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DefaultUserService implements UserService {

    private static final Logger logger = LogManager.getLogger(DefaultUserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Jwt jwt;
    private final ModelMapper modelMapper;

    @Override
    public List<UserModel> getAllUsers() {

        List<UserModel> list = userRepository.findAll();

        if (list.isEmpty()) {
            return null;
        }

        return list;
    }

    @Override
    public Optional<UserModel> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<UserModel> createUser(UserModel userModel) {
        if (!ObjectUtils.isEmpty(userModel)) {
            try {
                userModel.setPassword(passwordEncoder.encode(userModel.getPassword()));
                UserModel saved = userRepository.save(userModel);
                return Collections.singletonList(saved);
            } catch (Exception e) {
                logger.error("Unable to save UserModel", e);
            }
        }
        return null;
    }

    @Override
    public UserModel updateUser(UserModel userModel) {
        return userRepository.findById(userModel.getId())
                .map(existingUser -> {
                    existingUser.setFirstName(userModel.getFirstName());
                    existingUser.setLastName(userModel.getLastName());
                    existingUser.setTelephone(userModel.getTelephone());
                    existingUser.setEmail(userModel.getEmail());
                    existingUser.setCountry(userModel.getCountry());
                    existingUser.setBirthDate(userModel.getBirthDate());
                    //existingUser.setProfilePictureUrl(userModel.getProfilePictureUrl());
                    return userRepository.save(existingUser);
                })
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + userModel.getId()));
    }

    @Override
    public void deleteUser(Long id) {
        if(userRepository.existsById(id)) {
            try {
                userRepository.deleteById(id);
            }catch (Exception e) {
                logger.error("Unable to delete User", e);
            }
        }
    }

    @Override
    public LoginResponse login(String email, String rawPassword) {

        UserModel userModel = userRepository.findByEmail(email);
        if (userModel == null || !passwordEncoder.matches(rawPassword, userModel.getPassword())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }
        UserResponseDTO userResponseDTO = modelMapper.map(userModel, UserResponseDTO.class);
        return new LoginResponse(jwt.createToken(userModel), userResponseDTO);
    }

//    @Override
//    public UserModel updateProfilePicture(Long id, String imageUrl) {
//        UserModel userToUpdate = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
//
//        //userToUpdate.setProfilePictureUrl(imageUrl);
//
//        return userRepository.save(userToUpdate);
//    }

    @Override
    public void updateUserRole(Long id, boolean isAdmin) {
        userRepository.updateUserRole(id, isAdmin);
    }

//    @Override
//    public boolean existsByCPF(String cpf) {
//        return userRepository.existsByCpf(cpf);
//    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}