package com.trajetto.backend.security;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import static org.springframework.security.config.http.MatcherType.mvc;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableMethodSecurity
@SecurityScheme(
        name="AuthServer",
        type= SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class SecurityConfig {

    private final Jwt jwt;
    private final JsonAuthenticationEntryPoint authenticationEntryPoint;
    private final JsonAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(Jwt jwt,
                          JsonAuthenticationEntryPoint authenticationEntryPoint,
                          JsonAccessDeniedHandler accessDeniedHandler) {
        this.jwt = jwt;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
                .cors(Customizer.withDefaults())
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .csrf(csrf -> csrf.disable())
                // Instanciado aqui, e não injetado: como bean, o Spring Boot também o
                // registraria na cadeia de filtros do servlet, fora do controle da segurança.
                .addFilterAfter(new JwtTokenFilter(jwt), BasicAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        // Despacho interno de erro; quem responde é o ApiErrorController.
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/address/**").permitAll()
                        .requestMatchers("/user/validateEmail/{email}").permitAll()
                        .requestMatchers("/user/validateCpf/{cpf}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/stats/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/places").authenticated()
                        .requestMatchers(HttpMethod.GET, "/places/categories").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/tourist-spots").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/user/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/logout").authenticated()
                        .requestMatchers(HttpMethod.POST, "/user/password/forgot").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/password/reset").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/create").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/user/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/user/me/picture").authenticated()
                        .requestMatchers(HttpMethod.GET, "/user/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/user/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/user/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/user/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/user/*/role").hasRole("ADMIN")
                        .requestMatchers("/route").permitAll()
                        .anyRequest().authenticated()
                )
                // 401 e 403 gerados na cadeia de filtros seguem o mesmo contrato JSON de erro
                // usado pelo GlobalExceptionHandler.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
