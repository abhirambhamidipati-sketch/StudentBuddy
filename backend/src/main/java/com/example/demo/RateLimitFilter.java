package com.example.demo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding-window rate limiter for sensitive authentication endpoints.
 *
 * Configuration:
 *   MAX_REQUESTS = 10 requests
 *   WINDOW_MS    = 60 000 ms  (1 minute)
 *
 * Any IP that exceeds 10 calls within the rolling 60-second window receives
 * a 429 Too Many Requests response with a JSON body.
 *
 * Implementation notes:
 *  - In-memory ConcurrentHashMap: simple and sufficient for a single-instance app.
 *    For multi-node deployments, replace with a Redis-backed implementation.
 *  - Each IP's timestamps are stored in an ArrayDeque protected by synchronized().
 *    Expired entries are pruned on every request — no separate cleanup thread needed.
 *  - X-Forwarded-For is respected so the real client IP is used behind a proxy/LB.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int  MAX_REQUESTS = 10;
    private static final long WINDOW_MS    = 60_000L;

    /** Only these paths are rate-limited; all other routes pass through freely. */
    private static final Set<String> PROTECTED = Set.of("/auth/login", "/auth/signup", "/chat");

    // IP address → deque of request timestamps (milliseconds)
    private final ConcurrentHashMap<String, Deque<Long>> windowMap = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest  request,
                                    HttpServletResponse response,
                                    FilterChain         chain)
            throws ServletException, IOException {

        if (!PROTECTED.contains(request.getServletPath())) {
            chain.doFilter(request, response);
            return;
        }

        String ip  = resolveClientIp(request);
        long   now = System.currentTimeMillis();

        Deque<Long> window = windowMap.computeIfAbsent(ip, k -> new ArrayDeque<>());

        int currentCount;
        synchronized (window) {
            // Slide the window: remove timestamps older than WINDOW_MS
            long cutoff = now - WINDOW_MS;
            while (!window.isEmpty() && window.peekFirst() < cutoff) {
                window.pollFirst();
            }
            currentCount = window.size();
            if (currentCount < MAX_REQUESTS) {
                window.addLast(now);   // count this request
            }
        }

        if (currentCount >= MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"Too many requests. Please wait before trying again.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    /** Respects X-Forwarded-For so the real IP is used behind a reverse proxy. */
    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
