package org.nuxeo.agentic.config;

import java.io.IOException;

/**
 * One contribution to the configuration extension point, with where it came from.
 *
 * Kept free of runtime types so the ordering and replacement rules can be tested without starting
 * Nuxeo: the component turns a descriptor plus its contributor into one of these.
 *
 * @param descriptor the contributed object, compared by identity when a contribution is withdrawn
 */
record Contribution(Kind kind, String layer, String name, String type, String mode, boolean enabled,
        Provenance provenance, Content content, Object descriptor) {

    enum Kind {
        FRAGMENT, LAYOUT, ASSET
    }

    /** Reads a contribution's body. Throws when the source cannot be read. */
    @FunctionalInterface
    interface Content {
        byte[] read() throws IOException;
    }

    static Contribution fragment(String layer, String name, boolean enabled, Provenance provenance, Content content,
            Object descriptor) {
        return new Contribution(Kind.FRAGMENT, layer, name, null, null, enabled, provenance, content, descriptor);
    }

    static Contribution layout(String type, String mode, boolean enabled, Provenance provenance, Content content,
            Object descriptor) {
        return new Contribution(Kind.LAYOUT, null, null, type, mode, enabled, provenance, content, descriptor);
    }

    static Contribution asset(String name, boolean enabled, Provenance provenance, Content content,
            Object descriptor) {
        return new Contribution(Kind.ASSET, null, name, null, null, enabled, provenance, content, descriptor);
    }

    /** What a later contribution must match to replace or remove this one. */
    String key() {
        return switch (kind) {
            case FRAGMENT -> "fragment " + layer + "/" + name;
            case LAYOUT -> "layout " + type + "/" + mode;
            case ASSET -> "asset " + name;
        };
    }

    /**
     * The response this contribution's diagnostics belong in. A fragment whose layer is missing or
     * unknown is reported in bootstrap, the response every client reads first, rather than under a
     * layer no response serves.
     */
    String scope() {
        return switch (kind) {
            case FRAGMENT -> ConfigScope.isFragmentLayer(layer) ? layer : ConfigScope.BOOTSTRAP;
            case LAYOUT -> ConfigScope.LAYOUTS;
            case ASSET -> ConfigScope.BOOTSTRAP;
        };
    }
}
