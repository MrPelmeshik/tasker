FROM node:20-alpine3.20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --fund=false --progress=false
COPY . .

# Принимаем build arg для REACT_APP_API_BASE
ARG REACT_APP_API_BASE
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE

RUN npm run build

FROM node:20-alpine3.20 AS runtime
WORKDIR /app
# Устанавливаем serve для статических файлов
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
# Используем serve с правильными опциями для SPA
# -s: single-page application mode (fallback to index.html)
# -l: listen port and host
# --cors: enable CORS
# --no-clipboard: don't copy URL to clipboard
# --no-compression: disable compression (может вызывать проблемы)
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:3000", "--cors", "--no-clipboard"]
