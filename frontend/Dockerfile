ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /usr/src/app

# RUN npm install -g @vue/cli

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json ./

USER node

## Ressource pour installer un nouveau projet vue.js
# npm install -g @vue/cli
# vue create .
# vue upgrade