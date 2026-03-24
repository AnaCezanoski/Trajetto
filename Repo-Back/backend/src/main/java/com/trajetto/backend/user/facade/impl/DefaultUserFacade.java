package com.trajetto.backend.user.facade.impl;

import com.trajetto.backend.security.UserToken;
import com.trajetto.backend.user.dto.UserDTO;
import com.trajetto.backend.user.dto.UserResponseDTO;
import com.trajetto.backend.user.facade.UserFacade;
import com.trajetto.backend.user.dto.UserUpdateDTO;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
//import com.trajetto.backend.user.service.FirebaseStorageService;
import com.trajetto.backend.user.service.UserService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
@AllArgsConstructor
@Component
public class DefaultUserFacade implements UserFacade {

    private static final Logger logger = LogManager.getLogger(DefaultUserFacade.class);

    //private final FirebaseStorageService firebaseStorageService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public UserModel fromDto(UserDTO source) {
        UserModel target = new UserModel();

        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setBirthDate(source.getBirthDate());
        target.setTelephone(source.getTelephone());
        target.setCountry(source.getCountry());
        target.setEmail(source.getEmail());
        target.setPassword(source.getPassword());
        target.setIsAdmin(source.getIsAdmin());

        return target;
    }

    @Override
    public UserModel populateUserModel(UserDTO source) {
        UserModel target = new UserModel();

        target.setId(source.getId());
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setBirthDate(source.getBirthDate( ));
        target.setTelephone(source.getTelephone());
        target.setEmail(source.getEmail());
        target.setCountry(source.getCountry());
        target.setPassword(source.getPassword());
        target.setIsAdmin(source.getIsAdmin());
        //target.setProfilePictureUrl(source.getProfilePicture());

        return userService.updateUser(target);
    }

    @Override
    public UserResponseDTO populateUserResponseDTO(UserModel source) {
        if (source == null) {
            return null;
        }

        UserResponseDTO target = new UserResponseDTO();

        target.setId(source.getId());
        target.setTelephone(source.getTelephone());
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setBirthDate(source.getBirthDate());
        target.setCountry(source.getCountry());
        target.setEmail(source.getEmail());
        target.setIsAdmin(source.getIsAdmin());
        //target.setProfilePictureUrl(source.getProfilePictureUrl());

        return target;
    }

    @Override
    public void deleteUser(Long id) {
        Long loggedInUserId = getLoggedInUserId();
        if (loggedInUserId.equals(id)) {
            throw new IllegalStateException("An administrator cannot remove themselves.");
        }

        UserModel userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (Boolean.TRUE.equals(userToDelete.getIsAdmin())) {
            long adminCount = userRepository.countByIsAdmin(true);
            if (adminCount <= 1) {
                throw new IllegalStateException("It is not possible to remove the sole system administrator.");
            }
        }

        userService.deleteUser(id);
    }

    @Override
    public List<UserResponseDTO> createUser(UserModel userModel) throws Exception {
        if (checkIfUserEmailExists(userModel.getEmail())){
            throw new Exception("User email already being used");
        }

//        if (checkIfUserCpfExists(userModel.getCpf())){
//            throw new Exception("User cpf already being used");
//        }

        List<UserResponseDTO> response = new ArrayList<>();

        List<UserModel> model = this.userService.createUser(userModel);

        if (!CollectionUtils.isEmpty(model)){
             response.add(populateUserResponseDTO(model.getFirst()));
        }

        return response;
    }

    @Override
    public List<UserResponseDTO> getAllUsers() throws Exception {
        try {
            List<UserResponseDTO> responseDTOList = new ArrayList<>();

            List<UserModel> models = this.userService.getAllUsers();

            for (UserModel model : models){
                responseDTOList.add(populateUserResponseDTO(model));
            }

            return responseDTOList;
        }catch (Exception e){
            throw new Exception("Unable to get users");
        }
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        UserModel user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return populateUserResponseDTO(user);
    }

    @Override
    public UserResponseDTO updateUserProfile(Long userId, UserUpdateDTO dto) {

        UserModel user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getTelephone() != null) user.setTelephone(dto.getTelephone());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getBirthDate() != null) user.setBirthDate(dto.getBirthDate());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());

        UserModel updated = userService.updateUser(user);

        return populateUserResponseDTO(updated);
    }

    @Override
    public UserResponseDTO updateUserRole(Long id) {
        Long loggedInUserId = getLoggedInUserId();
        if (loggedInUserId.equals(id)) {
            throw new IllegalStateException("An administrator cannot change their own position.");
        }

        UserModel userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (Boolean.TRUE.equals(userToUpdate.getIsAdmin())) {
            long adminCount = userRepository.countByIsAdmin(true);
            if (adminCount <= 1) {
                throw new IllegalStateException("It is not possible to change the position of the sole administrator.");
            }
        }

        boolean currentIsAdmin = Boolean.TRUE.equals(userToUpdate.getIsAdmin());
        userService.updateUserRole(id, !currentIsAdmin);

        UserModel updatedUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error searching for user after update."));

        return populateUserResponseDTO(updatedUser);
    }

    private Long getLoggedInUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserToken) {
            return ((UserToken) principal).getId();
        }
        return -1L;
    }

//    @Override
//    public UserResponseDTO updateProfilePicture(Long userId, MultipartFile file) {
//        try {
//            List<?> rawUser = userService.getUserById(userId);
//            UserModel user;
//            if (rawUser != null && !rawUser.isEmpty()) {
//                user = (UserModel) rawUser.get(0);
//            } else if (rawUser instanceof UserModel) {
//                user = (UserModel) rawUser;
//            } else {
//                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
//            }
//
//            String imageUrl = firebaseStorageService.uploadImage(file);
//
//            user.setProfilePictureUrl(imageUrl);
//            UserModel updatedUser = userService.updateProfilePicture(user.getId(), imageUrl);
//
//            return modelMapper.map(updatedUser, UserResponseDTO.class);
//        } catch (IOException e) {
//            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao fazer upload da imagem de perfil", e);
//        }
//    }

    //private boolean checkIfUserCpfExists(String cpf) {return userService.existsByCPF(cpf);}

    private boolean checkIfUserEmailExists(String email){
        return userService.existsByEmail(email);
    }
}