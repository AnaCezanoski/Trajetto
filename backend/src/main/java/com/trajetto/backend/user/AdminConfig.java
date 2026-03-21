package com.trajetto.backend.user;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "security.admin")
public class AdminConfig {

    private String email;
    private String password;
    private String name;


    public static AdminConfig criarCom(AdminConfig adminConfig) {
        AdminConfig config = new AdminConfig();
        config.setEmail(adminConfig.getEmail());
        config.setPassword(adminConfig.getPassword());
        config.setName(adminConfig.getName());
        return config;
    }

}
