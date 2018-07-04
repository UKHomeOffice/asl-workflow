FROM quay.io/ukhomeofficedigital/nodejs-base:v8

ARG NPM_AUTH_USERNAME
ARG NPM_AUTH_TOKEN

RUN npm install -g npm@6

COPY .npmrc /app/.npmrc
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci --production --no-optional
COPY . /app

RUN rm /app/.npmrc

USER 999

CMD node index.js
