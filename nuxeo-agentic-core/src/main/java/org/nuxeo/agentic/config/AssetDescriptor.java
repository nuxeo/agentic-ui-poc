package org.nuxeo.agentic.config;

import org.nuxeo.common.xmap.annotation.XNode;
import org.nuxeo.common.xmap.annotation.XObject;

/**
 * A static image served beside the configuration, so a package can ship the logo its bootstrap
 * fragment names.
 *
 * <pre>
 * &lt;asset name="acme-logo.svg" src="agentic-ui-config/assets/acme-logo.svg"/&gt;
 * </pre>
 *
 * Served at {@code /nuxeo/agentic-ui-config/assets/<name>}, so a bootstrap fragment refers to it as
 * {@code "logo": { "src": "assets/acme-logo.svg" }} — a path relative to {@code bootstrap.json}.
 */
@XObject("asset")
public class AssetDescriptor {

    @XNode("@name")
    protected String name;

    @XNode("@src")
    protected String src;

    @XNode("@enabled")
    protected boolean enabled = true;

    public String getName() {
        return name;
    }

    public String getSrc() {
        return src;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
