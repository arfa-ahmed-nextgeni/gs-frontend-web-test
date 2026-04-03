import crypto from "crypto";

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

console.info("=== Webhook Secrets for .env.local ===\n");
console.info(`WEBHOOK_SECRET=${generateSecret(32)}`);
console.info(`WEBHOOK_TOKEN=${generateSecret(32)}`);

console.info("\n=== Copy these to your .env.local file ===");
console.info("WEBHOOK_SECRET is used in X-Webhook-Secret header");
console.info("WEBHOOK_TOKEN is used as Bearer token fallback");
