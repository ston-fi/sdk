FROM node:20-alpine AS base

FROM base AS pnpm-base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install turbo --global


FROM pnpm-base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

COPY . .

ENV TURBO_TELEMETRY_DISABLED=1
RUN turbo prune @ston-fi/sdk-example-next-js-app --docker


FROM pnpm-base AS installer

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Enable pnpm and install deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json ./turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_API
# ENV TURBO_API=$TURBO_API

# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

ENV TURBO_TELEMETRY_DISABLED=1
RUN turbo build --filter=@ston-fi/sdk-example-next-js-app


FROM base AS runner

# dumb-init registers signal handlers for every signal that can be caught
RUN apk update && apk add --no-cache dumb-init

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
USER app

COPY --from=installer --chown=app:nodejs /app/examples/next-js-app/next.config.mjs .
COPY --from=installer --chown=app:nodejs /app/examples/next-js-app/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=app:nodejs /app/examples/next-js-app/.next/standalone ./
COPY --from=installer --chown=app:nodejs /app/examples/next-js-app/.next/static ./examples/next-js-app/.next/static
COPY --from=installer --chown=app:nodejs /app/examples/next-js-app/public ./examples/next-js-app/public

ARG PORT=8080
ENV NODE_ENV=production

EXPOSE ${PORT}

ENTRYPOINT ["dumb-init"]

CMD ["node", "--enable-source-maps", "./examples/next-js-app/server.js", "--port", "${PORT}"]
