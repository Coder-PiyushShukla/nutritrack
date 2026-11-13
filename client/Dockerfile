# ==========================================
# 🌿 NutriTrack Frontend — Multi-Stage Dockerfile
# Stage 1: Build Vite & TypeScript assets
# Stage 2: Production Nginx High-Performance Server
# ==========================================

# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# 2. Production Server Stage
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built artifacts from builder
COPY --from=builder /app/dist ./

# Custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

