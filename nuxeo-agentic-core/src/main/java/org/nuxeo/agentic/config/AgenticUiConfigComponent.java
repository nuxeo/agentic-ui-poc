package org.nuxeo.agentic.config;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.nuxeo.runtime.model.ComponentContext;
import org.nuxeo.runtime.model.ComponentInstance;
import org.nuxeo.runtime.model.DefaultComponent;
import org.nuxeo.runtime.model.RuntimeContext;

/**
 * Collects the configuration packages contribute and builds the snapshot the servlet serves.
 *
 * Registration order is dependency order — Nuxeo registers a component's contributions after those
 * of every component it {@code <require>}s — and the registry keeps it. The snapshot is built in
 * {@link #start}, once every contribution is in, and rebuilt only if contributions change after
 * that, which outside a dev-mode hot reload they do not.
 */
public class AgenticUiConfigComponent extends DefaultComponent implements AgenticUiConfigService {

    private static final Logger log = LogManager.getLogger(AgenticUiConfigComponent.class);

    static final String XP_CONFIGURATION = "configuration";

    private final ContributionRegistry registry = new ContributionRegistry();

    private volatile ConfigSnapshot snapshot;

    @Override
    public void registerContribution(Object contribution, String extensionPoint, ComponentInstance contributor) {
        if (!XP_CONFIGURATION.equals(extensionPoint)) {
            log.warn("Unknown extension point: {}", extensionPoint);
            return;
        }
        String component = contributor.getName().getName();
        RuntimeContext context = contributor.getContext();
        String bundle = context.getBundle() == null ? component : context.getBundle().getSymbolicName();
        Contribution entry;
        if (contribution instanceof FragmentDescriptor fragment) {
            entry = Contribution.fragment(fragment.getLayer(), fragment.getName(), fragment.isEnabled(),
                    new Provenance(component, bundle, source(fragment.getSrc())),
                    content(context, fragment.getSrc(), fragment.getJson()), fragment);
        } else if (contribution instanceof LayoutDescriptor layout) {
            entry = Contribution.layout(layout.getType(), layout.getMode(), layout.isEnabled(),
                    new Provenance(component, bundle, source(layout.getSrc())),
                    content(context, layout.getSrc(), layout.getJson()), layout);
        } else if (contribution instanceof AssetDescriptor asset) {
            entry = Contribution.asset(asset.getName(), asset.isEnabled(),
                    new Provenance(component, bundle, source(asset.getSrc())),
                    content(context, asset.getSrc(), null), asset);
        } else {
            log.warn("Unknown contribution to {}: {}", XP_CONFIGURATION, contribution);
            return;
        }
        // The same lock as the build: a hot reload must not interleave with one, or the build
        // would publish a snapshot of contributions that have since changed.
        synchronized (this) {
            registry.add(entry);
            snapshot = null;
        }
    }

    @Override
    public void unregisterContribution(Object contribution, String extensionPoint, ComponentInstance contributor) {
        synchronized (this) {
            if (registry.remove(contribution)) {
                snapshot = null;
            }
        }
    }

    @Override
    public void start(ComponentContext context) {
        getSnapshot();
    }

    @Override
    public void stop(ComponentContext context) {
        snapshot = null;
    }

    @Override
    public ConfigSnapshot getSnapshot() {
        ConfigSnapshot current = snapshot;
        if (current == null) {
            synchronized (this) {
                current = snapshot;
                if (current == null) {
                    current = ConfigSnapshot.build(registry.resolve());
                    report(current);
                    snapshot = current;
                }
            }
        }
        return current;
    }

    private static void report(ConfigSnapshot snapshot) {
        for (Diagnostic diagnostic : snapshot.diagnostics()) {
            switch (diagnostic.level()) {
            case ERROR -> log.error("Agentic UI configuration: {}", diagnostic.message());
            case WARNING -> log.warn("Agentic UI configuration: {}", diagnostic.message());
            default -> log.info("Agentic UI configuration: {}", diagnostic.message());
            }
        }
    }

    private static String source(String src) {
        return src != null && !src.isBlank() ? src : Provenance.INLINE;
    }

    /**
     * The body of a contribution, read when the snapshot is built: from the contributing bundle for
     * {@code src}, which is where the package that declared it ships it, or the inline JSON.
     */
    private static Contribution.Content content(RuntimeContext context, String src, String json) {
        boolean hasSrc = src != null && !src.isBlank();
        boolean hasJson = json != null && !json.isBlank();
        if (hasSrc && hasJson) {
            return () -> {
                throw new IOException("it has both a src and inline JSON; use one");
            };
        }
        if (hasJson) {
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            return () -> bytes;
        }
        if (!hasSrc) {
            return null;
        }
        return () -> {
            URL url = context.getLocalResource(src);
            if (url == null) {
                throw new FileNotFoundException(src + " is not in the contributing bundle");
            }
            try (InputStream in = url.openStream()) {
                return in.readNBytes(ConfigSnapshot.MAX_ASSET_BYTES + 1);
            }
        };
    }
}
