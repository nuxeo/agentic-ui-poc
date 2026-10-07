package org.nuxeo.agentic.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.nuxeo.agentic.config.TestContributions.fragment;
import static org.nuxeo.agentic.config.TestContributions.from;
import static org.nuxeo.agentic.config.TestContributions.layout;

import java.io.FileNotFoundException;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

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

    static Stream<Arguments> rejectedReplacements() {
        String big = "{\"a\":\"" + "x".repeat(ConfigSnapshot.MAX_JSON_BYTES) + "\"}";
        return Stream.of(Arguments.of("unreadable", Contribution.fragment("manifest", "acme", true, from("regional"),
                () -> {
                    throw new FileNotFoundException("agentic-ui-config/regional.json");
                }, new Object())), Arguments.of("too-large", fragment("regional", "manifest", "acme", big)),
                Arguments.of("invalid-json", fragment("regional", "manifest", "acme", "{ \"a\": ")),
                Arguments.of("not-an-object", fragment("regional", "manifest", "acme", "[]")));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("rejectedReplacements")
    void aRejectedReplacementKeepsTheFragmentItNamedInPlace(String code, Contribution replacement) {
        ConfigSnapshot snapshot = build(fragment("acme", "manifest", "acme", "{\"a\":1}"),
                fragment("ours", "manifest", "later", "{}"), replacement);

        assertEquals(List.of("acme", "later"),
                snapshot.fragments("manifest").stream().map(ConfigSnapshot.Fragment::name).toList());
        assertEquals("acme", snapshot.fragments("manifest").get(0).provenance().component());
        assertEquals(1, snapshot.fragments("manifest").get(0).content().get("a").asInt());
        assertEquals(List.of(code, "kept"), codes(snapshot));
        Diagnostic kept = snapshot.diagnostics().get(1);
        assertEquals(Diagnostic.Level.WARNING, kept.level());
        assertEquals(ConfigScope.MANIFEST, kept.scope());
        assertTrue(kept.message().contains("replacement from regional"), kept.message());
    }

    @Test
    void aRejectedLayoutOrAssetReplacementKeepsTheWorkingVersion() {
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"/>".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        ConfigSnapshot snapshot = build(layout("acme", "Contract", "view", "{\"rows\":[]}"),
                TestContributions.asset("acme", "acme-logo.svg", svg),
                layout("regional", "Contract", "view", "not json"),
                Contribution.asset("acme-logo.svg", true, from("regional"), () -> {
                    throw new FileNotFoundException("agentic-ui-config/assets/acme-logo.svg");
                }, new Object()));

        assertEquals("acme", snapshot.layouts().get(0).provenance().component());
        assertEquals("acme", snapshot.assets().get(0).provenance().component());
        assertEquals(List.of("invalid-json", "kept", "unreadable", "kept"), codes(snapshot));
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
