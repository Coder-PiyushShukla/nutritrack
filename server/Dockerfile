# ==========================================
# 🌿 NutriTrack Backend — Production Dockerfile
# ==========================================
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY scripts/ ./scripts/

EXPOSE 5000

CMD ["node", "src/server.js"]
