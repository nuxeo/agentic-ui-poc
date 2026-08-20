# Agent gateway container image.
#
# Built from the repository root so the Nx workspace and the lockfile are in
# context:
#   docker build -f apps/agent-gateway/Dockerfile -t nuxeo/agent-gateway:dev .
#
# Configured entirely by environment variables — see apps/agent-gateway/README.md.
# There is deliberately no Nuxeo credential to pass in; the container refuses to
# start if one is present.

FROM node:20-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY nx.json tsconfig.base.json ./
COPY apps/agent-gateway ./apps/agent-gateway
RUN npx nx build agent-gateway

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /workspace/dist/apps/agent-gateway ./

# Never run the runtime as root.
USER node
EXPOSE 3100

# The orchestrator liveness probe from ADR 001.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3100)+'/agent/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "main.js"]
