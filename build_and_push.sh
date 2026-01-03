#!/bin/bash

# Docker 镜像构建和推送脚本
# 自动生成时间戳并执行构建、打标签、推送三个步骤

set -e  # 遇到错误立即退出

# 生成时间戳（格式：YYYYMMDDHHmm，例如：202512211500）
TIMESTAMP=$(date +%Y%m%d%H%M)

# 镜像名称
IMAGE_NAME="fabulove:${TIMESTAMP}"
REGISTRY_IMAGE="registry.cn-hangzhou.aliyuncs.com/great_free/fabulove:${TIMESTAMP}"

echo "=========================================="
echo "开始构建和推送 Docker 镜像"
echo "时间戳: ${TIMESTAMP}"
echo "镜像名称: ${IMAGE_NAME}"
echo "注册表镜像: ${REGISTRY_IMAGE}"
echo "=========================================="
echo ""

# 步骤 1: 构建镜像
echo "步骤 1/3: 正在构建镜像..."
docker buildx build -t "${IMAGE_NAME}" --platform=linux/amd64 -f docker/Dockerfile .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败！"
    exit 1
fi
echo "✅ 镜像构建成功"
echo ""

# 步骤 2: 打标签
echo "步骤 2/3: 正在打标签..."
docker tag "${IMAGE_NAME}" "${REGISTRY_IMAGE}"

if [ $? -ne 0 ]; then
    echo "❌ 打标签失败！"
    exit 1
fi
echo "✅ 标签创建成功"
echo ""

# 步骤 3: 推送镜像
echo "步骤 3/3: 正在推送镜像到注册表..."
docker push "${REGISTRY_IMAGE}"

if [ $? -ne 0 ]; then
    echo "❌ 镜像推送失败！"
    exit 1
fi
echo "✅ 镜像推送成功"
echo ""

echo "=========================================="
echo "🎉 所有步骤完成！"
echo "镜像已成功推送到: ${REGISTRY_IMAGE}"
echo "=========================================="
