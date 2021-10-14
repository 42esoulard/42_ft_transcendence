FROM openjdk:8-jre-alpine

WORKDIR /usr/src/app
USER root

RUN apk add --update npm nodejs-current \
    && apk add inotify-tools

ENV ALPINE_MIRROR "http://dl-cdn.alpinelinux.org/alpine"
RUN echo "${ALPINE_MIRROR}/v3.11/main/" >> /etc/apk/repositories
RUN apk add nodejs --repository="http://dl-cdn.alpinelinux.org/alpine/v3.11/main/"
RUN node --version

ENTRYPOINT cd /usr/src/app/frontend/sdk \
    && sh sdkWatcher.sh

