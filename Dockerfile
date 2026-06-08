# Etapa 1: Dependencias
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inyectamos variables de entorno para que Next.js compile las páginas estáticas/dinámicas correctamente
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBRSQ9bwbGoZ5YbH_OCLOmIJW3uoHIt600
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ampa-connect.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=ampa-connect
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ampa-connect.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=221118668519
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:221118668519:web:1d5576c3fee55124344c42

RUN npm run build

# Etapa 3: Producción
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0



RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
