package com.example.siamLacorns.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    /**
     * Значения можно задать в application.properties:
     * jwt.secret=mySecretKeyForJWTGenerationThatIsAtLeast32BytesLong!
     * jwt.expiration=86400
     */
    @Value("${jwt.secret:mySecretKeyForJWTGenerationThatIsAtLeast32BytesLong!}")
    private String secret;

    @Value("${jwt.expiration:86400}") // по умолчанию 24 часа
    private Long expiration;

    // ✅ Правильный метод получения ключа
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ====== Извлечение данных из токена ======

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.error("JWT parse error: {}", e.getMessage());
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ====== Генерация токена ======

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        SecretKey key = getSigningKey();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ====== Валидация токена ======

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean valid = (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
            if (!valid) {
                logger.warn("Invalid JWT for user: {}", username);
            }
            return valid;
        } catch (JwtException e) {
            logger.error("JWT validation error: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error during JWT validation: {}", e.getMessage());
            return false;
        }
    }
}
