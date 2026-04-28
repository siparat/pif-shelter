FROM node:24-alpine AS build
WORKDIR /opt/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY nx.json tsconfig.base.json ./
COPY libs ./libs
COPY apps/web ./apps/web
COPY envs/.web.env /opt/app/.env.local
RUN pnpm nx build web --prod

FROM nginx:stable-alpine
COPY --from=build /opt/app/dist/apps/web /usr/share/nginx/html
COPY --from=build /opt/app/apps/web/nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
