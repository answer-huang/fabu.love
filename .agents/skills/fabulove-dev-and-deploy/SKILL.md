---
name: fabulove-dev-and-deploy
description: >-
  Standard operating procedure (SOP) for starting fabu.love locally (frontend,
  backend, and MongoDB), building and pushing Docker images to Aliyun ACR, and
  deploying updates via SSH to the remote server. Use when the user asks to
  start the project locally, build or push a Docker image, or deploy/release
  fabu.love to the server.
---

# fabu.love Local Development, Docker Build & Deployment SOP

## 1. Local Full-Stack Startup

When starting the project locally, always start **MongoDB**, **Backend (`server`)**, and **Frontend (`client`)**:

1. **Start MongoDB (`27017`)**:
   ```bash
   cd docker && docker compose up -d mongo
   ```
2. **Prepare & Start Backend (`server`, port `9898`)**:
   - Ensure upload directories exist: `mkdir -p docker/upload/temp docker/upload/upload`
   - Install dependencies if missing:
     ```bash
     cd server
     npm install --ignore-scripts --no-package-lock
     npx @mapbox/node-pre-gyp install --directory node_modules/bcrypt --update-binary
     npm install mkdirp@1.0.4 --no-save --ignore-scripts --no-package-lock
     ```
   - On Node.js >= 22/26, ensure `server/node_modules/babel-cli/lib/_babel-node.js` polyfills removed `util.isUndefined` and `util.isNull`, `server/node_modules/text2png/index.js` falls back to a valid 1x1 PNG buffer if `canvas` is not built, and `server/node_modules/fawn/index.js` delegates `Task().save/update/remove/run` directly to Mongoose 8 models.
   - Start backend server:
     ```bash
     cd server && npm start
     ```
   - Default local login account (seed if database is empty):
     - **Username**: `admin`
     - **Password**: `123456`
     - **Email**: `admin@fabu.love`
3. **Start Frontend (`client`, port `5173`)**:
   ```bash
   cd client && npm install --no-package-lock && npm run start
   ```

---

## 2. Docker Image Build & Aliyun Registry Push

Use `./build_and_push.sh` at the repository root, or run the steps manually:

- **Registry Endpoint**: `crpi-ybd4i5ioxjm9n86c.cn-shanghai.personal.cr.aliyuncs.com`
- **Namespace / Repo**: `answerhuang/fabulove`
- **Tag Format**: `YYYYMMDDHHmm` (`TIMESTAMP=$(date +%Y%m%d%H%M)`)

### Build & Push Commands
> Always include `--provenance=false` in `docker buildx build`; otherwise Aliyun ACR Personal Edition rejects the push with `unknown manifest class for application/vnd.oci.empty.v1+json`.

```bash
TIMESTAMP=$(date +%Y%m%d%H%M)
IMAGE_NAME="fabulove:${TIMESTAMP}"
REGISTRY_IMAGE="crpi-ybd4i5ioxjm9n86c.cn-shanghai.personal.cr.aliyuncs.com/answerhuang/fabulove:${TIMESTAMP}"

docker buildx build --provenance=false -t "${IMAGE_NAME}" --platform=linux/amd64 -f docker/Dockerfile .
docker tag "${IMAGE_NAME}" "${REGISTRY_IMAGE}"
docker push "${REGISTRY_IMAGE}"
```

If `docker push` fails with `insufficient_scope: authorization failed`, prompt the user to refresh login:
```bash
docker login --username=lai13544152930 crpi-ybd4i5ioxjm9n86c.cn-shanghai.personal.cr.aliyuncs.com
```

---

## 3. Remote Server Release & Restart

- **SSH Target**: `ssh root@101.132.71.170` (SSH private key is pre-configured)
- **Compose File**: `/home/fabu.love/docker/docker-compose.yml`

### Strict Guardrails
- **ONLY** update the `server` service's `image:` tag in `/home/fabu.love/docker/docker-compose.yml` and run `docker-compose up -d --build` in `/home/fabu.love/docker`.
- **NEVER** delete any files, containers, volumes, or directories on the remote server.

### Deployment Command
```bash
ssh -o BatchMode=yes root@101.132.71.170 "sed -i 's|image: crpi-ybd4i5ioxjm9n86c.cn-shanghai.personal.cr.aliyuncs.com/answerhuang/fabulove:.*|image: ${REGISTRY_IMAGE}|' /home/fabu.love/docker/docker-compose.yml && cd /home/fabu.love/docker && docker-compose up -d --build"
```
