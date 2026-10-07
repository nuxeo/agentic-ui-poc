package org.nuxeo.agentic.config;

/** The responses the configuration servlet serves, which diagnostics are filed under. */
final class ConfigScope {

    static final String BOOTSTRAP = "bootstrap";

    static final String MANIFEST = "manifest";

    static final String LAYOUTS = "layouts";

    private ConfigScope() {
    }

    static boolean isFragmentLayer(String layer) {
        return BOOTSTRAP.equals(layer) || MANIFEST.equals(layer);
    }
}
