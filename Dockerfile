FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install tini for better signal handling
RUN apk add --no-cache tini

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy pre-built standalone application from pipeline artifacts
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs newrelic.cjs ./

# The standalone bundle does not include modules loaded only via `node -r`.
RUN mkdir -p /tmp/newrelic-install \
  && cd /tmp/newrelic-install \
  && npm init -y >/dev/null 2>&1 \
  && NEW_RELIC_VERSION=$(node -p 'require("/app/package.json").dependencies.newrelic') \
  && npm install --omit=dev --no-audit --no-fund --package-lock=false "newrelic@${NEW_RELIC_VERSION}" \
  && mkdir -p /app/node_modules \
  && cp -R node_modules/. /app/node_modules/ \
  && rm -rf /tmp/newrelic-install

# Copy environment file
COPY --chown=nextjs:nodejs .env ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use tini and server.js created by Next.js standalone build
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "-r", "newrelic", "server.js"]
# CMD ["node", "server.js"]
