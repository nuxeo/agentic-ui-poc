package org.nuxeo.agentic.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class AgenticUiConfigServletTest {

    @ParameterizedTest
    @ValueSource(strings = { "OPTIONS", "TRACE", "POST", "PUT", "DELETE", "PATCH" })
    void everyMethodButGetAndHeadIsRefused(String method) throws Exception {
        HttpServletRequest request = (HttpServletRequest) Proxy.newProxyInstance(
                HttpServletRequest.class.getClassLoader(), new Class<?>[] { HttpServletRequest.class },
                (proxy, m, args) -> switch (m.getName()) {
                case "getMethod" -> method;
                default -> throw new UnsupportedOperationException(m.getName());
                });
        Map<String, Object> recorded = new HashMap<>();
        HttpServletResponse response = (HttpServletResponse) Proxy.newProxyInstance(
                HttpServletResponse.class.getClassLoader(), new Class<?>[] { HttpServletResponse.class },
                (proxy, m, args) -> {
                    switch (m.getName()) {
                    case "setStatus" -> recorded.put("status", args[0]);
                    case "setHeader" -> recorded.put((String) args[0], args[1]);
                    case "setContentLength" -> recorded.put("length", args[0]);
                    default -> throw new UnsupportedOperationException(m.getName());
                    }
                    return null;
                });

        new AgenticUiConfigServlet().service(request, response);

        assertEquals(HttpServletResponse.SC_METHOD_NOT_ALLOWED, recorded.get("status"));
        assertEquals("GET, HEAD", recorded.get("Allow"));
        assertEquals(0, recorded.get("length"));
    }
}
