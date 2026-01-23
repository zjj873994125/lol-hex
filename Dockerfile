# ──────────────────────────────────────────────
# ① 前端构建阶段
# ──────────────────────────────────────────────
FROM node:18-alpine AS client-build
WORKDIR /app/client

# 安装 pnpm 并安装完整依赖（构建需 devDeps）
COPY client/package.json client/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@8 --activate \
    && pnpm install --frozen-lockfile

# 拷贝源码并执行打包，输出 dist/
COPY client .
RUN pnpm run build

# ──────────────────────────────────────────────
# ② 后端构建阶段
# ──────────────────────────────────────────────
FROM node:18-alpine AS server-build
WORKDIR /app/server

COPY server/package.json server/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@8 --activate \
    && pnpm install --frozen-lockfile          # 保留 devDeps 以运行 tsc

COPY server .
RUN pnpm run build                             # → dist/

# ──────────────────────────────────────────────
# ③ 运行阶段（最终镜像）
# ──────────────────────────────────────────────
FROM node:18-alpine
WORKDIR /app

# ── 后端运行文件 ──────────────────────────────
COPY --from=server-build /app/server/dist ./server
COPY --from=server-build /app/server/package.json /app/server/pnpm-lock.yaml ./server/

WORKDIR /app/server
RUN corepack enable && corepack prepare pnpm@8 --activate \
    && pnpm install --prod --frozen-lockfile   # 仅装生产依赖

# ── 前端静态文件 ──────────────────────────────
COPY --from=client-build /app/client/dist /usr/share/nginx/html

# ── 安装并配置 Nginx ──────────────────────────
RUN apk add --no-cache nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# ── 暴露端口&启动 ─────────────────────────────
EXPOSE 80 8899
CMD sh -c "node app.js & nginx -g 'daemon off;'"