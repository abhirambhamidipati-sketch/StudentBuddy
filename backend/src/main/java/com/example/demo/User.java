package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

/**
 * Represents an application user.
 *
 * Table is named "app_user" because "user" is a reserved keyword in H2/SQL.
 *
 * provider values:
 *   "LOCAL"  — account created via username/password signup
 *   "GOOGLE" — account created via Google OAuth2 (no password stored)
 *
 * role values (Spring Security convention — must start with "ROLE_"):
 *   "ROLE_USER"  — default for all new accounts
 *   "ROLE_ADMIN" — future admin capabilities
 */
@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;  // UUID

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;  // BCrypt hash for LOCAL; "OAUTH2_NO_PASSWORD" for GOOGLE

    @Column(nullable = false)
    private String role = "ROLE_USER";  // default for every new account

    @Column(nullable = false)
    private String provider = "LOCAL";  // "LOCAL" | "GOOGLE"

    public User() {}

    public User(String id, String username, String password) {
        this.id       = id;
        this.username = username;
        this.password = password;
        // role and provider use field defaults
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public String getId()       { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRole()     { return role; }
    public String getProvider() { return provider; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(String id)             { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role)         { this.role = role; }
    public void setProvider(String provider) { this.provider = provider; }
}
