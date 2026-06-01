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
                String email = userModel.getEmail().trim().toLowerCase();

                UserModel existingUser = userRepository.findByEmail(email);

                if (existingUser != null) {
                    if (existingUser.isVerified()) {
                        throw new RuntimeException("Este e-mail já está em uso.");
                    } else {
                        userModel.setId(existingUser.getId());
                    }
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

                mailSender.send(message);

                return Collections.singletonList(saved);

            } catch (Exception e) {
                logger.error("Unable to save UserModel", e);
                throw new RuntimeException(e.getMessage());
            }
        }
        return null;
    }

    @Override
    public UserModel updateUser(UserModel userModel) {
        return userRepository.findById(userModel.getId())
                .map(existingUser -> {
                    existingUser.setFirstName(capitalizeWords(userModel.getFirstName().trim()));
                    existingUser.setLastName(capitalizeWords(userModel.getLastName().trim()));
                    existingUser.setCountry(capitalizeWords(userModel.getCountry().trim()));
                    existingUser.setEmail(userModel.getEmail().trim().toLowerCase());
                    existingUser.setTravelerProfile(userModel.getTravelerProfile().trim());
                    existingUser.setTelephone(userModel.getTelephone().trim());
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

        if (!userModel.isVerified() && !userModel.getEmail().equals("admin@authserver.com.br")) {
            throw new RuntimeException("Conta não verificada. Por favor, insira o código enviado por email.");
        }

        UserResponseDTO userResponseDTO = modelMapper.map(userModel, UserResponseDTO.class);
        return new LoginResponse(jwt.createToken(userModel), userResponseDTO);
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