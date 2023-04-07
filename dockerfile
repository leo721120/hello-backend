FROM node:18.5-alpine AS BUILDER
WORKDIR /app
COPY . .
RUN apk update
RUN apk add --no-cache python3 make g++
RUN npm ci
RUN npm run build
RUN npm run redoc
RUN npm run release -- -t node18-alpine
FROM alpine:3.15 AS RUNNER
WORKDIR /app
COPY --from=BUILDER /app/bin .
CMD ["/app/main"]
