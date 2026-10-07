package org.nuxeo.agentic.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * The configuration in force, read and parsed once.
 *
 * Built when the component starts, after every package's contributions are registered, so the
 * content can only change with an install and a restart. A fragment that cannot be read or does
 * not parse is left out and reported; the others still apply, because one customer's typo must not
 * take every other package's configuration down with it.
 */
public final class ConfigSnapshot {

    static final int MAX_JSON_BYTES = 1024 * 1024;

    static final int MAX_ASSET_BYTES = 2 * 1024 * 1024;

    static final ObjectMapper JSON = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                                                       .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

    record Fragment(String layer, String name, Provenance provenance, JsonNode content) {
    }

    record Layout(String type, String mode, Provenance provenance, JsonNode content) {
    }

    record Asset(String name, Provenance provenance, byte[] bytes, String contentType) {
    }

    private final List<Fragment> fragments;

    private final List<Layout> layouts;

    private final List<Asset> assets;

    private final List<Diagnostic> diagnostics;

    private ConfigSnapshot(List<Fragment> fragments, List<Layout> layouts, List<Asset> assets,
            List<Diagnostic> diagnostics) {
        this.fragments = List.copyOf(fragments);
        this.layouts = List.copyOf(layouts);
        this.assets = List.copyOf(assets);
        this.diagnostics = List.copyOf(diagnostics);
    }

    /** Fragments of one layer, in the order the browser applies them. */
    List<Fragment> fragments(String layer) {
        return fragments.stream().filter(fragment -> fragment.layer().equals(layer)).toList();
    }

    List<Layout> layouts() {
        return layouts;
    }

    List<Asset> assets() {
        return assets;
    }

    List<Diagnostic> diagnostics() {
        return diagnostics;
    }

    static ConfigSnapshot build(ContributionRegistry.Resolution resolution) {
        List<Fragment> fragments = new ArrayList<>();
        List<Layout> layouts = new ArrayList<>();
        List<Asset> assets = new ArrayList<>();
        List<Diagnostic> diagnostics = new ArrayList<>(resolution.diagnostics());

        for (Contribution contribution : resolution.inForce()) {
            Provenance provenance = contribution.provenance();
            int limit = contribution.kind() == Contribution.Kind.ASSET ? MAX_ASSET_BYTES : MAX_JSON_BYTES;
            byte[] bytes;
            try {
                bytes = contribution.content().read();
            } catch (IOException | RuntimeException e) {
                diagnostics.add(Diagnostic.error("unreadable", contribution.scope(), provenance,
                        String.format("%s could not be read from %s: %s", contribution.key(), provenance.source(),
                                e.getMessage())));
                continue;
            }
            if (bytes.length > limit) {
                diagnostics.add(Diagnostic.error("too-large", contribution.scope(), provenance,
                        String.format("%s is %d bytes; the limit is %d.", contribution.key(), bytes.length, limit)));
                continue;
            }
            if (contribution.kind() == Contribution.Kind.ASSET) {
                assets.add(new Asset(contribution.name(), provenance, bytes, contentType(contribution.name())));
                continue;
            }
            JsonNode content = parseObject(contribution, bytes, diagnostics);
            if (content == null) {
                continue;
            }
            if (contribution.kind() == Contribution.Kind.LAYOUT) {
                layouts.add(new Layout(contribution.type(), contribution.mode(), provenance, content));
                continue;
            }
            fragments.add(new Fragment(contribution.layer(), contribution.name(), provenance, content));
        }
        return new ConfigSnapshot(fragments, layouts, assets, diagnostics);
    }

    private static JsonNode parseObject(Contribution contribution, byte[] bytes, List<Diagnostic> diagnostics) {
        JsonNode content;
        try {
            content = JSON.readTree(bytes);
        } catch (IOException e) {
            diagnostics.add(Diagnostic.error("invalid-json", contribution.scope(), contribution.provenance(),
                    String.format("%s is not valid JSON: %s", contribution.key(),
                            e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage().lines()
                                                                                        .findFirst()
                                                                                        .orElse(""))));
            return null;
        }
        if (content == null || !content.isObject()) {
            diagnostics.add(Diagnostic.error("not-an-object", contribution.scope(), contribution.provenance(),
                    String.format("%s must be a JSON object.", contribution.key())));
            return null;
        }
        return content;
    }

    static String contentType(String assetName) {
        String extension = assetName.substring(assetName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return switch (extension) {
            case "svg" -> "image/svg+xml";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "ico" -> "image/x-icon";
            default -> throw new IllegalArgumentException("not an accepted asset type: " + assetName);
        };
    }
}
