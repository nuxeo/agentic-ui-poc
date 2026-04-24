package com.hyland.nuxeo.ai.operations;

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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Generate personalised dashboard insights for the current user.
 * POST /nuxeo/api/v1/automation/AI.Insights
 * Body: { "params": {} }   ← userId is taken from the active session
 */
@Operation(
    id = "AI.Insights",
    category = "AI",
    label = "AI: Get User Insights",
    description = "Generates personalised insights for the logged-in user using HAIP."
)
public class AIInsightsOperation {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Context
    protected CoreSession session;

    /** Optional override; defaults to the authenticated principal. */
    @Param(name = "userId", required = false)
    protected String userId;

    @OperationMethod
    public Blob run() throws Exception {
        String user = (userId != null && !userId.isBlank())
                ? userId
                : session.getPrincipal().getName();

        String tasksJson = fetchTasksJson(user);
        String recentDocsJson = fetchRecentDocsJson(user);

        String context = "User: " + user + "\n\n"
                + "Tasks:\n" + tasksJson + "\n\n"
                + "Recent documents:\n" + recentDocsJson;

        String result = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.INSIGHTS),
                HaipClient.user(context)
            ),
            1024
        );

        return Blobs.createJSONBlob(result);
    }

    private String fetchTasksJson(String user) {
        try {
            // TaskDoc type holds workflow task instances
            String nxql = "SELECT * FROM TaskDoc WHERE nt:actors/* = '" + user
                    + "' AND ecm:currentLifeCycleState = 'opened' ORDER BY dc:created DESC";
            DocumentModelList tasks = session.query(nxql, 50);
            List<Map<String, Object>> list = new ArrayList<>();
            for (DocumentModel t : tasks) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("name", t.getPropertyValue("nt:name"));
                entry.put("directive", t.getPropertyValue("nt:directive"));
                entry.put("dueDate", t.getPropertyValue("nt:dueDate"));
                entry.put("uid", t.getId());
                list.add(entry);
            }
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String fetchRecentDocsJson(String user) {
        try {
            String nxql = "SELECT * FROM Document WHERE dc:creator = '" + user
                    + "' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0"
                    + " ORDER BY dc:modified DESC";
            DocumentModelList docs = session.query(nxql, 20);
            List<Map<String, Object>> list = new ArrayList<>();
            for (DocumentModel d : docs) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("title", d.getTitle());
                entry.put("type", d.getType());
                entry.put("path", d.getPathAsString());
                entry.put("modified", d.getPropertyValue("dc:modified"));
                list.add(entry);
            }
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }
}
