ARG NODE_VERSION
FROM node:${NODE_VERSION} as build-stage

# RUN npm install -g http-server
# RUN npm install -g http-server

WORKDIR /usr/src/app

# RUN npm install -g @vue/cli

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json ./
COPY . .

# RUN npm install -g npm@7
# USER node

## Ressource pour installer un nouveau projet vue.js
# npm install -g @vue/cli
# vue create .
# vue upgrade

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]