package com.trajetto.backend.user.service.impl;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.BusinessRuleException;
import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.exception.ResourceConflictException;
import com.trajetto.backend.exception.ResourceNotFoundException;
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
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage; // NOVO IMPORT
import org.springframework.mail.javamail.JavaMailSender; // NOVO IMPORT
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random; // NOVO IMPORT

@Service
@AllArgsConstructor
public class DefaultUserService implements UserService {

    private static final Logger logger = LogManager.getLogger(DefaultUserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Jwt jwt;
    private final ModelMapper modelMapper;

    // NOVO: Injetado automaticamente pelo @AllArgsConstructor
    private final JavaMailSender mailSender;

    @Override
    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<UserModel> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<UserModel> createUser(UserModel userModel) {
        if (ObjectUtils.isEmpty(userModel)) {
            throw new InvalidRequestException("Os dados do usuário não foram informados.");
        }

        String email = userModel.getEmail().trim().toLowerCase();

        UserModel existingUser = userRepository.findByEmail(email);

        if (existingUser != null) {
            if (existingUser.isVerified()) {
                throw new ResourceConflictException("Este e-mail já está em uso.");
            }
            // Cadastro anterior não confirmado: os dados são sobrescritos e um novo código é enviado.
            userModel.setId(existingUser.getId());
        }

        userModel.setFirstName(capitalizeWords(userModel.getFirstName().trim()));
        userModel.setLastName(capitalizeWords(userModel.getLastName().trim()));
        userModel.setCountry(capitalizeWords(userModel.getCountry().trim()));
        userModel.setEmail(email);
        userModel.setPassword(passwordEncoder.encode(userModel.getPassword()));

        String code = String.format("%06d", new Random().nextInt(999999));
        userModel.setVerificationCode(code);
        userModel.setVerified(false);

        UserModel saved = userRepository.save(userModel);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(saved.getEmail());
        message.setSubject("🗺️ Trajetto — Código de Verificação");
        message.setText(
                "Olá, " + saved.getFirstName() + "!\n\n" +
                        "Bem-vindo(a) ao Trajetto. Para ativar sua conta, utilize o código abaixo:\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━\n" +
                        " CÓDIGO DE VERIFICAÇÃO: " + code + "\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                        "Este código é válido pelos próximos 10 minutos.\n\n" +
                        "Insira este código no aplicativo para concluir a verificação da sua conta.\n\n" +
                        "Se você não criou uma conta no Trajetto, pode ignorar este e-mail.\n\n" +
                        "Stay safe,\n" +
                        "Trajetto Team ✈️"
        );

        try {
            mailSender.send(message);
        } catch (MailException e) {
            logger.error("Unable to send verification email to {}", saved.getEmail(), e);
            throw new ApiException(ApiErrorCode.EXTERNAL_SERVICE_ERROR,
                    "Não foi possível enviar o e-mail de verificação. Tente novamente em instantes.", e);
        }

        return Collections.singletonList(saved);
    }

    @Override
    public UserModel updateUser(UserModel userModel) {
        return userRepository.findById(userModel.getId())
                .map(existingUser -> {
                    // Campos ainda não preenchidos (ex.: perfil de viajante antes do teste) chegam
                    // nulos e não devem derrubar a atualização.
                    existingUser.setFirstName(capitalizeWords(trimOrNull(userModel.getFirstName())));
                    existingUser.setLastName(capitalizeWords(trimOrNull(userModel.getLastName())));
                    existingUser.setCountry(capitalizeWords(trimOrNull(userModel.getCountry())));
                    existingUser.setEmail(userModel.getEmail() != null
                            ? userModel.getEmail().trim().toLowerCase()
                            : null);
                    existingUser.setTravelerProfile(trimOrNull(userModel.getTravelerProfile()));
                    existingUser.setTelephone(trimOrNull(userModel.getTelephone()));
                    existingUser.setBirthDate(userModel.getBirthDate());
                    //existingUser.setProfilePictureUrl(userModel.getProfilePictureUrl());
                    return userRepository.save(existingUser);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userModel.getId()));
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário", id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public LoginResponse login(String email, String rawPassword) {

        UserModel userModel = userRepository.findByEmail(email);
        if (userModel == null || !passwordEncoder.matches(rawPassword, userModel.getPassword())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        if (!userModel.isVerified() && !userModel.getEmail().equals("admin@authserver.com.br")) {
            throw new BusinessRuleException("Conta não verificada. Por favor, insira o código enviado por e-mail.");
        }

        UserResponseDTO userResponseDTO = modelMapper.map(userModel, UserResponseDTO.class);
        return new LoginResponse(jwt.createToken(userModel), userResponseDTO);
    }

    private String trimOrNull(String text) {
        return text != null ? text.trim() : null;
    }

    private String capitalizeWords(String text) {
        if (text == null || text.isEmpty()) return text;

        String[] words = text.toLowerCase().split(" ");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1))
                        .append(" ");
            }
        }

        return result.toString().trim();
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