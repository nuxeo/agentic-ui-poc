package org.nuxeo.agentic.config;

/**
 * Something an administrator should know about the configuration in force: a fragment that did
 * not parse, one that replaced or removed another.
 *
 * @param scope the response it is reported in — see {@link ConfigScope}
 * @param provenance the contribution it is about
 */
record Diagnostic(Level level, String code, String message, String scope, Provenance provenance) {

    enum Level {
        ERROR, WARNING, INFO;

        String label() {
            return name().toLowerCase(java.util.Locale.ROOT);
        }
    }

    static Diagnostic error(String code, String scope, Provenance provenance, String message) {
        return new Diagnostic(Level.ERROR, code, message, scope, provenance);
    }

    static Diagnostic warning(String code, String scope, Provenance provenance, String message) {
        return new Diagnostic(Level.WARNING, code, message, scope, provenance);
    }

    static Diagnostic info(String code, String scope, Provenance provenance, String message) {
        return new Diagnostic(Level.INFO, code, message, scope, provenance);
    }
}
