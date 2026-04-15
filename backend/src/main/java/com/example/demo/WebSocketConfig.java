package com.example.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP-over-WebSocket configuration for real-time reminder delivery.
 *
 * Endpoints:
 *   /ws          — native WebSocket (modern browsers, used by the React frontend)
 *   /ws-sockjs   — SockJS fallback endpoint (older browsers / corporate firewalls)
 *
 * Topic layout:
 *   /topic/reminders/{userId}  — per-user reminder channel; ReminderService
 *                                 pushes UPCOMING / MISSED notifications here.
 *
 * Security: /ws/** is permitted in SecurityConfig so that the HTTP upgrade
 * handshake passes through Spring Security.  The per-user topic URL already
 * embeds the user's opaque UUID, which prevents casual topic enumeration.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker for /topic destinations
        registry.enableSimpleBroker("/topic");
        // Prefix for messages routed to @MessageMapping controllers (not used yet)
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket — used by the React/Vite frontend
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // SockJS fallback — for environments that block raw WebSocket upgrades
        registry.addEndpoint("/ws-sockjs")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
