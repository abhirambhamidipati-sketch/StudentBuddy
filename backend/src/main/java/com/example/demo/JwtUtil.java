package com.example.demo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT utility backed by JJWT 0.12.x.
 *
 * Access-token claims:
 *   sub      — userId (UUID)   used by JwtFilter to identify the user
 *   username — login name      informational only
 *   role     — e.g. ROLE_USER  loaded as a Spring Security GrantedAuthority
 *   iat / exp standard timing claims
 *
 * Access-token lifetime is intentionally short (15 min).
 * Clients obtain a new one using the long-lived refresh token
 * stored in the database (see RefreshToken entity + /auth/refresh endpoint).
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;

    /** Access token lifetime — kept short so stolen tokens expire quickly. */
    private static final long ACCESS_TOKEN_EXPIRY_MS = 15L * 60 * 1000;  // 15 minutes

    public JwtUtil(@Value("${app.jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ── Token generation ──────────────────────────────────────────────────────

    /**
     * Builds a signed access token.
     *
     * @param userId   UUID primary key of the user — stored in {@code sub}
     * @param username login name                   — stored as extra claim
     * @param role     Spring Security role string  — e.g. "ROLE_USER"
     */
    public String generateToken(String userId, String username, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(userId)
                .claim("username", username)
                .claim("role", role)
                .issuedAt(new Date(now))
                .expiration(new Date(now + ACCESS_TOKEN_EXPIRY_MS))
                .signWith(signingKey)
                .compact();
    }

    // ── Claim extraction ──────────────────────────────────────────────────────

    /** Returns the userId UUID from {@code sub}, or {@code null} if token is invalid. */
    public String extractUserId(String token) {
        try { return parseClaims(token).getSubject(); } catch (Exception e) { return null; }
    }

    /** Returns the role claim (e.g. "ROLE_USER"), or {@code null} if token is invalid. */
    public String extractRole(String token) {
        try { return parseClaims(token).get("role", String.class); } catch (Exception e) { return null; }
    }

    // ── Validation ────────────────────────────────────────────────────────────

    /**
     * Returns {@code true} only when the signature is valid AND the token is not expired.
     * JJWT throws on any violation — a clean parse equals a valid token.
     */
    public boolean isValid(String token) {
        try { parseClaims(token); return true; } catch (Exception e) { return false; }
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
