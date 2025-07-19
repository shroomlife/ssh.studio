### Building Stage
FROM oven/bun:1.2.18-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

ENV NODE_ENV=production
ENV NUXT_PUBLIC_ENVIRONMENT=production

RUN bun run build

### Production Dependencies Stage
FROM oven/bun:1.2.18-alpine AS prod-deps

WORKDIR /app
COPY package.json ./
COPY --from=builder /app/bun.lock ./bun.lock

RUN bun install --production --ignore-scripts

### Runtime Stage
FROM oven/bun:1.2.18-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_PUBLIC_ENVIRONMENT=production

COPY --from=builder /app/.output ./.output
COPY --from=prod-deps /app/bun.lock ./bun.lock
COPY --from=prod-deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
