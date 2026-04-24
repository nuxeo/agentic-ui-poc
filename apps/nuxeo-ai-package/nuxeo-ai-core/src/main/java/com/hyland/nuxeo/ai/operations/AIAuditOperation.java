package com.hyland.nuxeo.ai.operations;

import com.hyland.nuxeo.ai.client.HaipClient;
import com.hyland.nuxeo.ai.prompts.SystemPrompts;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.Blobs;

import java.time.LocalDate;
import java.util.List;

/**
 * Two audit AI operations in one: nl-filter and summarize.
 * POST /nuxeo/api/v1/automation/AI.AuditNlFilter
 * POST /nuxeo/api/v1/automation/AI.AuditSummarize
 */
@Operation(
    id = "AI.AuditNlFilter",
    category = "AI",
    label = "AI: Audit Natural Language Filter",
    description = "Converts a natural language audit query to filter parameters using HAIP."
)
public class AIAuditOperation {

    @Param(name = "query")
    protected String query;

    @Param(name = "today", required = false)
    protected String today;

    @OperationMethod
    public Blob run() throws Exception {
        String todayStr = (today != null && !today.isBlank())
                ? today
                : LocalDate.now().toString();

        String result = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.NL_AUDIT_FILTER),
                HaipClient.user("Today is " + todayStr + ". User query: \"" + query + "\"")
            ),
            256
        );

        return Blobs.createJSONBlob(result);
    }
}
