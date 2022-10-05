FROM node:16.17.1-slim

RUN mkdir -p /code \
  && useradd --create-home --uid 1001 --user-group app \
  && chown --recursive app:app /home/app \
  && chown --recursive app:app /code

USER app

WORKDIR /code
COPY package.json yarn.lock ./
RUN yarn install

COPY config-overrides.js ./
COPY src ./src
COPY public ./public

ENTRYPOINT yarn start



