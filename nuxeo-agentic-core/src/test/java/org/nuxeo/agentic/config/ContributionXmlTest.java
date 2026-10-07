package org.nuxeo.agentic.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.nuxeo.common.xmap.XMap;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * The contribution XML a package writes, read by the same XMap the runtime uses, and the shipped
 * defaults that our own contribution points at.
 */
class ContributionXmlTest {

    private static Object[] load(String xml) throws Exception {
        XMap xmap = new XMap();
        xmap.register(FragmentDescriptor.class);
        xmap.register(LayoutDescriptor.class);
        xmap.register(AssetDescriptor.class);
        return xmap.loadAll(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void readsEveryElementAPackageCanContribute() throws Exception {
        Object[] loaded = load("""
                <extension target="org.nuxeo.agentic.ui.config" point="configuration">
                  <fragment name="acme" layer="bootstrap" src="agentic-ui-config/bootstrap.json"/>
                  <fragment name="acme-labels" layer="manifest">
                    <json><![CDATA[ { "labels": { "app.navbar.browse": "Contracts & <Co>" } } ]]></json>
                  </fragment>
                  <fragment name="defaults" layer="manifest" enabled="false"/>
                  <layout type="Contract" mode="view" src="agentic-ui-config/layouts/Contract/view.layout.json"/>
                  <asset name="acme-logo.svg" src="agentic-ui-config/assets/acme-logo.svg"/>
                </extension>
                """);

        assertEquals(5, loaded.length);
        FragmentDescriptor bootstrap = (FragmentDescriptor) loaded[0];
        assertEquals("acme", bootstrap.getName());
        assertEquals("bootstrap", bootstrap.getLayer());
        assertEquals("agentic-ui-config/bootstrap.json", bootstrap.getSrc());
        assertTrue(bootstrap.isEnabled());
        assertNull(bootstrap.getJson());

        FragmentDescriptor inline = (FragmentDescriptor) loaded[1];
        assertNull(inline.getSrc());
        JsonNode parsed = ConfigSnapshot.JSON.readTree(inline.getJson());
        assertEquals("Contracts & <Co>", parsed.at("/labels/app.navbar.browse").asText());

        assertFalse(((FragmentDescriptor) loaded[2]).isEnabled());

        LayoutDescriptor layout = (LayoutDescriptor) loaded[3];
        assertEquals("Contract", layout.getType());
        assertEquals("view", layout.getMode());

        AssetDescriptor asset = (AssetDescriptor) loaded[4];
        assertEquals("acme-logo.svg", asset.getName());
        assertEquals("agentic-ui-config/assets/acme-logo.svg", asset.getSrc());
    }

    @Test
    void theShippedDefaultsParseAsObjects() throws Exception {
        for (String name : List.of("bootstrap", "manifest")) {
            try (InputStream in = getClass().getClassLoader()
                                            .getResourceAsStream("agentic-ui-config/" + name + ".defaults.json")) {
                assertNotNull(in, name + ".defaults.json is not on the bundle's classpath");
                JsonNode defaults = ConfigSnapshot.JSON.readTree(in);
                assertTrue(defaults.isObject(), name);
            }
        }
    }

    @Test
    void ourDefaultsContributionPointsAtFilesTheBundleShips() throws Exception {
        String component;
        try (InputStream in = getClass().getClassLoader()
                                        .getResourceAsStream("OSGI-INF/agentic-ui-config-defaults-contrib.xml")) {
            assertNotNull(in);
            component = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
        String extension = component.substring(component.indexOf("<extension"),
                component.indexOf("</extension>") + "</extension>".length());

        Object[] loaded = load(extension);

        assertEquals(2, loaded.length);
        for (Object descriptor : loaded) {
            FragmentDescriptor fragment = (FragmentDescriptor) descriptor;
            assertEquals("defaults", fragment.getName());
            assertNotNull(getClass().getClassLoader().getResource(fragment.getSrc()), fragment.getSrc());
        }
        assertTrue(component.contains("<require>org.nuxeo.agentic.ui.config</require>"));
    }
}
