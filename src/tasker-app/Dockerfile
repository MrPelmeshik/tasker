FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --fund=false --progress=false
COPY . .

# Принимаем build arg для REACT_APP_API_BASE
ARG REACT_APP_API_BASE
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE

RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
# Создаем конфигурацию nginx для порта 3000
RUN echo 'server { listen 3000; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
