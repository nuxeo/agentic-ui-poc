package org.nuxeo.agentic.config;

import org.nuxeo.common.xmap.annotation.XNode;
import org.nuxeo.common.xmap.annotation.XObject;

/**
 * One JSON fragment of the UI configuration, contributed by a package.
 *
 * <pre>
 * &lt;fragment name="acme" layer="bootstrap" src="agentic-ui-config/bootstrap.json"/&gt;
 * &lt;fragment name="acme-labels" layer="manifest"&gt;&lt;json&gt;{ "labels": { ... } }&lt;/json&gt;&lt;/fragment&gt;
 * </pre>
 *
 * {@code src} is read from the contributing bundle; the {@code json} child is the inline form,
 * which is what Nuxeo Studio can contribute. A later fragment with the same name and layer replaces
 * an earlier one in place, and {@code enabled="false"} removes it.
 */
@XObject("fragment")
public class FragmentDescriptor {

    @XNode("@name")
    protected String name;

    @XNode("@layer")
    protected String layer;

    @XNode("@src")
    protected String src;

    @XNode("@enabled")
    protected boolean enabled = true;

    @XNode("json")
    protected String json;

    public String getName() {
        return name;
    }

    public String getLayer() {
        return layer;
    }

    public String getSrc() {
        return src;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getJson() {
        return json;
    }
}
