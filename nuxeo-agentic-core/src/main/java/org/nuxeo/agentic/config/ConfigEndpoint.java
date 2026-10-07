package org.nuxeo.agentic.config;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Every response the configuration servlet can give, rendered once.
 *
 * Bodies and ETags are computed when this is built and never again, so the content changes only
 * with an install and a restart. {@code Cache-Control: no-cache} makes the browser revalidate on
 * every load, and the ETag turns that into a 304 when nothing changed.
 *
 * Both configuration documents are served without authentication — the application reads them
 * before the user signs in — so they hold exactly what packages contributed and nothing about the
 * user, the session or the repository's content.
 */
final class ConfigEndpoint {

    static final String FORMAT = "nuxeo-agentic-ui-config/1";

    static final String BOOTSTRAP_PATH = "/bootstrap.json";

    static final String MANIFEST_PATH = "/manifest.json";

    static final String LAYOUTS_PATH = "/layouts.json";

    static final String JSON_TYPE = "application/json; charset=utf-8";

    /** Nothing in a response may run: an SVG opened directly from our origin must not execute script. */
    static final String CONTENT_SECURITY_POLICY = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

    record Response(int status, Map<String, String> headers, byte[] body) {
    }

    private record Resource(byte[] body, String contentType, String etag) {
    }

    private static final JsonNodeFactory NODES = JsonNodeFactory.instance;

    private final ConfigSnapshot snapshot;

    private final Map<String, Resource> resources = new LinkedHashMap<>();

    ConfigEndpoint(ConfigSnapshot snapshot) {
        this.snapshot = snapshot;
        List<Diagnostic> diagnostics = snapshot.diagnostics();

        resources.put(BOOTSTRAP_PATH, json(envelope(ConfigScope.BOOTSTRAP, diagnostics, true)));
        resources.put(MANIFEST_PATH, json(envelope(ConfigScope.MANIFEST, diagnostics, false)));

        ObjectNode index = header(ConfigScope.LAYOUTS);
        ArrayNode entries = index.putArray("layouts");
        for (ConfigSnapshot.Layout layout : snapshot.layouts()) {
            String path = layoutPath(layout.type(), layout.mode());
            ObjectNode entry = entries.addObject().put("type", layout.type()).put("mode", layout.mode());
            entry.put("url", path.substring(1));
            provenance(entry, layout.provenance());

            ObjectNode body = header("layout").put("type", layout.type()).put("mode", layout.mode());
            provenance(body, layout.provenance());
            body.set("content", layout.content());
            resources.put(path, json(body));
        }
        index.set("diagnostics", diagnostics(diagnostics, ConfigScope.LAYOUTS));
        resources.put(LAYOUTS_PATH, json(index));

        for (ConfigSnapshot.Asset asset : snapshot.assets()) {
            resources.put(assetPath(asset.name()), new Resource(asset.bytes(), asset.contentType(), etag(asset.bytes())));
        }
    }

    ConfigSnapshot snapshot() {
        return snapshot;
    }

    static String layoutPath(String type, String mode) {
        return "/layouts/" + type + "/" + mode + ".layout.json";
    }

    static String assetPath(String name) {
        return "/assets/" + name;
    }

    /**
     * @param path the path below {@code /agentic-ui-config}, as the servlet container decoded it
     * @param ifNoneMatch the request's {@code If-None-Match} header, or {@code null}
     */
    Response respond(String path, String ifNoneMatch) {
        Resource resource = path == null ? null : resources.get(path);
        if (resource == null) {
            Map<String, String> headers = new LinkedHashMap<>();
            headers.put("Cache-Control", "no-cache");
            headers.put("X-Content-Type-Options", "nosniff");
            return new Response(404, headers, new byte[0]);
        }
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("ETag", resource.etag());
        headers.put("Cache-Control", "no-cache");
        headers.put("X-Content-Type-Options", "nosniff");
        headers.put("Content-Security-Policy", CONTENT_SECURITY_POLICY);
        if (matches(ifNoneMatch, resource.etag())) {
            return new Response(304, headers, new byte[0]);
        }
        headers.put("Content-Type", resource.contentType());
        return new Response(200, headers, resource.body());
    }

    /** RFC 9110 weak comparison, which is what {@code If-None-Match} uses. */
    static boolean matches(String ifNoneMatch, String etag) {
        if (ifNoneMatch == null) {
            return false;
        }
        String opaque = etag.startsWith("W/") ? etag.substring(2) : etag;
        for (String candidate : ifNoneMatch.split(",")) {
            String tag = candidate.trim();
            if (tag.equals("*")) {
                return true;
            }
            if (tag.startsWith("W/")) {
                tag = tag.substring(2);
            }
            if (tag.equals(opaque)) {
                return true;
            }
        }
        return false;
    }

    private ObjectNode envelope(String layer, List<Diagnostic> diagnostics, boolean withAssets) {
        ObjectNode envelope = header(layer);
        ArrayNode fragments = envelope.putArray("fragments");
        for (ConfigSnapshot.Fragment fragment : snapshot.fragments(layer)) {
            ObjectNode entry = fragments.addObject().put("name", fragment.name());
            provenance(entry, fragment.provenance());
            entry.set("content", fragment.content());
        }
        if (withAssets) {
            ArrayNode assets = envelope.putArray("assets");
            for (ConfigSnapshot.Asset asset : snapshot.assets()) {
                ObjectNode entry = assets.addObject().put("name", asset.name());
                entry.put("url", assetPath(asset.name()).substring(1));
                provenance(entry, asset.provenance());
            }
        }
        envelope.set("diagnostics", diagnostics(diagnostics, layer));
        return envelope;
    }

    private static ObjectNode header(String layer) {
        return NODES.objectNode().put("format", FORMAT).put("layer", layer);
    }

    private static void provenance(ObjectNode node, Provenance provenance) {
        node.put("component", provenance.component());
        node.put("bundle", provenance.bundle());
        node.put("source", provenance.source());
    }

    private static ArrayNode diagnostics(List<Diagnostic> diagnostics, String scope) {
        ArrayNode list = NODES.arrayNode();
        for (Diagnostic diagnostic : diagnostics) {
            if (!scope.equals(diagnostic.scope())) {
                continue;
            }
            ObjectNode entry = list.addObject()
                                   .put("level", diagnostic.level().label())
                                   .put("code", diagnostic.code())
                                   .put("message", diagnostic.message());
            provenance(entry, diagnostic.provenance());
        }
        return list;
    }

    private static Resource json(ObjectNode node) {
        byte[] body;
        try {
            body = ConfigSnapshot.JSON.writer(SerializationFeature.INDENT_OUTPUT)
                                      .writeValueAsString(node)
                                      .getBytes(StandardCharsets.UTF_8);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("cannot render configuration", e);
        }
        return new Resource(body, JSON_TYPE, etag(body));
    }

    static String etag(byte[] body) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(body);
            return "\"" + HexFormat.of().formatHex(digest, 0, 16) + "\"";
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
