FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter common build
RUN pnpm --filter node build

# Stage 2: Production runtime
FROM node:24-alpine AS runner

WORKDIR /

# Copy only built assets and necessary files
COPY --from=builder /build/packages/node/dist ./dist

RUN rm -rf /app

# Run the production server
CMD ["node", "dist/index.js"]
