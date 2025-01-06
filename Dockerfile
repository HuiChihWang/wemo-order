FROM node:22-alpine
LABEL authors="gilbert.wang"

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the port NestJS listens on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]

