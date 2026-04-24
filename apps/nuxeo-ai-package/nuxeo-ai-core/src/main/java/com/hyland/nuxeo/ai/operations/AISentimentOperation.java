package com.hyland.nuxeo.ai.operations;

import com.hyland.nuxeo.ai.client.HaipClient;
import com.hyland.nuxeo.ai.prompts.SystemPrompts;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.Blobs;

import java.util.List;

/**
 * Analyse sentiment of document comments.
 * POST /nuxeo/api/v1/automation/AI.Sentiment
 * Body: { "params": { "commentsJson": "[{\"id\":\"1\",\"text\":\"Great doc!\"}]" } }
 */
@Operation(
    id = "AI.Sentiment",
    category = "AI",
    label = "AI: Analyse Comment Sentiment",
    description = "Analyses sentiment of comments on a document using HAIP."
)
public class AISentimentOperation {

    /** JSON-serialised array of { id, text } comment objects. */
    @Param(name = "commentsJson")
    protected String commentsJson;

    @OperationMethod
    public Blob run() throws Exception {
        String result = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.SENTIMENT),
                HaipClient.user("Analyse these comments:\n" + commentsJson)
            ),
            1024
        );

        return Blobs.createJSONBlob(result);
    }
}
