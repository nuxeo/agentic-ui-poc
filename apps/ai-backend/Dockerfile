# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all deps (including dev for tsc)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and tsconfig
COPY apps/ai-backend ./apps/ai-backend
COPY tsconfig.base.json ./

# Compile TypeScript — output goes to dist/ai-backend/
RUN npx tsc -p apps/ai-backend/tsconfig.json

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output from builder
COPY --from=builder /app/dist/ai-backend ./dist/ai-backend

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/ai-backend/main.js"]
