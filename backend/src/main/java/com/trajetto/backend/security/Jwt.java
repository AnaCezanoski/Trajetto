package com.trajetto.backend.security;

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

    public Authentication extract(HttpServletRequest req) {
        try {
            String header = req.getHeader(HttpHeaders.AUTHORIZATION);
            if (header == null || !header.startsWith("Bearer ")) return null;

            String token = header.substring("Bearer ".length());

            JwtParser parser = Jwts.parser()
                    .json(new JacksonDeserializer<>(Map.of(USER_FIELD, UserToken.class)))
                    .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                    .build();


            Jws<Claims> jwt = parser.parseSignedClaims(token);
            Claims claims = jwt.getPayload();

            if (!ISSUER.equals(claims.getIssuer())) {
                return null;
            }

            UserToken userToken = claims.get(USER_FIELD, UserToken.class);
            return toAuthentication(userToken);
        } catch (Exception e) {
            return null;
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

        if(userToken.getIsAdmin()) {
            return new UsernamePasswordAuthenticationToken(
                    userToken, userToken.getId(), List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }
        return new UsernamePasswordAuthenticationToken(
                userToken, userToken.getId(), List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
 }
