#!/usr/bin/env bash
set -e

# 固定项目根目录（服务器 clone 路径）
PROJECT_DIR=/root/docker/lol-hex-lite/lol-hex
# 后端运行时 env 文件，已在服务器准备好
ENV_FILE=$PROJECT_DIR/server/.env

IMAGE_NAME=lol-hex
PORT_WEB=28080
PORT_API=28899

echo "Building image..."
docker build -t $IMAGE_NAME:latest "$PROJECT_DIR"

echo "Restarting container..."
docker stop $IMAGE_NAME 2>/dev/null || true
docker rm   $IMAGE_NAME 2>/dev/null || true

docker run -d \
  --name $IMAGE_NAME \
  --env-file "$ENV_FILE" \
  -p ${PORT_WEB}:80 \
  -p ${PORT_API}:8899 \
  $IMAGE_NAME:latest

echo "Deploy finished: $(date)"
echo "Frontend: http://your-server-ip:${PORT_WEB}"
echo "Backend API: http://your-server-ip:${PORT_API}"
