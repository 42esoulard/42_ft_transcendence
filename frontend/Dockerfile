ARG NODE_VERSION
FROM node:${NODE_VERSION} as build-stage

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json ./
COPY . .

RUN npm install --production

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]