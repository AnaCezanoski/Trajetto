package com.trajetto.backend.config.swagger;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {

        Contact contact = new Contact();
        contact.setName("Trajetto");
        contact.setUrl("http://localhost:8081");
        return new OpenAPI()
                .info(new Info()
                        .title("Trajetto")
                        .version("v1.0")
                        .contact(contact)
                        .description("API created to document the endpoints."));
    }
}