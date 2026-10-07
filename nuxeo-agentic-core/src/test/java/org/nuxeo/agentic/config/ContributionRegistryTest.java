package org.nuxeo.agentic.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.nuxeo.agentic.config.TestContributions.disabledFragment;
import static org.nuxeo.agentic.config.TestContributions.fragment;
import static org.nuxeo.agentic.config.TestContributions.layout;

import java.util.List;

import org.junit.jupiter.api.Test;

class ContributionRegistryTest {

    private static List<String> owners(ContributionRegistry.Resolution resolution) {
        return resolution.inForce().stream().map(c -> c.provenance().component() + ":" + c.key()).toList();
    }

    private static List<String> codes(ContributionRegistry.Resolution resolution) {
        return resolution.diagnostics().stream().map(Diagnostic::code).toList();
    }

    @Test
    void keepsRegistrationOrder() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("ours", "bootstrap", "defaults", "{}"));
        registry.add(fragment("acme", "bootstrap", "acme", "{}"));
        registry.add(fragment("partner", "bootstrap", "partner", "{}"));

        assertEquals(List.of("ours:fragment bootstrap/defaults", "acme:fragment bootstrap/acme",
                "partner:fragment bootstrap/partner"), owners(registry.resolve()));
    }

    @Test
    void aLaterFragmentWithTheSameNameAndLayerReplacesTheEarlierOneInPlace() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("ours", "bootstrap", "defaults", "{}"));
        registry.add(fragment("acme", "bootstrap", "acme", "{}"));
        registry.add(fragment("partner", "bootstrap", "defaults", "{}"));

        ContributionRegistry.Resolution resolution = registry.resolve();

        assertEquals(List.of("partner:fragment bootstrap/defaults", "acme:fragment bootstrap/acme"),
                owners(resolution));
        assertEquals(List.of("replaced"), codes(resolution));
        assertTrue(resolution.diagnostics().get(0).message().contains("ours (bundle ours.bundle)"));
        assertTrue(resolution.diagnostics().get(0).message().contains("replaced by partner"));
    }

    @Test
    void theSameNameInAnotherLayerIsADifferentFragment() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("ours", "bootstrap", "defaults", "{}"));
        registry.add(fragment("ours", "manifest", "defaults", "{}"));

        assertEquals(2, registry.resolve().inForce().size());
        assertTrue(registry.resolve().diagnostics().isEmpty());
    }

    @Test
    void disablingRemovesTheFragmentAndSaysWho() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("ours", "manifest", "defaults", "{}"));
        registry.add(fragment("acme", "manifest", "acme", "{}"));
        registry.add(disabledFragment("partner", "manifest", "acme"));

        ContributionRegistry.Resolution resolution = registry.resolve();

        assertEquals(List.of("ours:fragment manifest/defaults"), owners(resolution));
        assertEquals(List.of("removed"), codes(resolution));
        assertEquals(ConfigScope.MANIFEST, resolution.diagnostics().get(0).scope());
    }

    @Test
    void disablingSomethingThatWasNeverContributedIsReported() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(disabledFragment("acme", "bootstrap", "typo"));

        ContributionRegistry.Resolution resolution = registry.resolve();

        assertTrue(resolution.inForce().isEmpty());
        assertEquals(List.of("disabled-nothing"), codes(resolution));
        assertEquals(Diagnostic.Level.WARNING, resolution.diagnostics().get(0).level());
    }

    @Test
    void reEnablingAfterARemovalAppendsAtTheEnd() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("ours", "bootstrap", "a", "{}"));
        registry.add(fragment("ours", "bootstrap", "b", "{}"));
        registry.add(disabledFragment("acme", "bootstrap", "a"));
        registry.add(fragment("acme", "bootstrap", "a", "{}"));

        assertEquals(List.of("ours:fragment bootstrap/b", "acme:fragment bootstrap/a"),
                owners(registry.resolve()));
    }

    @Test
    void aLaterLayoutForTheSameTypeAndModeReplacesTheWholeFile() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(layout("ours", "File", "view", "{}"));
        registry.add(layout("acme", "File", "edit", "{}"));
        registry.add(layout("partner", "File", "view", "{}"));

        ContributionRegistry.Resolution resolution = registry.resolve();

        assertEquals(List.of("partner:layout File/view", "acme:layout File/edit"), owners(resolution));
        assertEquals(ConfigScope.LAYOUTS, resolution.diagnostics().get(0).scope());
    }

    @Test
    void invalidContributionsAreReportedAndSkipped() {
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("acme", "runtime", "acme", "{}"));
        registry.add(fragment("acme", "bootstrap", "../escape", "{}"));
        registry.add(layout("acme", "File", "View", "{}"));
        registry.add(layout("acme", "../File", "view", "{}"));
        registry.add(TestContributions.asset("acme", "logo.html", new byte[0]));
        registry.add(TestContributions.asset("acme", "../logo.svg", new byte[0]));
        registry.add(Contribution.fragment("bootstrap", "empty", true, TestContributions.from("acme"), null,
                new Object()));

        ContributionRegistry.Resolution resolution = registry.resolve();

        assertTrue(resolution.inForce().isEmpty());
        assertEquals(7, resolution.diagnostics().size());
        assertTrue(resolution.diagnostics().stream().allMatch(d -> d.level() == Diagnostic.Level.ERROR));
        assertTrue(resolution.diagnostics().stream().allMatch(d -> d.code().equals("invalid-contribution")));
    }

    @Test
    void acceptsImageAssetNamesOnly() {
        for (String name : List.of("logo.svg", "acme-logo.PNG", "brand.mark.webp", "favicon.ico", "a_b.jpeg")) {
            assertTrue(ContributionRegistry.ASSET_NAME.matcher(name).matches(), name);
        }
        for (String name : List.of("logo.svg.js", "logo", ".svg", "dir/logo.svg", "logo.svgz", "x.html")) {
            assertFalse(ContributionRegistry.ASSET_NAME.matcher(name).matches(), name);
        }
    }

    @Test
    void withdrawingAContributionIsTheSameAsNeverHavingRegisteredIt() {
        Contribution partner = fragment("partner", "bootstrap", "defaults", "{}");
        ContributionRegistry registry = new ContributionRegistry();
        registry.add(fragment("ours", "bootstrap", "defaults", "{}"));
        registry.add(partner);

        assertTrue(registry.remove(partner.descriptor()));

        ContributionRegistry.Resolution resolution = registry.resolve();
        assertEquals(List.of("ours:fragment bootstrap/defaults"), owners(resolution));
        assertTrue(resolution.diagnostics().isEmpty());
        assertFalse(registry.remove(partner.descriptor()));
    }
}
