package org.nuxeo.agentic.config;

import java.nio.charset.StandardCharsets;

/** Builders for contributions as the component would make them, without a running Nuxeo. */
final class TestContributions {

    private TestContributions() {
    }

    static Provenance from(String component) {
        return new Provenance(component, component + ".bundle", "agentic-ui-config/" + component + ".json");
    }

    static Contribution.Content json(String body) {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        return () -> bytes;
    }

    static Contribution fragment(String component, String layer, String name, String body) {
        return Contribution.fragment(layer, name, true, from(component), json(body), new Object());
    }

    static Contribution disabledFragment(String component, String layer, String name) {
        return Contribution.fragment(layer, name, false, from(component), null, new Object());
    }

    static Contribution layout(String component, String type, String mode, String body) {
        return Contribution.layout(type, mode, true, from(component), json(body), new Object());
    }

    static Contribution asset(String component, String name, byte[] bytes) {
        return Contribution.asset(name, true, from(component), () -> bytes, new Object());
    }
}
