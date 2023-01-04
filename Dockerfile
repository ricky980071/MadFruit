FROM node:16-alpine

EXPOSE 4000

COPY . /app
WORKDIR /app

RUN corepack enable
RUN yarn install:all
RUN yarn build

ENV NODE_ENV production

CMD ["yarn", "deploy"]