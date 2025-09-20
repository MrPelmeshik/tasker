FROM alpine:alpine/node:20 AS build

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --fund=false --progress=false
COPY . .
RUN npm run build

WORKDIR /app

COPY --from=build /app/build /app
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
