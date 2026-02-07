# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S healthconnect -u 1001

WORKDIR /app

# Copy installed dependencies from base stage
COPY --from=base --chown=healthconnect:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=healthconnect:nodejs . .

# Build the application
RUN npm run build

# Switch to non-root user
USER healthconnect

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]