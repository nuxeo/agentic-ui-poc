import { InjectionToken } from '@angular/core';
export const DEFAULT_KE_CIC_OPERATIONS = {
    enrich: 'HylandKnowledgeEnrichment.Enrich',
    sendForEnrichment: 'HylandKnowledgeEnrichment.SendForEnrichment',
    getEnrichmentResults: 'HylandKnowledgeEnrichment.GetEnrichmentResults',
    uploadFile: 'HylandKnowledgeEnrichment.UploadFile',
    invoke: 'HylandKnowledgeEnrichment.Invoke',
    configure: 'HylandKnowledgeEnrichment.Configure',
};
export const KE_CIC_OPERATIONS = new InjectionToken('KE_CIC_OPERATIONS', {
    providedIn: 'root',
    factory: () => DEFAULT_KE_CIC_OPERATIONS,
});
