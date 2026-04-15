package com.example.demo;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Handles a successful Google OAuth2 login.
 *
 * Flow:
 *  1. Extract the verified email from Google's OAuth2 attribute map.
 *  2. Find an existing account or create one
 *     (provider=GOOGLE, password="OAUTH2_NO_PASSWORD", role=ROLE_USER).
 *  3. Issue a short-lived JWT access token + a persisted 7-day refresh token.
 *  4. Redirect the browser to the Vite dev server with both tokens in the URL:
 *       http://localhost:5173?token=<jwt>&refreshToken=<uuid>
 *     App.jsx reads both params, saves them to localStorage, and removes them
 *     from the URL via history.replaceState().
 *
 * Error contract:
 *   Every failure path redirects to the frontend with an ?error= param so the
 *   user never sees the Spring Boot Whitelabel error page.  The try-catch
 *   around the entire body is the last-resort safety net.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final String FRONTEND_URL       = "http://localhost:5173";
    private static final long   REFRESH_TOKEN_DAYS = 7;

    private final UserRepository         userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final JwtUtil                jwtUtil;

    public OAuth2LoginSuccessHandler(UserRepository userRepo,
                                     RefreshTokenRepository refreshRepo,
                                     JwtUtil jwtUtil) {
        this.userRepo    = userRepo;
        this.refreshRepo = refreshRepo;
        this.jwtUtil     = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest  request,
                                        HttpServletResponse response,
                                        Authentication      authentication)
            throws IOException {

        // ── DEBUG LOGGING (temporary — remove after confirming Google login works) ──
        System.out.println("[OAuth2] onAuthenticationSuccess triggered");

        try {
            // ── 1. Extract email from Google's attribute map ──────────────────
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            Object emailObj = oAuth2User.getAttribute("email");

            System.out.println("[OAuth2] Raw email attribute: " + emailObj);

            if (emailObj == null) {
                // Google did not return an email — only possible if the `email`
                // scope was not requested.  This is a configuration issue.
                System.out.println("[OAuth2] ERROR: email attribute is null — "
                        + "check that 'email' scope is in application.properties");
                redirectError(response, "oauth_email_missing");
                return;
            }

            String email = emailObj.toString().trim();

            if (email.isBlank()) {
                System.out.println("[OAuth2] ERROR: email is blank");
                redirectError(response, "oauth_email_missing");
                return;
            }

            System.out.println("[OAuth2] Processing login for email: " + email);

            // ── 2. Find or create the local user account ──────────────────────
            User user = userRepo.findByUsername(email).orElseGet(() -> {
                System.out.println("[OAuth2] First-time Google login — creating account for: " + email);
                User newUser = new User();
                newUser.setUsername(email);
                // Not a real password — blocks username/password login for Google accounts
                newUser.setPassword("OAUTH2_NO_PASSWORD");
                newUser.setRole("ROLE_USER");
                newUser.setProvider("GOOGLE");
                return userRepo.save(newUser);
            });

            System.out.println("[OAuth2] Resolved user id: " + user.getId());

            // Backfill: if an existing LOCAL account shares this email address,
            // tag it as GOOGLE so password login is blocked going forward.
            if (!"GOOGLE".equals(user.getProvider())) {
                System.out.println("[OAuth2] Backfilling provider=GOOGLE for user: " + user.getId());
                user.setProvider("GOOGLE");
                userRepo.save(user);
            }

            // ── 3. Guard against null userId (should never happen with @GeneratedValue) ──
            if (user.getId() == null) {
                System.out.println("[OAuth2] ERROR: user.getId() is null after save — "
                        + "check @GeneratedValue(strategy = GenerationType.UUID) in User.java");
                redirectError(response, "oauth_internal_error");
                return;
            }

            // ── 4. Issue JWT access token ─────────────────────────────────────
            String accessToken = jwtUtil.generateToken(
                    user.getId(), user.getUsername(), user.getRole());

            System.out.println("[OAuth2] JWT generated successfully");

            // ── 5. Issue persisted refresh token ──────────────────────────────
            RefreshToken rt = new RefreshToken(
                    UUID.randomUUID().toString(),
                    user.getId(),
                    Instant.now().plus(REFRESH_TOKEN_DAYS, ChronoUnit.DAYS));
            refreshRepo.save(rt);

            // ── 6. Redirect back to frontend with both tokens ─────────────────
            String redirectUrl = FRONTEND_URL
                    + "?token=" + accessToken
                    + "&refreshToken=" + rt.getToken();

            System.out.println("[OAuth2] Redirecting to frontend — login complete");
            response.sendRedirect(redirectUrl);

        } catch (Exception ex) {
            // Last-resort handler — catches any unchecked exception so the user
            // always lands on the frontend (with an error param) rather than
            // seeing the Whitelabel 500 page.
            System.out.println("[OAuth2] UNHANDLED EXCEPTION: "
                    + ex.getClass().getName() + ": " + ex.getMessage());
            ex.printStackTrace();

            if (!response.isCommitted()) {
                redirectError(response, "oauth_failed");
            }
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Sends the user back to the frontend with a recognisable error param.
     * Using sendRedirect (not sendError) so the user always ends up at the
     * React app — never at the Spring Boot Whitelabel error page.
     */
    private void redirectError(HttpServletResponse response, String reason) throws IOException {
        response.sendRedirect(FRONTEND_URL + "?error=" + reason);
    }
}
