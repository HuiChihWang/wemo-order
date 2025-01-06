FROM node:22-alpine AS build
LABEL authors="gilbert.wang"

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build


FROM node:22-alpine AS runtime

WORKDIR /app

# Copy the built NestJS app from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Expose the port NestJS listens on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
