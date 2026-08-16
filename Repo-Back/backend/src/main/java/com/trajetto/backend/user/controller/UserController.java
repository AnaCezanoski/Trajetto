package com.trajetto.backend.user.controller;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.security.UserToken;
import com.trajetto.backend.user.dto.*;
import com.trajetto.backend.user.facade.UserFacade;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import com.trajetto.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de usuário.
 * <p>
 * Nenhum método trata exceções: qualquer falha é lançada e convertida para o contrato JSON
 * padrão pelo {@code GlobalExceptionHandler}.
 */
@Setter
@Getter
@NoArgsConstructor
@RestController
@RequestMapping(value={"/user"})
public class UserController {

    private static final Logger logger = LogManager.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private UserFacade userFacade;

    @Autowired
    private UserRepository userRepository;

    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getUsers() {
        return ResponseEntity.ok(userFacade.getAllUsers());
    }

    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userFacade.getUserById(id));
    }

    @SecurityRequirement(name = "AuthServer")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserToken userToken) {
        return ResponseEntity.ok(userFacade.getUserById(requireAuthenticated(userToken).getId()));
    }

    @SecurityRequirement(name = "AuthServer")
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @AuthenticationPrincipal UserToken userToken,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        UserResponseDTO updatedUser =
                userFacade.updateUserProfile(requireAuthenticated(userToken).getId(), userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @PermitAll
    @PostMapping("/create")
    public ResponseEntity<List<UserResponseDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
        UserModel userModel = userFacade.fromDto(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(userFacade.createUser(userModel));
    }

    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO updateModel) {
        if (updateModel == null) {
            throw new InvalidRequestException("Os dados de atualização não foram informados.");
        }

        updateModel.setId(id);
        UserModel model = userFacade.populateUserModel(updateModel);

        return ResponseEntity.ok(userFacade.populateUserResponseDTO(model));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userFacade.deleteUser(id);
    }

    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest.email(), loginRequest.password()));
    }

    @SecurityRequirement(name = "AuthServer")
    @PutMapping("/{id}/role")
    public UserResponseDTO updateUserRole(@PathVariable Long id) {
        return userFacade.updateUserRole(id);
    }

    @SecurityRequirement(name = "AuthServer")
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@AuthenticationPrincipal UserToken userToken) {
        logger.info("User {} logged out", requireAuthenticated(userToken).getId());
        return ResponseEntity.ok(new MessageResponse("Logout realizado com sucesso."));
    }

    @PermitAll
    @PostMapping("/verify")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String email, @RequestParam String code) {
        UserModel user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("Nenhuma conta encontrada para o e-mail informado.");
        }

        if (!code.equals(user.getVerificationCode())) {
            throw new InvalidRequestException("Código de verificação inválido.");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("E-mail verificado com sucesso."));
    }

//    @SecurityRequirement(name = "AuthServer")
//    @PostMapping("/me/picture")
//    public ResponseEntity<UserResponseDTO> uploadProfilePicture(
//            @RequestParam("file") MultipartFile file,
//            @AuthenticationPrincipal UserToken userId) {
//        UserResponseDTO updatedUser = userFacade.updateProfilePicture(userId.getId(), file);
//        return ResponseEntity.ok(updatedUser);
//    }

    @PermitAll
    @GetMapping("/validateEmail/{email}")
    public Boolean validateEmail(@PathVariable String email) {
        return userService.existsByEmail(email);
    }

//    @PermitAll
//    @GetMapping("/validateCpf/{cpf}")
//    public Boolean validateCPF(@PathVariable String cpf) {
//        return userService.existsByCPF(cpf);
//    }

    private UserToken requireAuthenticated(UserToken userToken) {
        if (userToken == null) {
            throw new ApiException(ApiErrorCode.UNAUTHENTICATED);
        }
        return userToken;
    }
}
