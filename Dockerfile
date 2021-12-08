FROM node:16-alpine
WORKDIR /action
COPY . .
RUN npm ci && npm run build
ENTRYPOINT ["node dist/index.js"]
