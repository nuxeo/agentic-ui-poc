package com.hyland.nuxeo.ai.operations;

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
import org.nuxeo.ecm.core.api.IdRef;

import java.util.List;

/**
 * Summarize a document using HAIP.
 * POST /nuxeo/api/v1/automation/AI.Summarize
 * Body: { "params": { "docId": "<uid>" } }
 */
@Operation(
    id = "AI.Summarize",
    category = "AI",
    label = "AI: Summarize Document",
    description = "Summarizes a Nuxeo document using the HAIP model gateway."
)
public class AISummarizeOperation {

    @Context
    protected CoreSession session;

    @Param(name = "docId", description = "UID of the document to summarize")
    protected String docId;

    @OperationMethod
    public Blob run() throws Exception {
        DocumentModel doc = session.getDocument(new IdRef(docId));
        String content = buildContent(doc);

        String result = HaipClient.chat(
            List.of(
                HaipClient.system(SystemPrompts.SUMMARIZE),
                HaipClient.user(content)
            ),
            1024
        );

        return Blobs.createJSONBlob(result);
    }

    private String buildContent(DocumentModel doc) {
        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(doc.getTitle()).append("\n");
        sb.append("Type: ").append(doc.getType()).append("\n");
        sb.append("Path: ").append(doc.getPathAsString()).append("\n");

        String description = (String) doc.getPropertyValue("dc:description");
        if (description != null && !description.isBlank()) {
            sb.append("Description: ").append(description).append("\n");
        }

        // Note content
        try {
            String note = (String) doc.getPropertyValue("note:note");
            if (note != null && !note.isBlank()) {
                sb.append("\nNote content:\n").append(note);
                return sb.toString();
            }
        } catch (Exception ignored) {}

        // Blob content
        try {
            Blob blob = (Blob) doc.getPropertyValue("file:content");
            if (blob != null) {
                String text = blob.getString();
                if (text != null && !text.isBlank()) {
                    String truncated = text.length() > 50000 ? text.substring(0, 50000) + "\n[...truncated]" : text;
                    sb.append("\nContent:\n").append(truncated);
                }
            }
        } catch (Exception ignored) {
            sb.append("\n[No readable content available]");
        }

        return sb.toString();
    }
}
