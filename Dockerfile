FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install tini for better signal handling
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone build
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

# Copy configuration files
COPY --chown=nextjs:nodejs newrelic.cjs ./
COPY --chown=nextjs:nodejs .env ./

# Install New Relic (cleaner & more reliable than the temp folder method)
RUN npm install --omit=dev --no-audit --no-fund newrelic

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

# Load .env variables then start the app with New Relic
# CMD ["sh", "-c", "set -a && . ./.env && node -r newrelic server.js"]
CMD ["node", "server.js"]