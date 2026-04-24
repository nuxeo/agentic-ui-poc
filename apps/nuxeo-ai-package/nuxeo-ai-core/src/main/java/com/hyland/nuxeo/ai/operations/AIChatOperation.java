package com.hyland.nuxeo.ai.operations;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyland.nuxeo.ai.client.HaipClient;
import com.hyland.nuxeo.ai.prompts.SystemPrompts;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.Blobs;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.IdRef;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * RAG-backed chat operation. Mirrors rag.service.ts + chat.route.ts logic.
 *
 * POST /nuxeo/api/v1/automation/AI.Chat
 * Body: {
 *   "params": {
 *     "message": "...",
 *     "historyJson": "[{\"role\":\"user\",\"content\":\"...\"}]",   // optional
 *     "docId": "<uid>",   // optional — current document context
 *     "page": "browse"    // optional
 *   }
 * }
 *
 * Response: { "reply": "...", "sources": [{...}] }
 */
@Operation(
    id = "AI.Chat",
    category = "AI",
    label = "AI: RAG Chat",
    description = "Context-aware chat with access to Nuxeo documents via HAIP."
)
public class AIChatOperation {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern TASK_KEYWORDS =
            Pattern.compile("\\b(tasks?|pending|workflow|assigned|review|approval|to.?do)\\b",
                    Pattern.CASE_INSENSITIVE);

    @Context
    protected CoreSession session;

    @Param(name = "message")
    protected String message;

    /** JSON array of prior chat messages: [{role,content}, ...] */
    @Param(name = "historyJson", required = false)
    protected String historyJson;

    /** UID of the document currently open in the UI (optional). */
    @Param(name = "docId", required = false)
    protected String docId;

    @Param(name = "page", required = false)
    protected String page;

    @OperationMethod
    public Blob run() throws Exception {
        List<Map<String, String>> sources = new ArrayList<>();
        StringBuilder nuxeoContext = new StringBuilder();

        // 1. Build context from the currently-viewed document (if any)
        if (docId != null && !docId.isBlank()) {
            buildDocContext(docId, nuxeoContext, sources);
        }

        // 2. Convert the user message to NXQL and search for relevant documents
        String searchIntent = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.NL_TO_NXQL),
                HaipClient.user(message)
            ),
            256
        );

        String nxql = extractNxql(searchIntent);
        if (nxql != null) {
            appendSearchResults(nxql, nuxeoContext, sources);
        }

        // 3. Fetch task context if the message is about tasks
        if (TASK_KEYWORDS.matcher(message).find()) {
            appendTaskContext(nuxeoContext);
        }

        // 4. Build the full message list and call HAIP
        String systemPrompt = SystemPrompts.CHAT
                + (nuxeoContext.length() > 0 ? nuxeoContext.toString() : "");

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(HaipClient.system(systemPrompt));

        // Append conversation history
        if (historyJson != null && !historyJson.isBlank()) {
            try {
                List<Map<String, String>> history = MAPPER.readValue(
                        historyJson, new TypeReference<>() {});
                messages.addAll(history);
            } catch (Exception ignored) {}
        }

        messages.add(HaipClient.user(message));

        String reply = HaipClient.chat(messages, 1024);

        Map<String, Object> response = new HashMap<>();
        response.put("reply", reply);
        response.put("sources", sources);

        return Blobs.createJSONBlob(MAPPER.writeValueAsString(response));
    }

    // -----------------------------------------------------------------------

    private void buildDocContext(String uid, StringBuilder ctx,
            List<Map<String, String>> sources) {
        try {
            DocumentModel doc = session.getDocument(new IdRef(uid));

            ctx.append("\n\nThe user is currently viewing this document:\n");
            ctx.append("Title: ").append(doc.getTitle()).append("\n");
            ctx.append("Path: ").append(doc.getPathAsString()).append("\n");
            ctx.append("Type: ").append(doc.getType()).append("\n");
            ctx.append("State: ").append(doc.getCurrentLifeCycleState()).append("\n");

            appendIfPresent(ctx, "Description: ", (String) doc.getPropertyValue("dc:description"));
            appendIfPresent(ctx, "Creator: ",     (String) doc.getPropertyValue("dc:creator"));
            appendIfPresent(ctx, "Created: ",     stringify(doc.getPropertyValue("dc:created")));
            appendIfPresent(ctx, "Modified: ",    stringify(doc.getPropertyValue("dc:modified")));
            appendIfPresent(ctx, "Nature: ",      (String) doc.getPropertyValue("dc:nature"));

            sources.add(Map.of(
                "uid", doc.getId(),
                "title", doc.getTitle(),
                "path", doc.getPathAsString(),
                "type", doc.getType()
            ));

            // Blob content
            try {
                Blob blob = (Blob) doc.getPropertyValue("file:content");
                if (blob != null) {
                    String text = blob.getString();
                    if (text != null && !text.isBlank()) {
                        String preview = text.length() > 8000 ? text.substring(0, 8000) : text;
                        ctx.append("Document content").append(text.length() > 8000 ? " (truncated)" : "")
                           .append(":\n").append(preview).append("\n");
                    }
                }
            } catch (Exception ignored) {}

        } catch (Exception e) {
            // document not accessible — ignore
        }
    }

    private void appendSearchResults(String nxql, StringBuilder ctx,
            List<Map<String, String>> sources) {
        try {
            DocumentModelList results = session.query(nxql, 5);
            if (!results.isEmpty()) {
                ctx.append("\n\nHere are the documents found in the Nuxeo repository:\n");
                for (DocumentModel d : results) {
                    ctx.append("- \"").append(d.getTitle()).append("\"")
                       .append(" | type: ").append(d.getType())
                       .append(" | path: ").append(d.getPathAsString())
                       .append(" | uid: ").append(d.getId())
                       .append("\n");
                    sources.add(Map.of(
                        "uid", d.getId(),
                        "title", d.getTitle(),
                        "path", d.getPathAsString(),
                        "type", d.getType()
                    ));
                }
            }
        } catch (Exception ignored) {}
    }

    private void appendTaskContext(StringBuilder ctx) {
        try {
            String username = session.getPrincipal().getName();
            String nxql = "SELECT * FROM TaskDoc WHERE nt:actors/* = '" + username
                    + "' AND ecm:currentLifeCycleState = 'opened' ORDER BY dc:created DESC";
            DocumentModelList tasks = session.query(nxql, 20);
            if (!tasks.isEmpty()) {
                ctx.append("\n\nUser's pending tasks:\n");
                for (DocumentModel t : tasks) {
                    ctx.append("- Task: \"").append(t.getPropertyValue("nt:name")).append("\"")
                       .append(" | directive: ").append(t.getPropertyValue("nt:directive"))
                       .append(" | due: ").append(stringify(t.getPropertyValue("nt:dueDate")))
                       .append("\n");
                }
            } else {
                ctx.append("\n\nThe user has no pending tasks.\n");
            }
        } catch (Exception ignored) {}
    }

    private String extractNxql(String aiResponse) {
        try {
            JsonNode parsed = MAPPER.readTree(aiResponse);
            String nxql = parsed.path("nxql").asText("");
            if (!nxql.isBlank() && !nxql.equals("NONE")
                    && nxql.toUpperCase().startsWith("SELECT")) {
                return nxql;
            }
        } catch (Exception e) {
            if (aiResponse.toUpperCase().startsWith("SELECT")) {
                return aiResponse;
            }
        }
        return null;
    }

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(value).append("\n");
        }
    }

    private String stringify(Object value) {
        return value != null ? value.toString() : null;
    }
}
