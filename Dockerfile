FROM node:8.12.0-alpine

RUN \
  apk --no-cache add --virtual .rundeps \
    ca-certificates \
    curl \
    openssh-client \
    openssl

# setup app directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

# first copy only files needed for installing dependencies
COPY --chown=node:node yarn.lock package.json ./

USER node

# Install the things
RUN yarn install --frozen-lockfile
RUN yarn cache clean

# copy the rest
COPY --chown=node:node . /home/node/app/

EXPOSE 8080

CMD ["node", "server.js"]
