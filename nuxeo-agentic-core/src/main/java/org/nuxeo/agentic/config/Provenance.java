package org.nuxeo.agentic.config;

/**
 * Who contributed something: the component that declared it, the bundle that ships that component,
 * and the file it was read from ({@code inline} when the JSON was written into the XML).
 */
record Provenance(String component, String bundle, String source) {

    static final String INLINE = "inline";
}
