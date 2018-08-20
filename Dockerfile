FROM node:10-alpine

ARG NPM_AUTH_USERNAME
ARG NPM_AUTH_TOKEN

RUN apk upgrade --no-cache
RUN addgroup -S app
RUN adduser -S app -G app -u 999 -h /app/
RUN chown -R app:app /app/

USER 999
WORKDIR /app

COPY .npmrc /app/.npmrc
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci --production --no-optional --ignore-scripts
COPY . /app

RUN rm /app/.npmrc

CMD node index.js
