FROM node:24-alpine
WORKDIR /opt/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./
COPY libs ./libs
COPY apps ./apps
RUN pnpm install --frozen-lockfile
CMD ["pnpm", "nx", "run", "database:migrate"]