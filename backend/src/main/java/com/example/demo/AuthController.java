package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private static final long REFRESH_TOKEN_DAYS = 7;

    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo,
                          RefreshTokenRepository refreshRepo,
                          BCryptPasswordEncoder encoder,
                          JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    // ── SIGNUP (FIXED CLEANLY) ───────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));
            }

            if (password.length() < 8 ||
                !password.matches(".*[A-Z].*") ||
                !password.matches(".*[a-z].*") ||
                !password.matches(".*\\d.*")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Weak password"));
            }

            if (userRepo.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
            }

            User user = new User();
            user.setUsername(username);
            user.setPassword(encoder.encode(password)); // ✅ FIXED
            user.setRole("ROLE_USER");
            user.setProvider("LOCAL");

            userRepo.save(user);

            return ResponseEntity.ok(Map.of("message", "User created"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Signup failed"));
        }
    }

    // ── LOGIN ───────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody AuthRequest req) {

        if (req.username() == null || req.password() == null)
            return err(HttpStatus.BAD_REQUEST, "Username and password are required");

        return userRepo.findByUsername(req.username())
                .filter(u -> {
                    if ("GOOGLE".equals(u.getProvider())) return false;
                    return encoder.matches(req.password(), u.getPassword());
                })
                .map(u -> tokenPair(u, HttpStatus.OK))
                .orElseGet(() -> err(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
    }

    // ── REFRESH ─────────────────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody RefreshRequest req) {

        if (req.refreshToken() == null || req.refreshToken().isBlank())
            return err(HttpStatus.BAD_REQUEST, "Refresh token is required");

        RefreshToken stored = refreshRepo.findByToken(req.refreshToken()).orElse(null);

        if (stored == null || stored.isExpired()) {
            if (stored != null) refreshRepo.deleteById(stored.getToken());
            return err(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
        }

        User user = userRepo.findById(stored.getUserId()).orElse(null);
        if (user == null)
            return err(HttpStatus.UNAUTHORIZED, "User no longer exists");

        refreshRepo.deleteById(stored.getToken());

        return tokenPair(user, HttpStatus.OK);
    }

    // ── LOGOUT ──────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) LogoutRequest req) {
        if (req != null && req.refreshToken() != null) {
            refreshRepo.deleteById(req.refreshToken());
        }
        return ResponseEntity.noContent().build();
    }

    // ── CLEANUP ─────────────────────────────────────────────────────────────
    @Scheduled(fixedDelay = 3_600_000)
    public void purgeExpiredRefreshTokens() {
        refreshRepo.deleteExpiredTokens(Instant.now());
    }

    // ── HELPERS ─────────────────────────────────────────────────────────────
    ResponseEntity<Map<String, String>> tokenPair(User user, HttpStatus status) {
        String accessToken = jwtUtil.generateToken(
                user.getId(), user.getUsername(), user.getRole());

        RefreshToken rt = new RefreshToken(
                UUID.randomUUID().toString(),
                user.getId(),
                Instant.now().plus(REFRESH_TOKEN_DAYS, ChronoUnit.DAYS));
        refreshRepo.save(rt);

        return ResponseEntity.status(status).body(Map.of(
                "token", accessToken,
                "refreshToken", rt.getToken()
        ));
    }

    private static ResponseEntity<Map<String, String>> err(HttpStatus status, String msg) {
        return ResponseEntity.status(status).body(Map.of("error", msg));
    }

    record AuthRequest(String username, String password) {}
    record RefreshRequest(String refreshToken) {}
    record LogoutRequest(String refreshToken) {}
}