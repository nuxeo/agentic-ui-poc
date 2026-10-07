package org.nuxeo.agentic.config;

import org.nuxeo.common.xmap.annotation.XNode;
import org.nuxeo.common.xmap.annotation.XObject;

/**
 * A per-type layout file, stored and served for the client to render.
 *
 * <pre>
 * &lt;layout type="Contract" mode="view" src="agentic-ui-config/layouts/Contract/view.layout.json"/&gt;
 * </pre>
 *
 * Layout files are replaced whole, never merged: a later contribution for the same type and mode
 * wins outright, and {@code enabled="false"} removes the one in force.
 */
@XObject("layout")
public class LayoutDescriptor {

    @XNode("@type")
    protected String type;

    @XNode("@mode")
    protected String mode;

    @XNode("@src")
    protected String src;

    @XNode("@enabled")
    protected boolean enabled = true;

    @XNode("json")
    protected String json;

    public String getType() {
        return type;
    }

    public String getMode() {
        return mode;
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
