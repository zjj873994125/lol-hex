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
# ② 运行阶段（最终镜像）
# ──────────────────────────────────────────────
FROM node:18-alpine
WORKDIR /app

# ── 后端文件（纯 JS，无需编译）──────────────────
COPY server/package.json /app/server/
WORKDIR /app/server
RUN corepack enable && corepack prepare pnpm@8 --activate \
    && pnpm install --prod

COPY server/src /app/server/src

# ── 前端静态文件 ──────────────────────────────
COPY --from=client-build /app/client/dist /usr/share/nginx/html

# ── 安装并配置 Nginx ──────────────────────────
RUN apk add --no-cache nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# ── 暴露端口&启动 ─────────────────────────────
EXPOSE 80 8899
CMD sh -c "node src/app.js & nginx -g 'daemon off;'"