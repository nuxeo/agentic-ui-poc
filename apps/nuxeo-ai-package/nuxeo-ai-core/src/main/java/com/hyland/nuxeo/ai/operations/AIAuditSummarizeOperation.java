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
 * Summarise a set of audit entries using HAIP.
 * POST /nuxeo/api/v1/automation/AI.AuditSummarize
 * Body: { "params": { "entriesJson": "[...]" } }
 */
@Operation(
    id = "AI.AuditSummarize",
    category = "AI",
    label = "AI: Summarize Audit Entries",
    description = "Produces an executive summary of audit log entries using HAIP."
)
public class AIAuditSummarizeOperation {

    /** JSON-serialised array of audit entry objects. */
    @Param(name = "entriesJson")
    protected String entriesJson;

    @OperationMethod
    public Blob run() throws Exception {
        String truncated = entriesJson.length() > 30000
                ? entriesJson.substring(0, 30000)
                : entriesJson;

        String result = HaipClient.chat(
            List.of(
                HaipClient.system(SystemPrompts.AUDIT_SUMMARY),
                HaipClient.user("Analyse these audit events:\n" + truncated)
            ),
            1024
        );

        return Blobs.createJSONBlob(result);
    }
}
