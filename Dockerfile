FROM node:24-alpine AS runner
WORKDIR /app

# Executa com usuário não-root (Princípio do Menor Privilégio)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 mcfuser

COPY package.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

USER mcfuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "--experimental-strip-types", "src/server/app-server.ts"]
