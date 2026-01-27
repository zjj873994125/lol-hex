#!/usr/bin/env bash

# 钉钉机器人配置
DINGTALK_WEBHOOK="https://oapi.dingtalk.com/robot/send?access_token=e15092dc6020b27c7b85db68598328663a67cdf29c628a26955b61237a874050"
DINGTALK_SECRET="SEC367d77e0fb592e242539b50e76f9d2dac9f6cfb243af71d941aa78131cfb4dfc"

# 项目配置
PROJECT_DIR=/root/docker/lol-hex-lite/lol-hex
ENV_FILE=$PROJECT_DIR/server/.env
IMAGE_NAME=lol-hex
PORT_WEB=28080
PORT_API=28899
PROJECT_NAME="海克斯大乱斗"
DEPLOYER="${DEPLOYER:-系统}"
SERVER_IP="101.42.154.80"  # 请修改为实际服务器IP

# 记录开始时间
START_TIME=$(date +%s)

# 生成钉钉签名
generate_sign() {
  local timestamp=$1
  local secret=$2
  # 使用 printf 确保换行符正确
  printf '%s\n%s' "$timestamp" "$secret" | openssl dgst -sha256 -hmac "$secret" -binary | openssl base64 | tr -d '\n'
}

# 发送钉钉通知
send_dingtalk() {
  local msg_type=$1
  local title=$2
  local content=$3
  local at_all=${4:-false}

  local timestamp=$(date +%s)000
  local sign=$(generate_sign "$timestamp" "$DINGTALK_SECRET")

  # URL 编码签名
  local sign_encoded=$(echo -n "$sign" | jq -sRr @uri)

  local url="${DINGTALK_WEBHOOK}&timestamp=${timestamp}&sign=${sign_encoded}"

  case $msg_type in
    text)
      local json="{\"msgtype\":\"text\",\"text\":{\"content\":\"${content}\"}}"
      ;;
    markdown)
      # 转义 Markdown 内容中的特殊字符
      local content_escaped=$(echo "$content" | sed 's/"/\\"/g')
      local json="{\"msgtype\":\"markdown\",\"markdown\":{\"title\":\"${title}\",\"text\":\"${content_escaped}\"}}"
      ;;
  esac

  echo "发送钉钉通知..."
  curl -s -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$json"
  echo ""
}

# 发送部署通知
send_deploy_notify() {
  local status=$1
  local error_msg=$2
  local end_time=$(date +%s)
  local duration=$((end_time - START_TIME))
  local duration_text="${duration}秒"

  if [ $duration -ge 60 ]; then
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    duration_text="${minutes}分${seconds}秒"
  fi

  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  case $status in
    start)
      local content="### 🚀 ${PROJECT_NAME} - 开始发布\n\n"
      content+="> **环境**: 生产环境\n"
      content+="> **时间**: ${timestamp}\n"
      content+="> **操作人**: ${DEPLOYER}\n"
      send_dingtalk "markdown" "${PROJECT_NAME} 开始发布" "$content" "false"
      ;;
    success)
      local content="### ✅ ${PROJECT_NAME} - 发布成功\n\n"
      content+="> **环境**: 生产环境\n"
      content+="> **时间**: ${timestamp}\n"
      content+="> **操作人**: ${DEPLOYER}\n"
      content+="> **耗时**: ${duration_text}\n"
      content+="> **前端地址**: http://${SERVER_IP}:${PORT_WEB}\n"
      content+="> **后端地址**: http://${SERVER_IP}:${PORT_API}\n"
      send_dingtalk "markdown" "${PROJECT_NAME} 发布成功" "$content" "false"
      ;;
    failed)
      local content="### ❌ ${PROJECT_NAME} - 发布失败\n\n"
      content+="> **环境**: 生产环境\n"
      content+="> **时间**: ${timestamp}\n"
      content+="> **操作人**: ${DEPLOYER}\n"
      content+="> **错误信息**: ${error_msg}\n\n"
      content+="@请相关同学检查！"
      send_dingtalk "markdown" "${PROJECT_NAME} 发布失败" "$content" "true"
      ;;
  esac
}

# 错误处理
error_exit() {
  echo "错误: $1"
  send_deploy_notify "failed" "$1"
  exit 1
}

# 捕获错误
trap 'error_exit "部署脚本执行失败"' ERR

# 测试钉钉通知
if [ "$1" = "test" ]; then
  echo "测试钉钉通知..."
  send_dingtalk "text" "测试" "📢 钉钉机器人连接测试成功！" "false"
  exit 0
fi

# 开始部署
echo "========================================="
echo "  ${PROJECT_NAME} 部署开始"
echo "========================================="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "操作人: ${DEPLOYER}"
echo "========================================="

# 发送开始通知
send_deploy_notify "start"

# 拉取最新代码
echo ""
echo ">>> 拉取最新代码..."
cd "$PROJECT_DIR" || error_exit "无法进入项目目录"
git pull || error_exit "Git 拉取失败"

# 构建镜像
echo ""
echo ">>> 构建 Docker 镜像..."
docker build -t $IMAGE_NAME:latest "$PROJECT_DIR" || error_exit "Docker 构建失败"

# 停止并删除旧容器
echo ""
echo ">>> 停止旧容器..."
docker stop $IMAGE_NAME 2>/dev/null || true
docker rm $IMAGE_NAME 2>/dev/null || true

# 启动新容器
echo ""
echo ">>> 启动新容器..."
docker run -d \
  --name $IMAGE_NAME \
  --env-file "$ENV_FILE" \
  -p ${PORT_WEB}:80 \
  -p ${PORT_API}:8899 \
  --restart unless-stopped \
  $IMAGE_NAME:latest || error_exit "容器启动失败"

# 等待服务启动
echo ""
echo ">>> 等待服务启动..."
sleep 5

# 健康检查
echo ""
echo ">>> 健康检查..."
if curl -f -s "http://localhost:${PORT_API}/health" > /dev/null; then
  echo "✓ 后端服务正常"
else
  error_exit "后端服务健康检查失败"
fi

if curl -f -s "http://localhost:${PORT_WEB}" > /dev/null; then
  echo "✓ 前端服务正常"
else
  echo "⚠ 前端服务可能需要更多时间启动"
fi

# 清理旧镜像
echo ""
echo ">>> 清理旧镜像..."
docker image prune -f

# 发送成功通知
send_deploy_notify "success"

echo ""
echo "========================================="
echo "  ${PROJECT_NAME} 部署完成"
echo "========================================="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "访问地址:"
echo "  前端: http://${SERVER_IP}:${PORT_WEB}"
echo "  后端: http://${SERVER_IP}:${PORT_API}"
echo "========================================="
