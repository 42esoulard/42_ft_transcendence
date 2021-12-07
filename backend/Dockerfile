ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /usr/src/app

# RUN npm install -g @nestjs/cli

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json ./

# RUN npm install
# USER node

## Ressource pour installer un nouveau projet nestjs
# npm install -g @nestjs/cli
# nest new .
# npm run start:dev