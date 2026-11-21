# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY client/package*.json ./
RUN npm ci

# Copy frontend source
COPY client ./

# Build production bundle
RUN npm run build

# Stage 2: Nginx runtime
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY deploy/nginx/recipenest.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
