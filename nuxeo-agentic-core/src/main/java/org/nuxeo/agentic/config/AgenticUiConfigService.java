package org.nuxeo.agentic.config;

/**
 * The UI configuration contributed by installed packages, in contribution order.
 *
 * Packages contribute to the {@code configuration} extension point of
 * {@code org.nuxeo.agentic.ui.config}. The configuration servlet serves the result at
 * {@code /nuxeo/agentic-ui-config/}, and the browser merges the fragments in order, so there is one
 * merge implementation and it is the application's.
 */
public interface AgenticUiConfigService {

    /** The configuration in force, read once at startup. */
    ConfigSnapshot getSnapshot();
}
