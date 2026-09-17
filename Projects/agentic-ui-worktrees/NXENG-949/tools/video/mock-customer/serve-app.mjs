/**
 * Serve a built Angular bundle **and** proxy `/nuxeo` to the Nuxeo server.
 *
 * ## Why the recording cannot use a plain static server
 *
 * `record.mjs`'s `serve()` is `http-server`, which has no proxy. The stock Nuxeo
 * Docker image sends **no CORS headers** — verified with
 * `curl -H 'Origin: http://127.0.0.1:4411' …`, which came back 200 with no
 * `Access-Control-Allow-Origin` — so a bundle served from another port cannot
 * call it from the browser at all, whatever Layer 0's `nuxeoApiOrigin` says.
 * Setting that key to `http://localhost:8080` would make every request fail in
 * the browser while succeeding in `curl`, which is exactly the kind of
 * self-confirming setup this programme has been bitten by.
 *
 * So the recording is served the same way a real deployment is: one origin, with
 * Nuxeo behind the same host. That also means the video shows the deployment
 * topology customers actually use (Angular served by Nuxeo's Tomcat, or by a
 * reverse proxy in front of it) rather than a development convenience.
 *
 * ## Deliberately not a dev server
 *
 * It serves the **built bundle from disk**, so editing `bootstrap.json` in the
 * served directory and reloading proves the "no rebuild" claim: nothing is
 * watching, nothing recompiles, the JavaScript bytes are byte-identical between
 * the two frames.
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * @param {object} options
 * @param {string} options.root  directory holding `index.html`
 * @param {number} options.port
 * @param {string} [options.nuxeo] origin of the Nuxeo server
 */
export async function serveAppWithNuxeoProxy({ root, port, nuxeo = 'http://localhost:8080' }) {
  const base = resolve(root);
  if (!existsSync(join(base, 'index.html'))) {
    throw new Error(`${base} has no index.html — build the app first`);
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);

    if (url.pathname === '/nuxeo' || url.pathname.startsWith('/nuxeo/')) {
      proxy(req, res, `${nuxeo}${url.pathname}${url.search}`);
      return;
    }

    // A path that escapes the root would serve the whole filesystem. The
    // recording runs on a developer machine, which is exactly where that matters.
    const relative = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(base, relative);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    // Unknown paths fall through to `index.html`: the router owns them, and a
    // 404 here would break a deep link like `/documents/<uid>` on reload.
    if (!file.startsWith(base) || !existsSync(file)) file = join(base, 'index.html');

    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      // No caching, or the second half of the rebrand demonstration would serve
      // the first half's `bootstrap.json` out of memory and prove nothing.
      'Cache-Control': 'no-store',
    });
    createReadStream(file).pipe(res);
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, '127.0.0.1', resolveListen);
  });

  return {
    url: `http://127.0.0.1:${port}`,
    stop: () => server.close(),
  };
}

/**
 * Forward one request to Nuxeo, headers and body both ways.
 *
 * `Authorization` is forwarded verbatim — that is the whole point, since the
 * application authenticates with Basic and the browser only ever talks to this
 * origin. `host` is dropped so Nuxeo's own URL rewriting does not point at the
 * proxy's port.
 */
function proxy(req, res, target) {
  const headers = { ...req.headers };
  delete headers['host'];
  delete headers['connection'];
  // Nuxeo returns 404 for a path with a `//` after rewriting; keep it verbatim.
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    fetch(target, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
      redirect: 'manual',
    })
      .then(async (upstream) => {
        const responseHeaders = {};
        upstream.headers.forEach((value, key) => {
          // Let Node set the framing headers for the body it is about to write.
          if (key === 'content-encoding' || key === 'content-length' || key === 'transfer-encoding')
            return;
          responseHeaders[key] = value;
        });
        res.writeHead(upstream.status, responseHeaders);
        res.end(Buffer.from(await upstream.arrayBuffer()));
      })
      .catch((error) => {
        res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`proxy to Nuxeo failed: ${error.message}`);
      });
  });
}
