FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]