FROM node:22-bookworm-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema before install, so postinstall's `prisma generate` can find it
COPY prisma ./prisma


# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]