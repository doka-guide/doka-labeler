FROM node:16-alpine
WORKDIR /action
COPY . .
RUN npm ci && npm run build && ls -al dist
ENTRYPOINT [ "node dist/index.js" ]
