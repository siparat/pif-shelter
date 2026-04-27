FROM node:24-alpine AS build
WORKDIR /opt/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY nx.json tsconfig.base.json ./
COPY libs ./libs
COPY apps/admin ./apps/admin
COPY envs/.admin.env /opt/app/.env.local
RUN pnpm nx build admin --prod

FROM nginx:stable-alpine
COPY --from=build /opt/app/dist/apps/admin /usr/share/nginx/html
COPY --from=build /opt/app/apps/admin/nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80