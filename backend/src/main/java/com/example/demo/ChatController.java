package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * POST /chat — authenticated rule-based chatbot endpoint.
 *
 * Request:  { "message": "add task Study for OOPs exam" }
 * Response: { "reply":   "Task added: \"Study for OOPs exam\"" }
 *
 * Error contract: always returns HTTP 200 with a "reply" key.
 * Unexpected server errors are caught and returned as a user-friendly message
 * rather than a 500 stack trace.
 */
@RestController
@CrossOrigin
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody(required = false) Map<String, String> body) {
        try {
            // Null body (e.g. missing Content-Type or empty payload)
            if (body == null) {
                return ResponseEntity.ok(Map.of("reply", "Please type a message."));
            }
            String message = body.getOrDefault("message", "").trim();
            if (message.isEmpty()) {
                return ResponseEntity.ok(Map.of("reply", "Please type a message."));
            }
            String reply = chatService.handleMessage(message, currentUser());
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception ex) {
            // Never expose internal details — return a safe fallback message
            return ResponseEntity.ok(Map.of("reply", "Something went wrong. Please try again."));
        }
    }
}
