/*
 * Licensed under the Apache License, Version 2.0
 */
package org.nuxeo.agentic.url.codec;

import org.nuxeo.ecm.core.api.DocumentLocation;
import org.nuxeo.ecm.core.api.IdRef;
import org.nuxeo.ecm.core.api.impl.DocumentLocationImpl;
import org.nuxeo.ecm.platform.url.DocumentViewImpl;
import org.nuxeo.ecm.platform.url.api.DocumentView;
import org.nuxeo.ecm.platform.url.service.AbstractDocumentViewCodec;
import org.nuxeo.runtime.api.Framework;

/**
 * Builds document links for permission notification emails that open the Agentic UI.
 *
 * <p>Registers as {@code notificationDocId} with priority 2000 so it overrides the Classic Web UI
 * codec ({@code ui/#!/doc/{uid}}, priority 100).
 *
 * <p>When {@code nuxeo.agentic.ui.url} is set (e.g. {@code http://localhost:4200} for {@code ng serve}),
 * returns {@code #/doc/{uid}} so notification {@code serverPrefix} (from {@code nuxeo.agentic.ui.url}) builds
 * the full Agentic UI link. Otherwise returns {@code agentic-ui/#/doc/{uid}} under {@code nuxeo.url}.
 */
public class AgenticNotificationDocumentIdCodec extends AbstractDocumentViewCodec {

    /** Optional full Agentic UI origin for notification links (local dev: {@code http://localhost:4200}). */
    public static final String AGENTIC_UI_URL_PROPERTY = "nuxeo.agentic.ui.url";

    static final String AGENTIC_UI_PATH = "agentic-ui";

    static final String DOC_ROUTE = "#/doc";

    @Override
    public String getUrlFromDocumentView(DocumentView docView) {
        DocumentLocation docLoc = docView.getDocumentLocation();
        if (docLoc == null) {
            return null;
        }
        IdRef docRef = docLoc.getIdRef();
        if (docRef == null) {
            return null;
        }
        String uid = docRef.toString();
        String overrideBase = Framework.getProperty(AGENTIC_UI_URL_PROPERTY);
        if (overrideBase != null && !overrideBase.isBlank()) {
            return DOC_ROUTE + "/" + uid;
        }
        return String.join("/", AGENTIC_UI_PATH, DOC_ROUTE, uid);
    }

    @Override
    public DocumentView getDocumentViewFromUrl(String url) {
        String path = url;
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        String expectedPrefix = AGENTIC_UI_PATH + "/" + DOC_ROUTE + "/";
        if (!path.startsWith(expectedPrefix)) {
            return null;
        }
        String uid = path.substring(expectedPrefix.length());
        int queryIndex = uid.indexOf('?');
        if (queryIndex >= 0) {
            uid = uid.substring(0, queryIndex);
        }
        if (uid.isBlank()) {
            return null;
        }
        return new DocumentViewImpl(new DocumentLocationImpl(null, new IdRef(uid)));
    }
}
