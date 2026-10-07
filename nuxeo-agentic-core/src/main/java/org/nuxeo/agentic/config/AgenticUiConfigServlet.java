package org.nuxeo.agentic.config;

import java.io.IOException;
import java.util.Map;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.nuxeo.runtime.api.Framework;

/**
 * Serves the packaged UI configuration at {@code /nuxeo/agentic-ui-config/}.
 *
 * Anonymous on purpose: the application reads its configuration before the user signs in, so no
 * authentication filter is mapped on this path. That is why nothing sensitive may be contributed —
 * everything a package puts in a fragment is public. The servlet reads only what packages
 * contributed; it touches neither the repository nor the server's filesystem.
 *
 * GET and HEAD only: every other method, OPTIONS and TRACE included, is answered 405.
 */
public class AgenticUiConfigServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    static final String ALLOWED_METHODS = "GET, HEAD";

    private transient volatile ConfigEndpoint endpoint;

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String method = request.getMethod();
        if ("GET".equals(method)) {
            serve(request, response, true);
        } else if ("HEAD".equals(method)) {
            serve(request, response, false);
        } else {
            response.setHeader("Allow", ALLOWED_METHODS);
            response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            response.setContentLength(0);
        }
    }

    private void serve(HttpServletRequest request, HttpServletResponse response, boolean withBody)
            throws IOException {
        ConfigEndpoint.Response answer = endpoint().respond(request.getPathInfo(), request.getHeader("If-None-Match"));
        response.setStatus(answer.status());
        for (Map.Entry<String, String> header : answer.headers().entrySet()) {
            if ("Content-Type".equals(header.getKey())) {
                response.setContentType(header.getValue());
            } else {
                response.setHeader(header.getKey(), header.getValue());
            }
        }
        response.setContentLength(answer.body().length);
        if (withBody && answer.body().length > 0) {
            response.getOutputStream().write(answer.body());
        }
    }

    /** Rendered once per snapshot, so bodies and ETags change only when the snapshot does. */
    private ConfigEndpoint endpoint() {
        ConfigSnapshot snapshot = Framework.getService(AgenticUiConfigService.class).getSnapshot();
        ConfigEndpoint current = endpoint;
        if (current == null || current.snapshot() != snapshot) {
            synchronized (this) {
                current = endpoint;
                if (current == null || current.snapshot() != snapshot) {
                    current = new ConfigEndpoint(snapshot);
                    endpoint = current;
                }
            }
        }
        return current;
    }
}
