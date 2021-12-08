ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json ./

USER node
