# Dockerfile

# Stage 1: Build the application
# Use a Node.js base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the app's source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the Next.js app
RUN pnpm build

# Stage 2: Production image
# Use a minimal Node.js image for the final container
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "start"]