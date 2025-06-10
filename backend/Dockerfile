FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./dist/generated

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]