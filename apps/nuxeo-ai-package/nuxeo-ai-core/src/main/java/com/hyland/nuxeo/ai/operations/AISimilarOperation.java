package com.hyland.nuxeo.ai.operations;

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

/**
 * Find documents similar to a given document using HAIP-generated NXQL.
 * POST /nuxeo/api/v1/automation/AI.Similar
 * Body: { "params": { "docId": "<uid>", "limit": 5 } }
 */
@Operation(
    id = "AI.Similar",
    category = "AI",
    label = "AI: Find Similar Documents",
    description = "Finds similar documents using AI-generated NXQL via HAIP."
)
public class AISimilarOperation {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Context
    protected CoreSession session;

    @Param(name = "docId")
    protected String docId;

    @Param(name = "limit", required = false)
    protected Integer limit = 5;

    @OperationMethod
    public Blob run() throws Exception {
        DocumentModel doc = session.getDocument(new IdRef(docId));

        String docInfo = "Title: " + doc.getTitle() + "\nType: " + doc.getType()
                + "\nPath: " + doc.getPathAsString();

        // Ask HAIP to generate a NXQL query for similar documents
        String nxqlJson = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.SIMILAR),
                HaipClient.user(docInfo)
            ),
            256
        );

        // Parse the NXQL from the response
        List<Map<String, Object>> documents = new ArrayList<>();
        try {
            JsonNode parsed = MAPPER.readTree(nxqlJson);
            String nxql = parsed.path("nxql").asText("");
            if (!nxql.isBlank() && nxql.toUpperCase().startsWith("SELECT")) {
                DocumentModelList results = session.query(nxql, limit != null ? limit : 5);
                for (DocumentModel d : results) {
                    if (d.getId().equals(docId)) continue; // exclude self
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("uid", d.getId());
                    entry.put("title", d.getTitle());
                    entry.put("type", d.getType());
                    entry.put("path", d.getPathAsString());
                    entry.put("modified", d.getPropertyValue("dc:modified"));
                    documents.add(entry);
                }
            }
        } catch (Exception ignored) {}

        Map<String, Object> response = new HashMap<>();
        response.put("documents", documents);
        return Blobs.createJSONBlob(MAPPER.writeValueAsString(response));
    }
}
