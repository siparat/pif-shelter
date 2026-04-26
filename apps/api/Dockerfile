FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./
COPY libs ./libs
COPY apps/api ./apps/api
COPY nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile
RUN pnpm nx build api --prod

FROM node:24-alpine
WORKDIR /opt/app
RUN pnpm install --frozen-lockfile --prod
RUN apk add --no-cache curl
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /opt/app/dist /opt/app/dist
COPY --from=builder /opt/app/package.json /opt/app/pnpm-lock.yaml ./
CMD ["node", "dist/apps/api/main.js"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD curl -f http://localhost:3000/health || exit 1
