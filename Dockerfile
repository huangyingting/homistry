# Stage 1: Install dependencies & generate Prisma Client
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Stage 2: Build production Next.js bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Use PostgreSQL schema when DATABASE_PROVIDER=postgresql is requested at build time
ARG DATABASE_PROVIDER=sqlite
RUN if [ "$DATABASE_PROVIDER" = "postgresql" ]; then \
      npx prisma generate --schema=prisma/schema.postgresql.prisma; \
    else \
      npx prisma generate --schema=prisma/schema.prisma; \
    fi
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start"]
