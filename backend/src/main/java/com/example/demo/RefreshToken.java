package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.Instant;

/**
 * Persisted refresh token used to obtain a new short-lived access token
 * without forcing the user to re-authenticate.
 *
 * Design notes:
 *  - token      : random UUID, stored as the primary key (also used as the bearer value)
 *  - userId     : FK to app_user.id, stored as a plain String to avoid
 *                 detached-entity issues across separate JPA transactions
 *  - expiresAt  : hard expiry enforced on every /auth/refresh call
 *
 * Token rotation: each successful /auth/refresh call deletes this token
 * and issues a brand-new one, limiting the window any stolen token remains valid.
 */
@Entity
public class RefreshToken {

    @Id
    private String token;           // UUID — the value the client sends back

    @Column(nullable = false)
    private String userId;          // UUID of the owning user

    @Column(nullable = false)
    private Instant expiresAt;

    public RefreshToken() {}

    public RefreshToken(String token, String userId, Instant expiresAt) {
        this.token     = token;
        this.userId    = userId;
        this.expiresAt = expiresAt;
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public String  getToken()     { return token; }
    public String  getUserId()    { return userId; }
    public Instant getExpiresAt() { return expiresAt; }

    /** Convenience check — avoids embedding time logic in callers. */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
