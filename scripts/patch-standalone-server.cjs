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
  const server = originalCreateServer.apply(this, args)

  let headersTimeout = parseInt(process.env.NODE_HEADERS_TIMEOUT, 10)

  if (
    Number.isNaN(headersTimeout) ||
    !Number.isFinite(headersTimeout) ||
    headersTimeout < 0
  ) {
    headersTimeout = undefined
  }

  if (headersTimeout !== undefined) {
    server.headersTimeout = headersTimeout
  }

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
