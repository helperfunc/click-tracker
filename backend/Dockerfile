# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript config and source
COPY tsconfig.json ./
COPY src ./src

# Install TypeScript and build
RUN npm install -g typescript
RUN tsc

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]