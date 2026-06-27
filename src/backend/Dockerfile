# ── development (dùng local docker-compose) ──
FROM node:22-alpine AS development
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install
COPY . .
EXPOSE 3000
CMD ["yarn", "run", "start:dev"]

# ── builder ──
FROM development AS builder
RUN yarn build

# ── production (dùng Railway) ──
FROM node:22-alpine AS production
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
