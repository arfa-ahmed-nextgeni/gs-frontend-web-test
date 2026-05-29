FROM node:24-alpine AS runner

WORKDIR /app

ARG PORT=3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV PORT=${PORT}
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache tini
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs newrelic.cjs ./
COPY --chown=nextjs:nodejs .env ./

# Install newrelic with full dep tree (tracer can't resolve runtime --require deps)
RUN npm install --omit=dev --no-audit --no-fund newrelic

USER nextjs

EXPOSE ${PORT}

ENTRYPOINT ["/sbin/tini", "--"]

# exec replaces sh with node so SIGTERM from k8s reaches node directly
CMD ["sh", "-c", "set -a && . ./.env && exec node --require newrelic server.js"]
