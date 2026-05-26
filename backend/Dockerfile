# Base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy server code
COPY server.js db.js ./

# Create log directory
RUN mkdir -p logs

# Expose gateway port
EXPOSE 5000

# Start gateway
CMD ["npm", "start"]
