FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./
COPY libs ./libs
COPY apps ./apps
COPY nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile
RUN pnpm nx build api --prod

FROM node:24-alpine
WORKDIR /opt/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /opt/app/dist /opt/app/dist
COPY --from=builder /opt/app/package.json /opt/app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
CMD ["node", "dist/apps/api/main.js"]
EXPOSE 3000
