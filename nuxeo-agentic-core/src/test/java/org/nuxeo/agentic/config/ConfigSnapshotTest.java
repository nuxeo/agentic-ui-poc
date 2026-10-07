package org.nuxeo.agentic.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.nuxeo.agentic.config.TestContributions.fragment;
import static org.nuxeo.agentic.config.TestContributions.from;
import static org.nuxeo.agentic.config.TestContributions.layout;

import java.io.FileNotFoundException;
import java.util.List;

import org.junit.jupiter.api.Test;

class ConfigSnapshotTest {

    private static ConfigSnapshot build(Contribution... contributions) {
        ContributionRegistry registry = new ContributionRegistry();
        for (Contribution contribution : contributions) {
            registry.add(contribution);
        }
        return ConfigSnapshot.build(registry.resolve());
    }

    private static List<String> codes(ConfigSnapshot snapshot) {
        return snapshot.diagnostics().stream().map(Diagnostic::code).toList();
    }

    @Test
    void keepsEachLayersFragmentsInContributionOrder() {
        ConfigSnapshot snapshot = build(fragment("ours", "bootstrap", "defaults", "{\"a\":1}"),
                fragment("ours", "manifest", "defaults", "{\"version\":1}"),
                fragment("acme", "bootstrap", "acme", "{\"a\":2}"));

        assertEquals(List.of("defaults", "acme"),
                snapshot.fragments("bootstrap").stream().map(ConfigSnapshot.Fragment::name).toList());
        assertEquals(2, snapshot.fragments("bootstrap").get(1).content().get("a").asInt());
        assertEquals(1, snapshot.fragments("manifest").size());
        assertTrue(snapshot.diagnostics().isEmpty());
    }

    @Test
    void aFragmentThatDoesNotParseIsLeftOutAndTheOthersStillApply() {
        ConfigSnapshot snapshot = build(fragment("ours", "bootstrap", "defaults", "{}"),
                fragment("acme", "bootstrap", "acme", "{ \"branding\": "),
                fragment("partner", "bootstrap", "partner", "{}"));

        assertEquals(List.of("defaults", "partner"),
                snapshot.fragments("bootstrap").stream().map(ConfigSnapshot.Fragment::name).toList());
        assertEquals(List.of("invalid-json"), codes(snapshot));
        Diagnostic diagnostic = snapshot.diagnostics().get(0);
        assertEquals(Diagnostic.Level.ERROR, diagnostic.level());
        assertEquals("acme", diagnostic.provenance().component());
        assertEquals(ConfigScope.BOOTSTRAP, diagnostic.scope());
    }

    @Test
    void rejectsDuplicateKeysTrailingTokensAndNonObjects() {
        ConfigSnapshot snapshot = build(fragment("acme", "manifest", "duplicate", "{\"a\":1,\"a\":2}"),
                fragment("acme", "manifest", "trailing", "{} {}"), fragment("acme", "manifest", "array", "[]"),
                fragment("acme", "manifest", "string", "\"x\""));

        assertTrue(snapshot.fragments("manifest").isEmpty());
        assertEquals(List.of("invalid-json", "invalid-json", "not-an-object", "not-an-object"), codes(snapshot));
    }

    @Test
    void anUnreadableSourceIsReportedWithWhereItWasLookedFor() {
        ConfigSnapshot snapshot = build(Contribution.fragment("bootstrap", "acme", true, from("acme"), () -> {
            throw new FileNotFoundException("agentic-ui-config/acme.json is not in the contributing bundle");
        }, new Object()));

        assertTrue(snapshot.fragments("bootstrap").isEmpty());
        assertEquals(List.of("unreadable"), codes(snapshot));
        assertTrue(snapshot.diagnostics().get(0).message().contains("not in the contributing bundle"));
    }

    @Test
    void anOversizedFragmentIsRefused() {
        String big = "{\"a\":\"" + "x".repeat(ConfigSnapshot.MAX_JSON_BYTES) + "\"}";
        ConfigSnapshot snapshot = build(fragment("acme", "bootstrap", "acme", big));

        assertTrue(snapshot.fragments("bootstrap").isEmpty());
        assertEquals(List.of("too-large"), codes(snapshot));
    }

    @Test
    void parsesLayoutsAndKeepsAssetBytes() {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"/>".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        ConfigSnapshot snapshot = build(layout("acme", "Contract", "view", "{\"rows\":[]}"),
                TestContributions.asset("acme", "acme-logo.svg", svg));

        assertEquals("Contract", snapshot.layouts().get(0).type());
        assertTrue(snapshot.layouts().get(0).content().has("rows"));
        assertEquals("image/svg+xml", snapshot.assets().get(0).contentType());
        assertEquals(svg.length, snapshot.assets().get(0).bytes().length);
    }

    @Test
    void mapsEveryAcceptedAssetExtensionToAnImageType() {
        assertEquals("image/png", ConfigSnapshot.contentType("a.PNG"));
        assertEquals("image/jpeg", ConfigSnapshot.contentType("a.jpg"));
        assertEquals("image/jpeg", ConfigSnapshot.contentType("a.jpeg"));
        assertEquals("image/gif", ConfigSnapshot.contentType("a.gif"));
        assertEquals("image/webp", ConfigSnapshot.contentType("a.webp"));
        assertEquals("image/x-icon", ConfigSnapshot.contentType("a.ico"));
        assertThrows(IllegalArgumentException.class, () -> ConfigSnapshot.contentType("a.html"));
    }
}
