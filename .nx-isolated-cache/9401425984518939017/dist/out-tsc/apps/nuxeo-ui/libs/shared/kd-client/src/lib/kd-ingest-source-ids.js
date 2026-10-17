/**
 * Resolve Content Lake source ids for `HylandIngest.CheckDigest`.
 * KD agents often leave `sourceIds` empty and bind content via
 * `staticFilterExpression.field === '__sourceId__'`.
 */
export function extractIngestSourceIdsFromAgent(agent) {
    const fromArray = (agent.sourceIds ?? []).map((id) => id.trim()).filter((id) => id.length > 0);
    if (fromArray.length > 0) {
        return [...new Set(fromArray)];
    }
    const filter = agent.staticFilterExpression;
    if (filter && filter['field'] === '__sourceId__' && typeof filter['value'] === 'string') {
        const value = filter['value'].trim();
        if (value.length > 0) {
            return [value];
        }
    }
    return [];
}
export function collectIngestSourceIds(agents) {
    return [...new Set(agents.flatMap((agent) => extractIngestSourceIdsFromAgent(agent)))];
}
