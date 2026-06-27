# Build stage
FROM node:24 AS build

WORKDIR /src

# Copy node project files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build


# Run stage
FROM nginx:1.25-alpine

# Copy built application
COPY --from=build /src/dist /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
