package com.trajetto.backend.security;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

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

    private JwtTokenFilter jwtTokenFilter;

    public SecurityConfig(JwtTokenFilter jwtTokenFilter) {
        this.jwtTokenFilter = jwtTokenFilter;
    }

    @Bean
    public MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
        return new MvcRequestMatcher.Builder(introspector);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,MvcRequestMatcher.Builder mvc) throws Exception {
        return http
                .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
                .cors(Customizer.withDefaults())
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .csrf(csrf -> csrf.disable())
                .addFilterAfter(jwtTokenFilter, BasicAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(mvc.pattern("/v3/api-docs/**")).permitAll()
                        .requestMatchers(mvc.pattern("/swagger-ui/**")).permitAll()
                        .requestMatchers(mvc.pattern("/swagger-ui.html")).permitAll()
                        .requestMatchers(mvc.pattern("/actuator/**")).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(mvc.pattern("/api/address/**")).permitAll()
                        .requestMatchers(mvc.pattern("/user/validateEmail/{email}")).permitAll()
                        .requestMatchers(mvc.pattern("/user/validateCpf/{cpf}")).permitAll()
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/user")).hasRole("ADMIN")
                        .requestMatchers(mvc.pattern(HttpMethod.POST, "/user/login")).permitAll()
                        .requestMatchers(mvc.pattern(HttpMethod.POST, "/user/logout")).authenticated()
                        .requestMatchers(mvc.pattern(HttpMethod.POST, "/user/create")).permitAll()
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/user/me")).authenticated()
                        .requestMatchers(mvc.pattern(HttpMethod.PUT, "/user/me")).authenticated()
                        .requestMatchers(mvc.pattern(HttpMethod.POST, "/user/me/picture")).authenticated()
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/user/{id}")).hasRole("ADMIN")
                        .requestMatchers(mvc.pattern(HttpMethod.DELETE, "/user/{id}")).hasRole("ADMIN")
                        .requestMatchers(mvc.pattern(HttpMethod.PATCH, "/user/{id}")).hasRole("ADMIN")
                        .requestMatchers(mvc.pattern(HttpMethod.PUT, "/user/{id}")).hasRole("ADMIN")
                        .requestMatchers(mvc.pattern(HttpMethod.PUT, "/user/*/role")).hasRole("ADMIN")
                                .requestMatchers("/route").permitAll()
                        .anyRequest().authenticated()
                        )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("Unauthorized");
                        })
                )
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
