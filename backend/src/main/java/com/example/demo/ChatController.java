package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * POST /chat — hybrid assistant endpoint.
 *
 * Routing:
 *   System command (add task, view goals, analytics, …)
 *       → ChatService  (rule-based, instant, no external call)
 *   Everything else
 *       → LLMService   (OpenAI gpt-4o-mini)
 *
 * Request:  { "message": "What is polymorphism?" }
 * Response: { "reply":   "Polymorphism is …" }
 *
 * Error contract: always HTTP 200 with a "reply" key — never a 5xx to the client.
 */
@RestController
@CrossOrigin
public class ChatController {

    private final ChatService chatService;
    private final LLMService  llmService;

    public ChatController(ChatService chatService, LLMService llmService) {
        this.chatService = chatService;
        this.llmService  = llmService;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody(required = false) Map<String, String> body) {
        try {
            if (body == null) {
                return ok("Please type a message.");
            }
            String message = body.getOrDefault("message", "").trim();
            if (message.isEmpty()) {
                return ok("Please type a message.");
            }

            String userId = currentUser();
            String reply  = chatService.shouldHandle(message, userId)
                    ? chatService.handleMessage(message, userId)
                    : llmService.getLLMResponse(message);

            return ok(reply);
        } catch (Exception ex) {
            return ok("Something went wrong. Please try again.");
        }
    }

    private static ResponseEntity<Map<String, String>> ok(String reply) {
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
