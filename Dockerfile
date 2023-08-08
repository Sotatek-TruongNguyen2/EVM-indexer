FROM node:18 AS builder

WORKDIR /app

COPY package.json /app

RUN yarn install

COPY . /app

RUN yarn build

FROM node:18

WORKDIR /app

COPY package.json ./

COPY --from=builder /app/dist ./dist

RUN yarn add express

EXPOSE 80 

CMD ["yarn", "start:prod"]