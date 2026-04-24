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
import org.nuxeo.ecm.core.api.security.ACP;
import org.nuxeo.ecm.core.api.security.ACE;
import org.nuxeo.ecm.core.api.security.ACL;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Answer natural language questions about document permissions using HAIP.
 * POST /nuxeo/api/v1/automation/AI.NlPermissions
 * Body: { "params": { "query": "who can edit this folder?" } }
 */
@Operation(
    id = "AI.NlPermissions",
    category = "AI",
    label = "AI: Natural Language Permissions Query",
    description = "Answers natural language questions about document permissions using HAIP."
)
public class AINlPermissionsOperation {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Context
    protected CoreSession session;

    @Param(name = "query")
    protected String query;

    @OperationMethod
    public Blob run() throws Exception {
        List<Map<String, Object>> aclData = collectAclData();
        String aclJson = MAPPER.writeValueAsString(aclData);

        String result = HaipClient.chatFast(
            List.of(
                HaipClient.system(SystemPrompts.NL_PERMISSIONS),
                HaipClient.user("Query: " + query + "\n\nACL data:\n" + aclJson)
            ),
            256
        );

        return Blobs.createJSONBlob(result);
    }

    private List<Map<String, Object>> collectAclData() {
        List<Map<String, Object>> aclData = new ArrayList<>();
        try {
            String nxql = "SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation'"
                    + " AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0"
                    + " ORDER BY dc:modified DESC";
            DocumentModelList docs = session.query(nxql, 20);
            for (DocumentModel doc : docs) {
                ACP acp = session.getACP(doc.getRef());
                if (acp == null) continue;
                for (ACL acl : acp.getACLs()) {
                    for (ACE ace : acl.getACEs()) {
                        Map<String, Object> entry = new HashMap<>();
                        entry.put("path", doc.getPathAsString());
                        entry.put("principal", ace.getUsername());
                        entry.put("permission", ace.getPermission());
                        entry.put("granted", ace.isGranted());
                        aclData.add(entry);
                    }
                }
            }
        } catch (Exception ignored) {}
        return aclData;
    }
}
