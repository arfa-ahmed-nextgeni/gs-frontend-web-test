const fs = require("fs");
const path = require("path");

const serverFile = path.join(process.cwd(), ".next/standalone/server.js");

if (!fs.existsSync(serverFile)) {
  throw new Error(`Standalone server file not found: ${serverFile}`);
}

let content = fs.readFileSync(serverFile, "utf8");
let didPatch = false;

const envLoaderPatch = `const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd(), false)
`;

const timeoutPatch = `const http = require('node:http')
const originalCreateServer = http.createServer
http.createServer = function (...args) {
  const [originalHandler, ...rest] = args

  // Wrap the original Next.js request handler
  const patchedHandler = (req, res) => {
    if (req.url === '/__internal/server-info' && req.method === 'GET') {
      const info = {
        keepAliveTimeout: server.keepAliveTimeout,
        headersTimeout:   server.headersTimeout,
        env: {
          KEEP_ALIVE_TIMEOUT:    process.env.KEEP_ALIVE_TIMEOUT ?? 'not set',
          NODE_HEADERS_TIMEOUT:  process.env.NODE_HEADERS_TIMEOUT ?? 'not set',
        },
        node_version:    process.version,
        uptime_seconds:  process.uptime(),
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(info, null, 2))
      return
    }

    // All other requests go to Next.js normally
    originalHandler(req, res)
  }

  const server = originalCreateServer.apply(this, [patchedHandler, ...rest])

  // --- keepAliveTimeout ---
  let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10)
  if (!Number.isFinite(keepAliveTimeout) || keepAliveTimeout < 0) {
    keepAliveTimeout = undefined
  }
  if (keepAliveTimeout !== undefined) {
    server.keepAliveTimeout = keepAliveTimeout
  }

  // --- headersTimeout ---
  let headersTimeout = parseInt(process.env.NODE_HEADERS_TIMEOUT, 10)
  if (!Number.isFinite(headersTimeout) || headersTimeout < 0) {
    headersTimeout = undefined
  }
  if (headersTimeout !== undefined) {
    server.headersTimeout = headersTimeout
  }

  // Guard: headersTimeout must exceed keepAliveTimeout
  if (server.headersTimeout <= server.keepAliveTimeout) {
    server.headersTimeout = server.keepAliveTimeout + 1000
    console.warn('[http-patch] headersTimeout auto-corrected to', server.headersTimeout)
  }

  console.log('[http-patch] applied — keepAliveTimeout=', server.keepAliveTimeout, 'headersTimeout=', server.headersTimeout)

  return server
}

`;

const envLoaderTarget = "process.chdir(__dirname)";
const timeoutPatchTarget = "require('next')";

if (!content.includes("loadEnvConfig(process.cwd(), false)")) {
  if (!content.includes(envLoaderTarget)) {
    throw new Error(`Could not find env loader target: ${envLoaderTarget}`);
  }

  content = content.replace(
    envLoaderTarget,
    `${envLoaderTarget}\n\n${envLoaderPatch.trimEnd()}`
  );
  didPatch = true;
}

if (!content.includes("server.headersTimeout")) {
  if (!content.includes(timeoutPatchTarget)) {
    throw new Error(
      `Could not find timeout patch target: ${timeoutPatchTarget}`
    );
  }

  content = content.replace(
    timeoutPatchTarget,
    timeoutPatch + timeoutPatchTarget
  );
  didPatch = true;
}

if (!didPatch) {
  console.log("Standalone server patch already exists");
  process.exit(0);
}

fs.writeFileSync(serverFile, content, "utf8");
console.log("Patched .next/standalone/server.js");
