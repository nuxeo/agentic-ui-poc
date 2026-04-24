package com.hyland.nuxeo.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.nuxeo.runtime.api.Framework;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * HTTP client for the Hyland AI Platform (HAIP) Model Gateway.
 *
 * HAIP exposes an OpenAI-compatible REST API. Configure via nuxeo.conf:
 *   haip.api.key=sk-...
 *   haip.base.url=https://ai-platform-public.api.ai.dev.app.hyland.com
 *   haip.model=anthropic.claude-3-5-sonnet-20241022-v2:0
 *   haip.model.fast=amazon.nova-micro-v1:0
 *   haip.environment.id=<optional env id>
 */
public class HaipClient {

    private static final Logger log = LoggerFactory.getLogger(HaipClient.class);

    public static final String PROP_API_KEY      = "haip.api.key";
    public static final String PROP_BASE_URL     = "haip.base.url";
    public static final String PROP_MODEL        = "haip.model";
    public static final String PROP_MODEL_FAST   = "haip.model.fast";
    public static final String PROP_ENV_ID       = "haip.environment.id";

    private static final String DEFAULT_BASE_URL   = "https://ai-platform-public.api.ai.dev.app.hyland.com";
    private static final String DEFAULT_MODEL       = "anthropic.claude-3-5-sonnet-20241022-v2:0";
    private static final String DEFAULT_MODEL_FAST  = "amazon.nova-micro-v1:0";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    // -----------------------------------------------------------------------
    // Public helpers
    // -----------------------------------------------------------------------

    public static String getModel() {
        return Framework.getProperty(PROP_MODEL, DEFAULT_MODEL);
    }

    public static String getModelFast() {
        return Framework.getProperty(PROP_MODEL_FAST, DEFAULT_MODEL_FAST);
    }

    /**
     * Send a chat completion request to HAIP and return the assistant's response text.
     *
     * @param messages  List of message maps with "role" and "content" keys.
     * @param model     Model identifier (use {@link #getModel()} or {@link #getModelFast()}).
     * @param maxTokens Maximum tokens in the response.
     * @param temperature Sampling temperature (0.0 – 1.0).
     * @return The assistant message content string.
     */
    public static String chat(List<Map<String, String>> messages, String model, int maxTokens,
            double temperature) throws IOException, InterruptedException {

        String apiKey = Framework.getProperty(PROP_API_KEY, "");
        String baseUrl = Framework.getProperty(PROP_BASE_URL, DEFAULT_BASE_URL);
        String envId   = Framework.getProperty(PROP_ENV_ID, "");

        if (apiKey.isBlank()) {
            throw new IllegalStateException(
                    "HAIP API key not configured. Add 'haip.api.key=sk-...' to nuxeo.conf");
        }

        // Build request body
        ObjectNode body = MAPPER.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("temperature", temperature);

        ArrayNode msgsArray = body.putArray("messages");
        for (Map<String, String> msg : messages) {
            ObjectNode msgNode = MAPPER.createObjectNode();
            msgNode.put("role", msg.get("role"));
            msgNode.put("content", msg.get("content"));
            msgsArray.add(msgNode);
        }

        // Optional HAIP metadata
        if (!envId.isBlank()) {
            ObjectNode meta = body.putObject("metadata");
            meta.put("environment_id", envId);
            meta.put("user_id", "nuxeo-agentic-ui");
        }

        String requestJson = MAPPER.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/v1/chat/completions"))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("User-Agent", "nuxeo-agentic-ui/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        log.debug("[HaipClient] POST {}/v1/chat/completions model={}", baseUrl, model);

        HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            String err = response.body();
            log.error("[HaipClient] HAIP error {}: {}", response.statusCode(), err);
            throw new IOException(
                    "HAIP API returned HTTP " + response.statusCode() + ": " + err);
        }

        JsonNode root = MAPPER.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText("").trim();
    }

    /** Shorthand using the default (smart) model. */
    public static String chat(List<Map<String, String>> messages, int maxTokens)
            throws IOException, InterruptedException {
        return chat(messages, getModel(), maxTokens, 0.3);
    }

    /** Shorthand using the fast model. */
    public static String chatFast(List<Map<String, String>> messages, int maxTokens)
            throws IOException, InterruptedException {
        return chat(messages, getModelFast(), maxTokens, 0.3);
    }

    // -----------------------------------------------------------------------
    // Message builder helpers
    // -----------------------------------------------------------------------

    public static Map<String, String> system(String content) {
        return Map.of("role", "system", "content", content);
    }

    public static Map<String, String> user(String content) {
        return Map.of("role", "user", "content", content);
    }
}
