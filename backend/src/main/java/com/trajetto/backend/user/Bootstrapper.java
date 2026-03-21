package com.trajetto.backend.user;

import com.trajetto.backend.user.AdminConfig;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@PropertySource("classpath:security.properties")
public class Bootstrapper implements ApplicationListener<ContextRefreshedEvent> {
    private static final Logger log = LoggerFactory.getLogger(Bootstrapper.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final AdminConfig adminConfig;

    public Bootstrapper(UserRepository userRepository, AdminConfig adminConfig) {
        this.userRepository = userRepository;
        this.adminConfig = AdminConfig.criarCom(adminConfig);
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (userRepository.findByIsAdmin(true).isEmpty()) {
            UserModel admin = new UserModel();
            admin.setEmail(adminConfig.getEmail());
            admin.setPassword(passwordEncoder.encode(adminConfig.getPassword()));
            admin.setFirstName(adminConfig.getName());
            admin.setLastName("");
            //admin.setCpf("000.000.000-00");
            admin.setIsAdmin(true);
            userRepository.save(admin);
            log.info("ADMIN user created!");
        }
    }
}