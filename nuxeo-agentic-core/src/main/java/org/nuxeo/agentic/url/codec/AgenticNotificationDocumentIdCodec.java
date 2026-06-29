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

/**
 * Builds document links for permission notification emails that open the Agentic UI.
 *
 * <p>Partial URL format: {@code agentic-ui/#/doc/{uid}} (appended to {@code nuxeo.url}).
 */
public class AgenticNotificationDocumentIdCodec extends AbstractDocumentViewCodec {

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
        return String.join("/", AGENTIC_UI_PATH, DOC_ROUTE, docRef.toString());
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
