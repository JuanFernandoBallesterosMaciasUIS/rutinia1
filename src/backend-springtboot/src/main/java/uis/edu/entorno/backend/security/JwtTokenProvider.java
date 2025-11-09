package uis.edu.entorno.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Generar token JWT
    public String generarToken(Authentication authentication) {
        String username = authentication.getName();
        Date fechaActual = new Date();
        Date fechaExpiracion = new Date(fechaActual.getTime() + jwtExpiration);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(username)
                .issuedAt(fechaActual)
                .expiration(fechaExpiracion)
                .signWith(key)
                .compact();
    }

    // Generar token desde username
    public String generarTokenDesdeUsername(String username) {
        Date fechaActual = new Date();
        Date fechaExpiracion = new Date(fechaActual.getTime() + jwtExpiration);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(username)
                .issuedAt(fechaActual)
                .expiration(fechaExpiracion)
                .signWith(key)
                .compact();
    }

    // Obtener el username del token
    public String obtenerUsernameDeJwt(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // Validar el token JWT
    public boolean validarToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println("Token JWT malformado: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            System.err.println("Token JWT expirado: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            System.err.println("Token JWT no soportado: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            System.err.println("Claims JWT vacío: " + ex.getMessage());
        }
        return false;
    }
}
