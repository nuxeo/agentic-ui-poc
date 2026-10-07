package org.nuxeo.agentic.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Proxy;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.nuxeo.runtime.model.ComponentInstance;
import org.nuxeo.runtime.model.ComponentName;
import org.nuxeo.runtime.model.RuntimeContext;

class AgenticUiConfigComponentTest {

    /** A contributor whose bundle holds one resource, which blocks until {@code release} opens. */
    private static ComponentInstance contributor(String name, URL resource, CountDownLatch reading,
            CountDownLatch release) {
        RuntimeContext context = (RuntimeContext) Proxy.newProxyInstance(RuntimeContext.class.getClassLoader(),
                new Class<?>[] { RuntimeContext.class }, (proxy, method, args) -> switch (method.getName()) {
                case "getLocalResource" -> {
                    reading.countDown();
                    assertTrue(release.await(10, TimeUnit.SECONDS));
                    yield resource;
                }
                case "getBundle" -> null;
                default -> throw new UnsupportedOperationException(method.getName());
                });
        return (ComponentInstance) Proxy.newProxyInstance(ComponentInstance.class.getClassLoader(),
                new Class<?>[] { ComponentInstance.class }, (proxy, method, args) -> switch (method.getName()) {
                case "getName" -> new ComponentName(name);
                case "getContext" -> context;
                default -> throw new UnsupportedOperationException(method.getName());
                });
    }

    private static FragmentDescriptor fragment(String name, String src, String json) {
        FragmentDescriptor fragment = new FragmentDescriptor();
        fragment.name = name;
        fragment.layer = ConfigScope.BOOTSTRAP;
        fragment.src = src;
        fragment.json = json;
        return fragment;
    }

    @Test
    void aContributionRegisteredDuringABuildIsInTheNextSnapshot(@TempDir Path dir) throws Exception {
        Path file = dir.resolve("ours.json");
        Files.writeString(file, "{\"branding\":{\"applicationTitle\":\"Hyland Nuxeo\"}}");
        CountDownLatch reading = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        AgenticUiConfigComponent component = new AgenticUiConfigComponent();
        component.registerContribution(fragment("defaults", "ours.json", null), AgenticUiConfigComponent.XP_CONFIGURATION,
                contributor("ours", file.toUri().toURL(), reading, release));

        Thread build = new Thread(component::getSnapshot);
        build.start();
        assertTrue(reading.await(10, TimeUnit.SECONDS), "the build never read the fragment");
        Thread reload = new Thread(() -> component.registerContribution(fragment("acme", null, "{}"),
                AgenticUiConfigComponent.XP_CONFIGURATION, contributor("acme", null, new CountDownLatch(1),
                        new CountDownLatch(0))));
        reload.start();
        reload.join(200);
        release.countDown();
        build.join(10_000);
        reload.join(10_000);

        List<String> names = component.getSnapshot()
                                      .fragments(ConfigScope.BOOTSTRAP)
                                      .stream()
                                      .map(ConfigSnapshot.Fragment::name)
                                      .toList();
        assertEquals(List.of("defaults", "acme"), names);
    }
}
