package com.trajetto.backend.security;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.InvalidSessionException;
import com.trajetto.backend.user.model.UserModel;
import io.jsonwebtoken.*;
import io.jsonwebtoken.jackson.io.JacksonDeserializer;
import io.jsonwebtoken.jackson.io.JacksonSerializer;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Configuration
public class Jwt {
    public static final String SECRET = "0e5582adfb7fa6bb770815f3c6b3534d311bd5fe";
    public static final long EXPIRE_HOURS = 48L;
    public static final String ISSUER = "PUCPR AuthServer";
    public static final String USER_FIELD = "UserToken";
    public static final String BEARER_PREFIX = "Bearer ";

    public String createToken(UserModel user) {
        UserToken userToken = new UserToken(user);

        return Jwts.builder()
                .json(new JacksonSerializer<>())
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() +( EXPIRE_HOURS * 3600 * 1000)))
                .issuer(ISSUER)
                .subject(String.valueOf(userToken.getId()))
                .claim(USER_FIELD, userToken)
                .compact();
    }

    /**
     * Lê a sessão do cabeçalho {@code Authorization}.
     *
     * @return a autenticação do portador do token, ou {@code null} quando a requisição não trouxe
     *         cabeçalho {@code Authorization: Bearer} — caso legítimo nos endpoints públicos.
     * @throws InvalidSessionException quando veio um token, mas ele não vale: expirado
     *         ({@code SESSION_EXPIRED}) ou corrompido/forjado/de outro emissor
     *         ({@code INVALID_SESSION}). O motivo é preservado para que a resposta ao aplicativo
     *         diga qual dos dois aconteceu, em vez de um 401 genérico.
     */
    public Authentication extract(HttpServletRequest req) {
        String header = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) return null;

        String token = header.substring(BEARER_PREFIX.length()).trim();
        if (token.isEmpty()) {
            throw new InvalidSessionException(ApiErrorCode.INVALID_SESSION,
                    "Cabeçalho Authorization: Bearer sem token.");
        }

        try {
            JwtParser parser = Jwts.parser()
                    .json(new JacksonDeserializer<>(Map.of(USER_FIELD, UserToken.class)))
                    .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                    .build();

            Jws<Claims> jwt = parser.parseSignedClaims(token);
            Claims claims = jwt.getPayload();

            if (!ISSUER.equals(claims.getIssuer())) {
                throw new InvalidSessionException(ApiErrorCode.INVALID_SESSION,
                        "Token emitido por outro servidor: " + claims.getIssuer());
            }

            UserToken userToken = claims.get(USER_FIELD, UserToken.class);
            if (userToken == null || userToken.getId() == null) {
                throw new InvalidSessionException(ApiErrorCode.INVALID_SESSION,
                        "Token sem identificação do usuário no claim " + USER_FIELD + ".");
            }

            return toAuthentication(userToken);

        } catch (ExpiredJwtException e) {
            throw new InvalidSessionException(ApiErrorCode.SESSION_EXPIRED,
                    "Token expirado em " + e.getClaims().getExpiration() + ".", e);
        } catch (JwtException | IllegalArgumentException e) {
            // Assinatura inválida, formato quebrado, claim de tipo inesperado.
            throw new InvalidSessionException(ApiErrorCode.INVALID_SESSION,
                    "Token inválido: " + e.getMessage(), e);
        }
    }

    public Jwt() {
    }

    public static ZonedDateTime utcNow() {
        return ZonedDateTime.now(ZoneOffset.UTC);
    }

    public static Date toDate(ZonedDateTime zonedDateTime) {
        return Date.from(zonedDateTime.toInstant());
    }

    public static Authentication toAuthentication(UserToken userToken) {

        // Boolean.TRUE.equals: tokens antigos podem não trazer o campo isAdmin.
        String role = Boolean.TRUE.equals(userToken.getIsAdmin()) ? "ROLE_ADMIN" : "ROLE_USER";

        return new UsernamePasswordAuthenticationToken(
                userToken, userToken.getId(), List.of(new SimpleGrantedAuthority(role))
        );
    }
 }
