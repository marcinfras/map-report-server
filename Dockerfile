ARG NODE_VERSION=24-alpine

FROM node:$NODE_VERSION AS deps
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml .
RUN corepack enable && corepack install
RUN yarn install --immutable


FROM node:$NODE_VERSION AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack install
RUN yarn build:server


FROM node:$NODE_VERSION AS deploy
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && corepack install

RUN yarn workspaces focus --production \
    && rm -Rf /root/.yarn /tmp/node-compile-cache
COPY --from=builder /app/dist/ dist/

EXPOSE 3000
ENV NODE_ENV=production
CMD ["sh", "-c", "yarn migration:up && /usr/local/bin/node dist/index.js"]