#!/bin/bash

# 遇到错误则自动退出
set -e

# 动态获取当前时间，格式：YYYYMMDDHHMM
TIMESTAMP=$(date +"%Y%m%d%H%M")
IMAGE_NAME="registry.cn-hangzhou.aliyuncs.com/great_free/fabulove"
TAG="${IMAGE_NAME}:${TIMESTAMP}"

echo "========================================"
echo "开始构建镜像: ${TAG}"
echo "========================================"
docker buildx build -t "${TAG}" --platform=linux/amd64 -f docker/Dockerfile .

echo "========================================"
echo "开始推送镜像: ${TAG}"
echo "========================================"
docker push "${TAG}"

echo "========================================"
echo "完成！镜像已推送到: ${TAG}"
echo "========================================"
