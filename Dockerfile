# Use the official Node.js 18 LTS image as the base
FROM node:22-alpine AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Start a new stage for production
FROM node:18-alpine AS production

# Set the working directory inside the container
WORKDIR /app

# Copy the built app from the previous stage
COPY --from=base /app ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npm", "run", "start"]
