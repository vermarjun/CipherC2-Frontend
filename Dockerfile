FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json .
RUN npm install

# Copy application code
COPY . .

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



