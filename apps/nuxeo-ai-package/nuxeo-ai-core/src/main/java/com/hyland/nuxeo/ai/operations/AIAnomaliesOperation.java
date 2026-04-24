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
 * Detect anomalies in audit events using HAIP.
 * POST /nuxeo/api/v1/automation/AI.Anomalies
 * Body: { "params": { "timeRange": "24h" } }
 */
@Operation(
    id = "AI.Anomalies",
    category = "AI",
    label = "AI: Detect Audit Anomalies",
    description = "Analyses recent audit events and flags anomalies using HAIP."
)
public class AIAnomaliesOperation {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Context
    protected CoreSession session;

    @Param(name = "timeRange", required = false)
    protected String timeRange = "24h";

    @OperationMethod
    public Blob run() throws Exception {
        int pageSize = "30d".equals(timeRange) ? 200 : "7d".equals(timeRange) ? 100 : 50;
        List<Map<String, Object>> auditData = fetchAuditEvents(pageSize);
        String auditJson = MAPPER.writeValueAsString(auditData);
        String truncated = auditJson.length() > 30000 ? auditJson.substring(0, 30000) : auditJson;

        String result = HaipClient.chat(
            List.of(
                HaipClient.system(SystemPrompts.ANOMALIES),
                HaipClient.user("Analyse these audit events for anomalies (time range: " + timeRange + "):\n" + truncated)
            ),
            1024
        );

        return Blobs.createJSONBlob(result);
    }

    private List<Map<String, Object>> fetchAuditEvents(int pageSize) {
        try {
            // Query audit log documents (ecm:currentLifeCycleState captures recent events)
            String nxql = "SELECT * FROM Document WHERE ecm:mixinType = 'Auditable'"
                    + " AND ecm:isProxy = 0 AND ecm:isVersion = 0"
                    + " ORDER BY dc:modified DESC";
            DocumentModelList docs = session.query(nxql, pageSize);
            List<Map<String, Object>> events = new ArrayList<>();
            for (DocumentModel d : docs) {
                Map<String, Object> event = new HashMap<>();
                event.put("title", d.getTitle());
                event.put("type", d.getType());
                event.put("path", d.getPathAsString());
                event.put("modified", d.getPropertyValue("dc:modified"));
                event.put("creator", d.getPropertyValue("dc:creator"));
                event.put("state", d.getCurrentLifeCycleState());
                events.add(event);
            }
            return events;
        } catch (Exception e) {
            return List.of();
        }
    }
}
