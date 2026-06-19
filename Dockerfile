# Build stage
FROM node:24 as build

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
COPY nginx.conf.template /nginx.conf.template

EXPOSE 80

CMD ["/bin/sh" , "-c" , "envsubst '$OPENFAAS_GATEWAY_URL' < /nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
