# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# Production stage
FROM node:20-alpine
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma

USER nodejs
EXPOSE 5000

RUN mkdir -p /data && chown nodejs:nodejs /data
VOLUME ["/data"]

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
