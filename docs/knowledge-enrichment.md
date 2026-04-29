# Knowledge Enrichment

Knowledge Enrichment (KE) in this repo runs through the **Hyland Content Intelligence Connector (CIC)** installed on Nuxeo. The Angular app does not call a separate backend for KE. Instead, it:

1. fetches the current document blob from Nuxeo
2. posts that blob to a Nuxeo automation op
3. lets the connector handle KE authentication and Context API calls
4. writes the returned enrichment back into Nuxeo metadata

## Supported UI flows

The document detail page exposes KE actions in the top-right header area of the document preview.

### PDF

- `text-classification` -> persisted to `dc:nature` and shown as `Document Category`
- `named-entity-recognition-text` -> persisted to `nxtag:tags`
- `text-summarization` -> persisted to `dc:description`

### Image

- `image-description` + `named-entity-recognition-image` run together from one action
- description is persisted to `dc:description`
- image entities are persisted to `nxtag:tags`

This mapping follows the KE end-user guide linked from `NXSAT-143` and keeps the results visible in the existing properties panel without introducing CSX components.

## Integration boundary

Shared client: `@agentic-ui/shared/ke-client`

Primary automation op:

- `HylandKnowledgeEnrichment.Enrich`

Other verified KE-related ops available on the live Nuxeo server:

- `HylandKnowledgeEnrichment.SendForEnrichment`
- `HylandKnowledgeEnrichment.GetEnrichmentResults`
- `HylandKnowledgeEnrichment.UploadFile`
- `HylandKnowledgeEnrichment.Invoke`
- `HylandKnowledgeEnrichment.Configure`
- `HylandContentIntelligence.GetContributionNames`

`HylandKnowledgeEnrichment.Enrich` accepts multipart input:

- a JSON part named `request`
- a blob part named `input`

This was verified live against the local Nuxeo container. When KE config is missing, the op currently fails with:

```text
No authentication info for calling the Enrichment service.
```

That proves the browser-to-Nuxeo multipart shape is correct and the remaining blocker is server-side KE configuration, not the Angular request format.

## Request shape

The shared client posts multipart form data to:

```text
/nuxeo/site/automation/HylandKnowledgeEnrichment.Enrich
```

The `request` part contains:

```json
{
  "params": {
    "actions": "text-classification,text-summarization",
    "sourceId": "document-uuid",
    "classes": "[\"Contract\",\"Invoice\",\"Legal\"]",
    "extraJsonPayloadStr": "{\"maxWordCount\":150}"
  }
}
```

## Response shape

The public Context API OpenAPI file documents the canonical KE response model as:

```json
{
  "id": "processing-id",
  "status": "Complete",
  "inProgress": false,
  "results": [
    {
      "objectKey": "documents/123/file.pdf",
      "textSummary": { "isSuccess": true, "result": "..." },
      "textClassification": { "isSuccess": true, "result": "Contract" },
      "namedEntityText": {
        "isSuccess": true,
        "result": {
          "ORGANIZATION": ["Hyland"],
          "PERSON": ["Jane Doe"]
        }
      },
      "imageDescription": { "isSuccess": true, "result": "..." },
      "namedEntityImage": {
        "isSuccess": true,
        "result": {
          "LOCATION": ["Cleveland"]
        }
      }
    }
  ]
}
```

Some connector builds may also wrap that in a generic:

```json
{
  "response": { "...": "..." },
  "responseCode": 200,
  "responseMessage": "OK"
}
```

`KeClientService` tolerates both forms.

## Required Nuxeo config

The KE contribution inside the CIC bundle reads these properties:

```conf
nuxeo.hyland.cic.auth.baseUrl=...
nuxeo.hyland.cic.contextEnrichment.baseUrl=...
nuxeo.hyland.cic.enrichment.clientId=...
nuxeo.hyland.cic.enrichment.clientSecret=...
nuxeo.hyland.cic.enrichment.auth.grantType=client_credentials
nuxeo.hyland.cic.enrichment.auth.scope=environment_authorization
```

The live local container currently has no `contextEnrichment` or `enrichment.*` values configured, which is why KE requests fail before reaching the remote service.

## Verification steps

1. Confirm the connector exposes KE contributions:

```bash
docker exec nuxeo curl -s -u Administrator:Administrator \
  -X POST -H "Content-Type: application/json" \
  http://localhost:8080/nuxeo/site/automation/HylandContentIntelligence.GetContributionNames \
  -d '{"params":{"which":"knowledgeEnrichment"}}'
```

Expected result:

```json
{ "knowledgeEnrichment": ["default"] }
```

2. Smoke test the multipart KE op:

```bash
printf 'KE smoke test' >/tmp/ke-sample.txt

curl -sS -u Administrator:Administrator \
  -X POST "http://localhost:8080/nuxeo/site/automation/HylandKnowledgeEnrichment.Enrich" \
  -H "Accept: application/json" \
  -F "request={\"params\":{\"actions\":\"text-summarization\"}};type=application/json" \
  -F "input=@/tmp/ke-sample.txt;type=text/plain"
```

If config is still missing, the current expected failure is the connector error above. Once KE credentials are configured, this should return a JSON result payload instead.

3. In the UI, upload:

- a PDF for classification, entity extraction, and summarization
- an image for description and image entity extraction

4. After each action, verify the properties panel refreshes:

- `Document Category`
- `Tags`
- `Description`

## Environment notes

- `NXENG-42` comments indicate the old dev KE setup was unstable.
- Prefer the integrations/staging path documented in the linked engineering guide when provisioning KE accounts and credentials.
- `NXSAT-143` comments already called out avoiding noisy shared environments for reliable validation.
