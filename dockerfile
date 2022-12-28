FROM node:16.13-alpine AS BUILDER
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm run redoc
RUN npm run release -- -t node16-alpine
FROM node:16.13-alpine AS RUNNER
WORKDIR /app
COPY --from=BUILDER /app/out .
USER node
CMD ["/app/main"]
