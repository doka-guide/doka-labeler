FROM node:16-alpine
COPY . /github/image-src
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
