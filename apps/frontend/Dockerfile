FROM node:18-alpine AS base

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm install -g turbo
RUN turbo prune --scope=frontend --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN npx turbo run build --filter=frontend...

FROM base AS runner
WORKDIR /app

COPY --from=installer /app .

CMD ["node", "apps/frontend/.next/standalone/server.js"]
