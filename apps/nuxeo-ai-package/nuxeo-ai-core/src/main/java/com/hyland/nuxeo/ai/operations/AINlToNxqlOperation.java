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
 * Convert natural language to NXQL, or suggest query completions.
 * POST /nuxeo/api/v1/automation/AI.NlToNxql
 * Body: { "params": { "query": "...", "suggestions": false } }
 */
@Operation(
    id = "AI.NlToNxql",
    category = "AI",
    label = "AI: Natural Language to NXQL",
    description = "Converts a natural language query to NXQL (or returns search suggestions) using HAIP."
)
public class AINlToNxqlOperation {

    @Param(name = "query")
    protected String query;

    @Param(name = "suggestions", required = false)
    protected Boolean suggestions = false;

    @OperationMethod
    public Blob run() throws Exception {
        boolean isSuggestions = Boolean.TRUE.equals(suggestions);
        String systemPrompt = isSuggestions
                ? SystemPrompts.NL_TO_NXQL_SUGGESTIONS
                : SystemPrompts.NL_TO_NXQL;

        String result = HaipClient.chatFast(
            List.of(
                HaipClient.system(systemPrompt),
                HaipClient.user(query)
            ),
            512
        );

        return Blobs.createJSONBlob(result);
    }
}
