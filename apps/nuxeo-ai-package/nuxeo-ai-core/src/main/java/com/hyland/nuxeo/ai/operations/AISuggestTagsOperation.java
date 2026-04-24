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
 * Suggest tags for a document using HAIP.
 * POST /nuxeo/api/v1/automation/AI.SuggestTags
 * Body: { "params": { "docId": "<uid>" } }
 */
@Operation(
    id = "AI.SuggestTags",
    category = "AI",
    label = "AI: Suggest Tags",
    description = "Suggests relevant tags for a document using the HAIP model gateway."
)
public class AISuggestTagsOperation {

    @Context
    protected CoreSession session;

    @Param(name = "docId")
    protected String docId;

    @OperationMethod
    public Blob run() throws Exception {
        DocumentModel doc = session.getDocument(new IdRef(docId));

        StringBuilder content = new StringBuilder();
        content.append("Title: ").append(doc.getTitle()).append("\n");
        content.append("Type: ").append(doc.getType()).append("\n");
        content.append("Path: ").append(doc.getPathAsString()).append("\n");

        String description = (String) doc.getPropertyValue("dc:description");
        if (description != null && !description.isBlank()) {
            content.append("Description: ").append(description).append("\n");
        }

        try {
            Blob blob = (Blob) doc.getPropertyValue("file:content");
            if (blob != null) {
                String text = blob.getString();
                if (text != null && text.length() > 0) {
                    content.append("\nContent preview:\n")
                           .append(text, 0, Math.min(text.length(), 10000));
                }
            }
        } catch (Exception ignored) {}

        String result = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.SUGGEST_TAGS),
                HaipClient.user(content.toString())
            ),
            512
        );

        return Blobs.createJSONBlob(result);
    }
}
